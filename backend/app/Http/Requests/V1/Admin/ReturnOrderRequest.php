<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class ReturnOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Use policy or auth logic as needed
    }

    public function rules(): array
    {
        return [
            'order_id' => 'required|exists:orders,id',
            'reason'   => 'nullable|string|max:1000',
            'products' => 'nullable|array',
            'products.*.variant_id' => 'required|exists:variants,id',
            'products.*.quantity'   => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'order_id.required' => __(':attribute is required.', ['attribute' => __('Order ID')]),
            'order_id.exists'   => __(':attribute does not exist.', ['attribute' => __('Order ID')]),

            'reason.string' => __(':attribute must be a string.', ['attribute' => __('Reason')]),
            'reason.max'    => __(':attribute may not be greater than :max characters.', ['attribute' => __('Reason'), 'max' => 1000]),

            'products.array' => __(':attribute must be an array.', ['attribute' => __('Products')]),

            'products.*.variant_id.required' => __(':attribute is required.', ['attribute' => __('Variant ID')]),
            'products.*.variant_id.exists'   => __(':attribute does not exist.', ['attribute' => __('Variant ID')]),

            'products.*.quantity.required' => __(':attribute is required.', ['attribute' => __('Quantity')]),
            'products.*.quantity.integer'  => __(':attribute must be an integer.', ['attribute' => __('Quantity')]),
            'products.*.quantity.min'      => __(':attribute must be at least :min.', ['attribute' => __('Quantity'), 'min' => 1]),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new ValidationException($validator, response()->json([
            'result'  => false,
            'message' => __('Validation failed'),
            'errors'  => $validator->errors()
        ], 200));
    }
}
