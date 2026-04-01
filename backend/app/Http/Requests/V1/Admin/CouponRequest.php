<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class CouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $couponId = $this->route('coupon');

        $rules = [
            'code' => 'required|string|max:255|unique:coupons,code,' . ($couponId ?? 'NULL'),
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'min_order_amount' => 'nullable|numeric|min:0',
            'coupon_type' => 'required|integer|between:0,4',
            'client_id' => 'nullable|exists:clients,id',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
        ];

        if ($couponId) {
            $rules['status'] = 'required|integer|in:0,1,2,5';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'code.required' => __(':attribute is required.', ['attribute' => __('Code')]),
            'code.unique' => __(':attribute has already been taken.', ['attribute' => __('Code')]),

            'status.required' => __(':attribute is required.', ['attribute' => __('Status')]),
            'status.in' => __(':attribute is invalid.', ['attribute' => __('Status')]),

            'type.required' => __(':attribute is required.', ['attribute' => __('Type')]),
            'type.in' => __(':attribute must be one of the following: :values.', ['attribute' => __('Type'), 'values' => 'fixed, percentage']),

            'value.required' => __(':attribute is required.', ['attribute' => __('Value')]),
            'value.numeric' => __(':attribute must be a number.', ['attribute' => __('Value')]),
            'value.min' => __(':attribute must be at least :min.', ['attribute' => __('Value'), 'min' => 0]),

            'usage_limit.integer' => __(':attribute must be an integer.', ['attribute' => __('Usage Limit')]),
            'usage_limit.min' => __(':attribute must be at least :min.', ['attribute' => __('Usage Limit'), 'min' => 1]),

            'min_order_amount.numeric' => __(':attribute must be a number.', ['attribute' => __('Minimum Order Amount')]),
            'min_order_amount.min' => __(':attribute must be at least :min.', ['attribute' => __('Minimum Order Amount'), 'min' => 0]),

            'coupon_type.required' => __(':attribute is required.', ['attribute' => __('Coupon Type')]),
            'coupon_type.integer' => __(':attribute must be an integer.', ['attribute' => __('Coupon Type')]),
            'coupon_type.between' => __(':attribute must be between :min and :max.', ['attribute' => __('Coupon Type'), 'min' => 0, 'max' => 4]),

            'client_id.exists' => __('Selected :attribute is invalid.', ['attribute' => __('Client')]),

            'valid_from.date' => __(':attribute must be a valid date.', ['attribute' => __('Valid From')]),
            'valid_to.date' => __(':attribute must be a valid date.', ['attribute' => __('Valid To')]),
            'valid_to.after_or_equal' => __(':attribute must be a date after or equal to :date.', ['attribute' => __('Valid To'), 'date' => __('Valid From')]),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new ValidationException($validator, response()->json([
            'result' => false,
            'message' => __('Validation failed'),
            'errors' => $validator->errors(),
        ], 200));
    }
}
