<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class TagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tagId = $this->route('tag');

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                'unique:tags,name,' . ($tagId ?? 'NULL'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => __(':attribute is required.', ['attribute' => __('Name')]),
            'name.string'   => __(':attribute must be a string.', ['attribute' => __('Name')]),
            'name.max'      => __(':attribute may not be greater than :max characters.', ['attribute' => __('Name'), 'max' => 100]),
            'name.unique'   => __(':attribute must be unique.', ['attribute' => __('Name')]),
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
