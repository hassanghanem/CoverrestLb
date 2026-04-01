<?php

namespace App\Http\Requests\V1\Client;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class ReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'rating'     => 'required|numeric|min:0|max:5',
            'comment'    => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => __(':attribute is required.', ['attribute' => __('Product')]),
            'product_id.exists'   => __(':attribute must exist.', ['attribute' => __('Product')]),

            'rating.required' => __(':attribute is required.', ['attribute' => __('Rating')]),
            'rating.numeric'  => __(':attribute must be a number.', ['attribute' => __('Rating')]),
            'rating.min'      => __(':attribute must be at least :min.', ['attribute' => __('Rating'), 'min' => 0]),
            'rating.max'      => __(':attribute may not be greater than :max.', ['attribute' => __('Rating'), 'max' => 5]),

            'comment.string' => __(':attribute must be a string.', ['attribute' => __('Comment')]),
            'comment.max'    => __(':attribute may not be greater than :max characters.', ['attribute' => __('Comment'), 'max' => 1000]),
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
