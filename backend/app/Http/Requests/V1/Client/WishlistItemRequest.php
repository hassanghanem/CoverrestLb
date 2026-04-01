<?php

namespace App\Http\Requests\V1\Client;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class WishlistItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|integer|exists:products,id',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => __(':attribute is required.', ['attribute' => __('Product')]),
            'product_id.integer'  => __(':attribute must be an integer.', ['attribute' => __('Product')]),
            'product_id.exists'   => __(':attribute must exist.', ['attribute' => __('Product')]),
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
