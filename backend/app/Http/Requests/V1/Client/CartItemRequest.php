<?php

namespace App\Http\Requests\V1\Client;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class CartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'variant_id' => 'required|integer|exists:variants,id',
            'quantity'   => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'variant_id.required' => __(':attribute is required.', ['attribute' => __('Variant')]),
            'variant_id.integer'  => __(':attribute must be an integer.', ['attribute' => __('Variant')]),
            'variant_id.exists'   => __(':attribute does not exist.', ['attribute' => __('Variant')]),

            'quantity.required'   => __(':attribute is required.', ['attribute' => __('Quantity')]),
            'quantity.integer'    => __(':attribute must be an integer.', ['attribute' => __('Quantity')]),
            'quantity.min'        => __(':attribute must be at least :min.', ['attribute' => __('Quantity'), 'min' => 1]),
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
