<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\CouponRequest;
use App\Http\Resources\V1\Admin\CouponResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Exception;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:created_at,code,value,type,status,coupon_type,valid_from,valid_to,usage_count,usage_limit',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $query = Coupon::when(
                $validated['search'] ?? null,
                fn($q, $search) => $q->where('code', 'like', "%$search%")
            )
                ->orderBy($validated['sort'] ?? 'created_at', $validated['order'] ?? 'desc');

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $coupons = $query->paginate($perPage);

            return response()->json([
                'result' => true,
                'message' => __('Coupons retrieved successfully.'),
                'coupons' => CouponResource::collection($coupons),
                'pagination' => new PaginationResource($coupons),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve coupon data.'), $e);
        }
    }

    public function show(Coupon $coupon)
    {
        $coupon->load('coupon');

        return response()->json([
            'result' => true,
            'message' => __('Coupon found successfully.'),
            'coupon' => new CouponResource($coupon),
        ]);
    }

    public function store(CouponRequest $request)
    {
        try {
            DB::beginTransaction();

            $coupon = Coupon::create($request->validated());

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Coupon created successfully.'),
                'coupon' => new CouponResource($coupon),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create coupon.'), $e);
        }
    }

    public function update(CouponRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $coupon = Coupon::findOrFail($id);
            $coupon->update($request->validated());

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Coupon updated successfully.'),
                'coupon' => new CouponResource($coupon),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update coupon.'), $e);
        }
    }

    public function destroy(Coupon $coupon)
    {
        try {
            $coupon->delete();

            return response()->json([
                'result' => true,
                'message' => __('Coupon deleted successfully.'),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to delete coupon.'), $e);
        }
    }

    public function checkUsability(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|exists:coupons,code',
        ], [
            'code.required' => __('The code field is required.'),
            'code.string' => __('The code must be a string.'),
            'code.exists' => __('The provided code does not exist.'),
        ]);

        $coupon = Coupon::where('code', $validated['code'])->first();
        [$canUse, $reason] = $coupon->canBeUsed();

        if (!$canUse) {
            return response()->json([
                'result' => false,
                'message' => __($reason),
            ], 200);
        }

        return response()->json([
            'result' => true,
            'message' => __('Coupon can be used.'),
            'coupon' => new CouponResource($coupon),
        ]);
    }
}
