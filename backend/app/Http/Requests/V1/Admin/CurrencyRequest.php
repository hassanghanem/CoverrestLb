<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class CurrencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $currencyId = $this->route('currency');

        $rules = [
            'code' => [
                'required',
                'string',
                'max:3',
                'unique:currencies,code,' . ($currencyId ?? 'NULL'),
            ],
            'name' => 'required|array',
            'symbol' => 'nullable|string|max:10',
            'exchange_rate' => 'required|numeric|min:0',
            'is_default' => 'boolean',
        ];

        $locales = config('app.locales', ['en']);

        foreach ($locales as $locale) {
            $rules["name.$locale"] = [
                'required',
                'string',
                'max:255',
                "unique:currencies,name->$locale," . ($currencyId ?? 'NULL'),
            ];
        }

        return $rules;
    }
    public function messages(): array
    {
        $messages = [
            // Code validation
            'code.required' => __(':attribute is required.', ['attribute' => __('Code')]),
            'code.string'   => __(':attribute must be a string.', ['attribute' => __('Code')]),
            'code.max'      => __(':attribute may not be greater than :max characters.', ['attribute' => __('Code'), 'max' => 3]),
            'code.unique'   => __(':attribute has already been taken.', ['attribute' => __('Code')]),

            // Name array root
            'name.required' => __(':attribute is required.', ['attribute' => __('Name')]),

            // Symbol
            'symbol.string' => __(':attribute must be a string.', ['attribute' => __('Symbol')]),
            'symbol.max'    => __(':attribute may not be greater than :max characters.', ['attribute' => __('Symbol'), 'max' => 10]),

            // Exchange rate
            'exchange_rate.required' => __(':attribute is required.', ['attribute' => __('Exchange Rate')]),
            'exchange_rate.numeric'  => __(':attribute must be a number.', ['attribute' => __('Exchange Rate')]),
            'exchange_rate.min'      => __(':attribute must be at least :min.', ['attribute' => __('Exchange Rate'), 'min' => 0]),

            // Boolean
            'is_default.boolean' => __(':attribute must be true or false.', ['attribute' => __('Default Status')]),
        ];

        $locales = config('app.locales', ['en']);

        foreach ($locales as $locale) {
            $messages["name.$locale.required"] = __(':attribute is required.', [
                'attribute' => __('Name (:locale)', ['locale' => $locale])
            ]);
            $messages["name.$locale.string"] = __(':attribute must be a string.', [
                'attribute' => __('Name (:locale)', ['locale' => $locale])
            ]);
            $messages["name.$locale.max"] = __(':attribute may not be greater than :max characters.', [
                'attribute' => __('Name (:locale)', ['locale' => $locale]),
                'max' => 255
            ]);
            $messages["name.$locale.unique"] = __(':attribute has already been taken.', [
                'attribute' => __('Name (:locale)', ['locale' => $locale])
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
