<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class StockAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'variant_id'    => ['required', 'exists:variants,id'],
            'warehouse_id'  => ['required', 'exists:warehouses,id'],
            'quantity'      => ['required', 'integer', 'min:1'],
            'direction'     => ['required', 'in:increase,decrease'],
            'cost_per_item' => ['nullable', 'numeric', 'min:0'],
            'reason'        => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'variant_id.required' => __(':attribute is required.', ['attribute' => __('Variant')]),
            'variant_id.exists'   => __(':attribute does not exist.', ['attribute' => __('Variant')]),

            'warehouse_id.required' => __(':attribute is required.', ['attribute' => __('Warehouse')]),
            'warehouse_id.exists'   => __(':attribute does not exist.', ['attribute' => __('Warehouse')]),

            'quantity.required' => __(':attribute is required.', ['attribute' => __('Quantity')]),
            'quantity.integer'  => __(':attribute must be an integer.', ['attribute' => __('Quantity')]),
            'quantity.min'      => __(':attribute must be at least :min.', ['attribute' => __('Quantity'), 'min' => 1]),

            'direction.required' => __(':attribute is required.', ['attribute' => __('Direction')]),
            'direction.in'       => __(':attribute must be either increase or decrease.', ['attribute' => __('Direction')]),

            'cost_per_item.numeric' => __(':attribute must be a number.', ['attribute' => __('Cost per item')]),
            'cost_per_item.min'     => __(':attribute must be at least :min.', ['attribute' => __('Cost per item'), 'min' => 0]),

            'reason.string' => __(':attribute must be a string.', ['attribute' => __('Reason')]),
            'reason.max'    => __(':attribute may not be greater than :max characters.', ['attribute' => __('Reason'), 'max' => 255]),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new ValidationException($validator, response()->json([
            'result' => false,
            'message' => __('Validation failed'),
            'errors' => $validator->errors()
        ], 200));
    }
}
