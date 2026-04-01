<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class PreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => 'required|exists:clients,id',
            'address_id' => 'required|exists:addresses,id',
            'coupon_code' => 'nullable|string|exists:coupons,code',
            'notes' => 'nullable|string|max:255',
            'payment_method' => 'required|string|max:255',
            'payment_status' => 'required|integer|between:0,3',
            'products' => 'required|array|min:1',
            'products.*.variant_id' => 'required|exists:variants,id',
            'products.*.quantity' => 'required|integer|min:1',
            'convert_to_order' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'client_id.required' => __(':attribute is required.', ['attribute' => __('Client')]),
            'client_id.exists'   => __(':attribute does not exist.', ['attribute' => __('Client')]),

            'address_id.required' => __(':attribute is required.', ['attribute' => __('Address')]),
            'address_id.exists'   => __(':attribute does not exist.', ['attribute' => __('Address')]),

            'coupon_code.string' => __(':attribute must be a string.', ['attribute' => __('Coupon Code')]),
            'coupon_code.exists' => __(':attribute does not exist.', ['attribute' => __('Coupon Code')]),

            'notes.string' => __(':attribute must be a string.', ['attribute' => __('Notes')]),
            'notes.max'    => __(':attribute may not be greater than :max characters.', ['attribute' => __('Notes'), 'max' => 255]),

            'payment_method.required' => __(':attribute is required.', ['attribute' => __('Payment Method')]),
            'payment_method.string'   => __(':attribute must be a string.', ['attribute' => __('Payment Method')]),
            'payment_method.max'      => __(':attribute may not be greater than :max characters.', ['attribute' => __('Payment Method'), 'max' => 255]),

            'payment_status.required' => __(':attribute is required.', ['attribute' => __('Payment Status')]),
            'payment_status.integer'  => __(':attribute must be an integer.', ['attribute' => __('Payment Status')]),
            'payment_status.between'  => __(':attribute must be between :min and :max.', ['attribute' => __('Payment Status'), 'min' => 0, 'max' => 3]),

            'products.required' => __(':attribute is required.', ['attribute' => __('Products')]),
            'products.array'    => __(':attribute must be an array.', ['attribute' => __('Products')]),
            'products.min'      => __(':attribute must have at least :min items.', ['attribute' => __('Products'), 'min' => 1]),

            'products.*.variant_id.required' => __(':attribute is required.', ['attribute' => __('Variant')]),
            'products.*.variant_id.exists'   => __(':attribute does not exist.', ['attribute' => __('Variant')]),

            'products.*.quantity.required' => __(':attribute is required.', ['attribute' => __('Quantity')]),
            'products.*.quantity.integer'  => __(':attribute must be an integer.', ['attribute' => __('Quantity')]),
            'products.*.quantity.min'      => __(':attribute must be at least :min.', ['attribute' => __('Quantity'), 'min' => 1]),

            'convert_to_order.boolean' => __(':attribute must be true or false.', ['attribute' => __('Convert to Order')]),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new ValidationException($validator, response()->json([
            'result'  => false,
            'message' => __('Validation failed'),
            'errors'  => $validator->errors(),
        ], 200));
    }
}
