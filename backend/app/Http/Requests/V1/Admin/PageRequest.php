<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class PageRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $pageId = $this->route('page');

        $rules = [
            'title' => 'required|array',
            'content' => 'required|array',
        ];

        $locales = config('app.locales', ['en']);

        foreach ($locales as $locale) {
            $rules["title.$locale"] = [
                'required',
                'string',
                'max:255',
                "unique:pages,title->$locale," . ($pageId ?? 'NULL'),
            ];

            $rules["content.$locale"] = [
                'required',
                'string',
            ];
        }

        return $rules;
    }

    public function messages()
    {
        $messages = [
            'title.required' => __(':attribute is required.', ['attribute' => __('Title')]),
            'title.array'    => __(':attribute must be an array.', ['attribute' => __('Title')]),
            'content.required'=> __(':attribute is required.', ['attribute' => __('Content')]),
            'content.array'   => __(':attribute must be an array.', ['attribute' => __('Content')]),
        ];

        $locales = config('app.locales', ['en']);

        foreach ($locales as $locale) {
            $messages["title.$locale.required"] = __(':attribute is required.', ['attribute' => __('Title (:locale)', ['locale' => strtoupper($locale)])]);
            $messages["title.$locale.string"]   = __(':attribute must be a string.', ['attribute' => __('Title (:locale)', ['locale' => strtoupper($locale)])]);
            $messages["title.$locale.max"]      = __(':attribute may not be greater than :max characters.', ['attribute' => __('Title (:locale)', ['locale' => strtoupper($locale)]), 'max' => 255]);
            $messages["title.$locale.unique"]   = __(':attribute must be unique.', ['attribute' => __('Title (:locale)', ['locale' => strtoupper($locale)])]);

            $messages["content.$locale.required"] = __(':attribute is required.', ['attribute' => __('Content (:locale)', ['locale' => strtoupper($locale)])]);
            $messages["content.$locale.string"]   = __(':attribute must be a string.', ['attribute' => __('Content (:locale)', ['locale' => strtoupper($locale)])]);
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
