<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class VariantImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'arrangement' => 'nullable|integer|min:1',
            'is_active'   => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'arrangement.integer' => __(':attribute must be an integer.', ['attribute' => __('Arrangement')]),
            'arrangement.min'     => __(':attribute must be at least :min.', ['attribute' => __('Arrangement'), 'min' => 1]),
            'is_active.boolean'   => __(':attribute must be true or false.', ['attribute' => __('Active Status')]),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new ValidationException($validator, response()->json([
            'result'  => false,
            'message' => __('Validation failed'),
            'errors'  => $validator->errors()
        ], 422));
    }
}
