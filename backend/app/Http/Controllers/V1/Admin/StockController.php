<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Http\Resources\V1\Admin\StockResource;
use App\Models\StockAdjustment;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Validate query parameters
            $validated = $request->validate([
                'search'   => 'nullable|string|max:255',
                'sort'     => 'nullable|in:quantity,created_at,updated_at,warehouse_name,sku',
                'order'    => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ]);

            // Base query with aggregation - get all variant-warehouse combinations
            $query = DB::table('variants')
                ->crossJoin('warehouses')
                ->leftJoin('stock_adjustments', function ($join) {
                    $join->on('variants.id', '=', 'stock_adjustments.variant_id')
                        ->on('warehouses.id', '=', 'stock_adjustments.warehouse_id');
                })
                ->select(
                    'variants.id as variant_id',
                    'warehouses.id as warehouse_id',
                    DB::raw('COALESCE(SUM(stock_adjustments.quantity), 0) as quantity'),
                    DB::raw('MAX(stock_adjustments.created_at) as latest_created_at'),
                    DB::raw('MAX(stock_adjustments.updated_at) as latest_updated_at')
                )
                ->groupBy('variants.id', 'warehouses.id');

            // Search by SKU or Warehouse name
            if (!empty($validated['search'])) {
                $searchTerm = $validated['search'];
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('variants.sku', 'like', "%{$searchTerm}%")
                        ->orWhere('warehouses.name', 'like', "%{$searchTerm}%");
                });
            }

            // Sorting
            $sort = $validated['sort'] ?? 'sku';
            $order = $validated['order'] ?? 'asc';

            switch ($sort) {
                case 'quantity':
                    $query->orderBy('quantity', $order);
                    break;

                case 'created_at':
                    $query->orderByRaw("COALESCE(latest_created_at, variants.created_at) {$order}");
                    break;

                case 'updated_at':
                    $query->orderByRaw("COALESCE(latest_updated_at, variants.updated_at) {$order}");
                    break;

                case 'warehouse_name':
                    $query->orderBy('warehouses.name', $order);
                    break;

                case 'sku':
                    $query->orderBy('variants.sku', $order);
                    break;

                default:
                    $query->orderBy('variants.sku', $order);
                    break;
            }

            // Pagination
            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $rawStocks = $query->paginate($perPage);

            // Transform raw results to load relationships
            $stocks = $rawStocks->through(function ($stock) {
                $stockAdjustment = new StockAdjustment();
                $stockAdjustment->variant_id = $stock->variant_id;
                $stockAdjustment->warehouse_id = $stock->warehouse_id;
                $stockAdjustment->quantity = $stock->quantity;
                $stockAdjustment->created_at = $stock->latest_created_at;
                $stockAdjustment->updated_at = $stock->latest_updated_at;
                
                // Load relationships
                $stockAdjustment->load([
                    'variant.product',
                    'variant.color',
                    'variant.size',
                    'warehouse',
                ]);
                
                return $stockAdjustment;
            });

            return response()->json([
                'result' => true,
                'message' => __('Stocks retrieved successfully.'),
                'stocks' => StockResource::collection($stocks),
                'pagination' => new PaginationResource($stocks),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve stocks.'), $e);
        }
    }
}
