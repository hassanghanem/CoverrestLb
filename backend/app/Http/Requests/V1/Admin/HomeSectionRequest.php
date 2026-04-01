<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class HomeSectionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'type' => 'required|string|max:50',
            'title' => 'required|array',
            'is_active' => 'nullable|boolean',
            'arrangement' => 'nullable|integer|min:1',

            'banners' => 'nullable|array',
            'banners.*.link' => 'nullable|string|max:255',
            'banners.*.title' => 'nullable|array',
            'banners.*.subtitle' => 'nullable|array',
            'banners.*.arrangement' => 'nullable|integer|min:1',
            'banners.*.is_active' => 'nullable|boolean',

            'product_section_items' => 'nullable|array',
            'product_section_items.*.product_id' => 'required|integer|exists:products,id',
            'product_section_items.*.arrangement' => 'nullable|integer|min:1',
            'product_section_items.*.is_active' => 'nullable|boolean',
        ];

        $locales = config('app.locales', ['en']);
        foreach ($locales as $locale) {
            $rules["title.$locale"] = 'required|string|max:255';
            $rules["banners.*.title.$locale"] = 'nullable|string|max:255';
            $rules["banners.*.subtitle.$locale"] = 'nullable|string|max:255';
        }

        $imageRule = [
            $this->isMethod('post') ? 'required' : 'nullable',
            'image',
            'mimes:jpeg,jpg,png,gif',
            'max:2048',
        ];

        $rules['banners.*.image'] = $imageRule;
        $rules['banners.*.image_mobile'] = $imageRule;

        return $rules;
    }

    public function messages()
    {
        $messages = [
            'type.required' => __(':attribute is required.', ['attribute' => __('Type')]),
            'type.string'   => __(':attribute must be a string.', ['attribute' => __('Type')]),
            'type.max'      => __(':attribute may not be greater than :max characters.', ['attribute' => __('Type'), 'max' => 50]),

            'is_active.boolean' => __(':attribute must be true or false.', ['attribute' => __('Active Status')]),
            'arrangement.integer' => __(':attribute must be an integer.', ['attribute' => __('Arrangement')]),
            'arrangement.min' => __(':attribute must be at least :min.', ['attribute' => __('Arrangement'), 'min' => 1]),

            'banners.*.link.string' => __(':attribute must be a string.', ['attribute' => __('Link')]),
            'banners.*.link.max' => __(':attribute may not be greater than :max characters.', ['attribute' => __('Link'), 'max' => 255]),

            'banners.*.image.required' => __(':attribute is required.', ['attribute' => __('Banner Image')]),
            'banners.*.image.mimes' => __(':attribute must be a file of type: jpeg, jpg, png, gif.', ['attribute' => __('Banner Image')]),
            'banners.*.image.max' => __(':attribute may not be greater than :max kilobytes.', ['attribute' => __('Banner Image'), 'max' => 2048]),
        ];

        $locales = config('app.locales', ['en']);
        foreach ($locales as $locale) {
            $messages["title.$locale.required"] = __(':attribute is required.', ['attribute' => __('Title (:locale)', ['locale' => strtoupper($locale)])]);
            $messages["title.$locale.string"] = __(':attribute must be a string.', ['attribute' => __('Title (:locale)', ['locale' => strtoupper($locale)])]);
            $messages["title.$locale.max"] = __(':attribute may not be greater than :max characters.', ['attribute' => __('Title (:locale)', ['locale' => strtoupper($locale)]), 'max' => 255]);

            $messages["banners.*.title.$locale.string"] = __(':attribute must be a string.', ['attribute' => __('Banner Title (:locale)', ['locale' => strtoupper($locale)])]);
            $messages["banners.*.title.$locale.max"] = __(':attribute may not be greater than :max characters.', ['attribute' => __('Banner Title (:locale)', ['locale' => strtoupper($locale)]), 'max' => 255]);

            $messages["banners.*.subtitle.$locale.string"] = __(':attribute must be a string.', ['attribute' => __('Banner Subtitle (:locale)', ['locale' => strtoupper($locale)])]);
            $messages["banners.*.subtitle.$locale.max"] = __(':attribute may not be greater than :max characters.', ['attribute' => __('Banner Subtitle (:locale)', ['locale' => strtoupper($locale)]), 'max' => 255]);
        }

        return $messages;
    }

    protected function failedValidation(Validator $validator)
    {
        throw new ValidationException($validator, response()->json([
            'result' => false,
            'message' => __('Validation failed'),
            'errors' => $validator->errors(),
        ], 200));
    }
}
