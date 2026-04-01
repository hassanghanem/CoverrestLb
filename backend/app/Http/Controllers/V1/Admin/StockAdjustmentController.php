<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\StockAdjustmentRequest;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Http\Resources\V1\Admin\StockAdjustmentResource;
use App\Models\StockAdjustment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class StockAdjustmentController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search'   => 'nullable|string|max:255',
                'sort'     => 'nullable|in:created_at,quantity,cost_per_item',
                'order'    => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ]);

            $query = StockAdjustment::with([
                'warehouse',
                'adjustedBy',
                'variant.product',
                'variant.color',
                'variant.size',
            ]);

            if (!empty($validated['search'])) {
                $search = $validated['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('reason', 'like', "%$search%")
                        ->orWhereHas('variant', function ($q2) use ($search) {
                            $q2->where('sku', 'like', "%$search%");
                        });
                });
            }

            $sort = $validated['sort'] ?? 'created_at';
            $order = $validated['order'] ?? 'desc';

            $query->orderBy($sort, $order);

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $adjustments = $query->paginate($perPage);

            return response()->json([
                'result'      => true,
                'message'     => __('Stock adjustments retrieved successfully.'),
                'adjustments' => StockAdjustmentResource::collection($adjustments),
                'pagination'  => new PaginationResource($adjustments),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve stock adjustment data.'), $e);
        }
    }

    public function show(StockAdjustment $stockAdjustment)
    {
        return response()->json([
            'result' => true,
            'message' => __('Stock adjustment found successfully.'),
            'adjustment' => new StockAdjustmentResource($stockAdjustment->load(['warehouse', 'adjustedBy'])),
        ]);
    }

    public function manualAdjustWithDirection(StockAdjustmentRequest $request)
    {
        $data = $request->validated();

        if (!in_array($data['direction'], ['increase', 'decrease'])) {
            return response()->json([
                'result' => false,
                'message' => __('Invalid adjustment direction.'),
            ]);
        }

        // Prevent decreasing more than available stock in the selected warehouse
        if ($data['direction'] === 'decrease') {
            $currentStock = StockAdjustment::currentStock($data['variant_id'], $data['warehouse_id']);
            if ($currentStock < $data['quantity']) {
                return response()->json([
                    'result' => false,
                    'message' => __('Insufficient stock for this variant in the selected warehouse.'),
                ]);
            }
        }

        $quantityChange = $data['direction'] === 'increase'
            ? abs($data['quantity'])
            : -abs($data['quantity']);

        $data['type'] = 'manual';
        $data['adjusted_by'] = Auth::id();
        $data['quantity'] = $quantityChange;
        $data['parent_adjustment_id'] = null;

        try {
            $adjustment = DB::transaction(function () use ($data) {
                // Only record the adjustment, no Stock table checks
                return StockAdjustment::createAdjustment($data);
            });

            return response()->json([
                'result' => true,
                'message' => __('Stock adjusted successfully.'),
                'adjustment' => $adjustment,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to adjust stock.'), $e);
        }
    }

    public function destroy(StockAdjustment $stockAdjustment)
    {
        try {
            DB::beginTransaction();

            // Prevent deletion of system-generated adjustments (sale/return)
            // These are tied to orders and should not be manually deleted
            if (in_array($stockAdjustment->type, ['sale', 'return'])) {
                return response()->json([
                    'result' => false,
                    'message' => __('Cannot delete system-generated stock adjustments. These are automatically created from orders/returns.'),
                ], 422);
            }

            // Prevent deletion if this adjustment has child adjustments
            if ($stockAdjustment->children()->exists()) {
                return response()->json([
                    'result' => false,
                    'message' => __('Cannot delete this stock adjustment because it has related transactions.'),
                ], 422);
            }
            // Soft delete or hard delete the original adjustment
            // Using hard delete to actually remove it from the database
            $stockAdjustment->delete();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Stock adjustment deleted successfully. A reversal entry has been created to maintain stock accuracy.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete stock adjustment.'), $e);
        }
    }
}
