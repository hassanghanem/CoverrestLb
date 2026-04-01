<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\CurrencyRequest;
use App\Http\Resources\V1\Admin\CurrencyResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Exception;

class CurrencyController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search'   => 'nullable|string|max:255',
                'sort'     => 'nullable|in:created_at,name,code,exchange_rate,is_default,symbol',
                'order'    => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $locales = config('app.locales', ['en']);

            $query = Currency::query()
                ->when(
                    $validated['search'] ?? null,
                    function ($query, $search) use ($locales) {
                        $query->where(function ($q) use ($search, $locales) {
                            foreach ($locales as $index => $locale) {
                                if ($index === 0) {
                                    $q->where("name->$locale", 'like', "%$search%");
                                } else {
                                    $q->orWhere("name->$locale", 'like', "%$search%");
                                }
                            }
                            $q->orWhere('code', 'like', "%$search%")
                              ->orWhere('symbol', 'like', "%$search%");
                        });
                    }
                )
                ->orderBy($validated['sort'] ?? 'created_at', $validated['order'] ?? 'desc');

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $currencies = $query->paginate($perPage);

            return response()->json([
                'result'      => true,
                'message'     => __('Currencies retrieved successfully.'),
                'currencies'  => CurrencyResource::collection($currencies),
                'pagination'  => new PaginationResource($currencies),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve currency data.'), $e);
        }
    }

    public function show(Currency $currency)
    {
        return response()->json([
            'result'   => true,
            'message'  => __('Currency found successfully.'),
            'currency' => new CurrencyResource($currency),
        ]);
    }

    public function store(CurrencyRequest $request)
    {
        try {
            DB::beginTransaction();

            $currency = Currency::create([
                'code'          => $request->input('code'),
                'name'          => $request->input('name'),
                'symbol'        => $request->input('symbol'),
                'exchange_rate' => $request->input('exchange_rate'),
                'is_default'    => $request->boolean('is_default', false),
            ]);

            DB::commit();

            return response()->json([
                'result'   => true,
                'message'  => __('Currency created successfully.'),
                'currency' => new CurrencyResource($currency),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create currency.'), $e);
        }
    }

    public function update(CurrencyRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $currency = Currency::findOrFail($id);
            $currency->fill($request->validated());

            if ($request->has('is_default')) {
                if ($request->boolean('is_default')) {
                    Currency::where('id', '!=', $currency->id)->update(['is_default' => false]);
                    $currency->is_default = true;
                } else {
                    $currency->is_default = false;
                    $firstOther = Currency::where('id', '!=', $currency->id)
                        ->orderBy('id')
                        ->first();
                    if ($firstOther) {
                        $firstOther->update(['is_default' => true]);
                    }
                }
            }

            $currency->save();
            DB::commit();

            return response()->json([
                'result'   => true,
                'message'  => __('Currency updated successfully.'),
                'currency' => new CurrencyResource($currency),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update currency.'), $e);
        }
    }

    public function destroy(Currency $currency)
    {
        try {
            if ($currency->is_default) {
                return response()->json([
                    'result'  => false,
                    'message' => __('Cannot delete the default currency.'),
                ]);
            }

            DB::beginTransaction();
            $currency->delete();
            DB::commit();

            return response()->json([
                'result'  => true,
                'message' => __('Currency deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete currency.'), $e);
        }
    }
}
