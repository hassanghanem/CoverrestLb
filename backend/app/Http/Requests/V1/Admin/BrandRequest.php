<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class BrandRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $brandId = $this->route('brand');

        return [
            'name' => 'required|string|max:100|unique:brands,name,' . ($brandId ?? 'NULL'),
            'is_active' => 'nullable|boolean',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => __(':attribute is required.', ['attribute' => __('Name')]),
            'name.string'   => __(':attribute must be a string.', ['attribute' => __('Name')]),
            'name.max'      => __(':attribute may not be greater than :max characters.', ['attribute' => __('Name'), 'max' => 100]),
            'name.unique'   => __(':attribute has already been taken.', ['attribute' => __('Name')]),
            'is_active.boolean' => __(':attribute must be true or false.', ['attribute' => __('Active Status')]),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new ValidationException($validator, response()->json([
            'result' => false,
            'message' => __('Validation failed'),
            'errors' => $validator->errors(),
        ]));
    }
}
