<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('category');

        $rules = [
            'name'        => 'required|array',
            'arrangement' => 'nullable|integer|min:0',
            'is_active'   => 'nullable|boolean',
        ];

        $locales = config('app.locales', ['en']);

        foreach ($locales as $locale) {
            $rules["name.$locale"] = [
                'required',
                'string',
                'max:255',
                "unique:categories,name->$locale," . ($categoryId ?? 'NULL'),
            ];
        }

        $rules['image'] = [
            $this->isMethod('post') ? 'required' : 'nullable',
            'image',
            'mimes:jpeg,jpg,png,gif',
            'max:2048',
        ];

        return $rules;
    }

    public function messages(): array
    {
        $messages = [
            'name.required'       => __(':attribute is required.', ['attribute' => __('Name')]),
            'image.required'      => __(':attribute is required.', ['attribute' => __('Image')]),
            'image.image'         => __(':attribute must be an image.', ['attribute' => __('Image')]),
            'image.mimes'         => __(':attribute must be a file of type: :values.', ['attribute' => __('Image'), 'values' => 'jpeg, jpg, png, gif']),
            'image.max'           => __(':attribute may not be greater than :max kilobytes.', ['attribute' => __('Image'), 'max' => 2048]),
            'arrangement.integer' => __(':attribute must be an integer.', ['attribute' => __('Arrangement')]),
            'arrangement.min'     => __(':attribute must be at least :min.', ['attribute' => __('Arrangement'), 'min' => 0]),
            'is_active.boolean'   => __(':attribute must be true or false.', ['attribute' => __('Active Status')]),
        ];

        $locales = config('app.locales', ['en']);

        foreach ($locales as $locale) {
            $messages["name.$locale.required"] = __(':attribute is required.', [
                'attribute' => __("Name (:locale)", ['locale' => $locale])
            ]);
            $messages["name.$locale.string"] = __(':attribute must be a string.', [
                'attribute' => __("Name (:locale)", ['locale' => $locale])
            ]);
            $messages["name.$locale.max"] = __(':attribute may not be greater than :max characters.', [
                'attribute' => __("Name (:locale)", ['locale' => $locale]),
                'max' => 255
            ]);
            $messages["name.$locale.unique"] = __(':attribute has already been taken.', [
                'attribute' => __("Name (:locale)", ['locale' => $locale])
            ]);
        }


        return $messages;
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
