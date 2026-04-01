<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class SizeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $sizeId = $this->route('size');

        $rules = [
            'name' => 'required|array',
        ];

        $locales = config('app.locales', ['en']);

        foreach ($locales as $locale) {
            $rules["name.$locale"] = [
                'required',
                'string',
                'max:255',
                "unique:sizes,name->$locale," . ($sizeId ?? 'NULL'),
            ];
        }

        return $rules;
    }

    public function messages(): array
    {
        $messages = [
            'name.required' => __(':attribute is required.', ['attribute' => __('Name')]),
        ];

        $locales = config('app.locales', ['en']);

        foreach ($locales as $locale) {
            $messages["name.$locale.required"] = __(':attribute is required.', [
                'attribute' => __('Name') . ' (' . __($locale) . ')'
            ]);
            $messages["name.$locale.string"] = __(':attribute must be a string.', [
                'attribute' => __('Name') . ' (' . __($locale) . ')'
            ]);
            $messages["name.$locale.max"] = __(':attribute may not be greater than :max characters.', [
                'attribute' => __('Name') . ' (' . __($locale) . ')',
                'max' => 255
            ]);
            $messages["name.$locale.unique"] = __(':attribute has already been taken.', [
                'attribute' => __('Name') . ' (' . __($locale) . ')'
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
