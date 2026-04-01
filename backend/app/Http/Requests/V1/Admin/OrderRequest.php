<?php

namespace App\Http\Requests\V1\Admin;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class OrderRequest extends FormRequest
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
            'coupon_code' => 'nullable|exists:coupons,code',
            'notes' => 'nullable|string|max:255',
            'payment_method' => 'required|string|max:255',
            'payment_status' => 'required|integer|between:0,3',
            'source' => 'nullable|string|in:' . implode(',', Order::SOURCES),
            'products' => 'required|array|min:1',
            'products.*.variant_id' => 'required|exists:variants,id',
            'products.*.quantity' => 'required|integer|min:1',
            'order_details' => 'nullable|array',
            'order_details.*.id' => 'nullable|integer|exists:order_details,id',
            'order_details.*.variant_id' => 'required_without:order_details.*.id|integer|exists:variants,id',
            'order_details.*.quantity' => 'required_without:order_details.*.id|integer|min:1',
            'order_details.*.warehouse_id' => 'required_with:order_details.*.variant_id|integer|exists:warehouses,id',
            'order_details.*.price' => 'nullable|numeric|min:0',
            'order_details.*.discount' => 'nullable|integer|min:0|max:100',
            'order_details.*.cost' => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'client_id.required' => __(':attribute is required.', ['attribute' => __('Client')]),
            'client_id.exists'   => __('The selected :attribute is invalid.', ['attribute' => __('Client')]),

            'address_id.required' => __(':attribute is required.', ['attribute' => __('Address')]),
            'address_id.exists'   => __('The selected :attribute is invalid.', ['attribute' => __('Address')]),

            'coupon_code.exists' => __('The selected :attribute is invalid.', ['attribute' => __('Coupon Code')]),

            'notes.string' => __(':attribute must be a string.', ['attribute' => __('Notes')]),
            'notes.max'    => __(':attribute may not be greater than :max characters.', ['attribute' => __('Notes'), 'max' => 255]),

            'payment_method.required' => __(':attribute is required.', ['attribute' => __('Payment Method')]),
            'payment_method.string'   => __(':attribute must be a string.', ['attribute' => __('Payment Method')]),
            'payment_method.max'      => __(':attribute may not be greater than :max characters.', ['attribute' => __('Payment Method'), 'max' => 255]),

            'payment_status.required' => __(':attribute is required.', ['attribute' => __('Payment Status')]),
            'payment_status.integer'  => __(':attribute must be an integer.', ['attribute' => __('Payment Status')]),
            'payment_status.between'  => __(':attribute is invalid.', ['attribute' => __('Payment Status')]),

            'products.required' => __(':attribute is required.', ['attribute' => __('Products')]),
            'products.array'    => __(':attribute must be an array.', ['attribute' => __('Products')]),
            'products.min'      => __('At least one :attribute is required.', ['attribute' => __('Products')]),

            'products.*.variant_id.required' => __(':attribute is required.', ['attribute' => __('Variant')]),
            'products.*.variant_id.exists'   => __('The selected :attribute is invalid.', ['attribute' => __('Variant')]),

            'products.*.quantity.required' => __(':attribute is required.', ['attribute' => __('Quantity')]),
            'products.*.quantity.integer'  => __(':attribute must be an integer.', ['attribute' => __('Quantity')]),
            'products.*.quantity.min'      => __(':attribute must be at least :min.', ['attribute' => __('Quantity'), 'min' => 1]),

            'order_details.*.id.exists' => __('One or more order items do not exist.'),
            'order_details.*.variant_id.required_without' => __('Variant is required when item id is not provided.'),
            'order_details.*.variant_id.exists' => __('One or more variants do not exist.'),
            'order_details.*.quantity.required_without' => __('Quantity is required when item id is not provided.'),
            'order_details.*.quantity.min' => __('Quantity must be at least 1.'),
            'order_details.*.warehouse_id.required_with' => __('Warehouse is required for each order detail.'),
            'order_details.*.warehouse_id.exists' => __('One or more selected warehouses do not exist.'),
            'order_details.*.price.min' => __('Price must be at least 0.'),
            'order_details.*.discount.max' => __('Discount cannot exceed 100.'),
            'order_details.*.cost.min' => __('Cost must be at least 0.'),
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
