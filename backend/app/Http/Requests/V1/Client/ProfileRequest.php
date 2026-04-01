<?php

namespace App\Http\Requests\V1\Client;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => 'required|string|min:2|max:255',
            'gender'        => 'nullable|in:male,female,other',
            'birthdate'     => 'nullable|date',
         'phone' => [
    'nullable',
    'string',
    'max:20',
    Rule::unique('clients', 'phone')->ignore(
        optional($this->route('client'))->id ?? $this->user()->id
    ),
],
            'order_updates' => 'nullable|boolean',
            'newsletter'    => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => __(':attribute is required.', ['attribute' => __('Name')]),
            'name.string'       => __(':attribute must be a string.', ['attribute' => __('Name')]),
            'name.min'          => __(':attribute must be at least :min characters.', ['attribute' => __('Name'), 'min' => 2]),
            'name.max'          => __(':attribute may not be greater than :max characters.', ['attribute' => __('Name'), 'max' => 255]),

            'gender.in'         => __(':attribute must be one of the following: :values.', ['attribute' => __('Gender'), 'values' => 'male, female, other']),

            'birthdate.date'    => __(':attribute must be a valid date.', ['attribute' => __('Birthdate')]),

            'phone.string'      => __(':attribute must be a string.', ['attribute' => __('Phone')]),
            'phone.max'         => __(':attribute may not be greater than :max characters.', ['attribute' => __('Phone'), 'max' => 20]),

            'order_updates.boolean' => __(':attribute must be true or false.', ['attribute' => __('Order Updates')]),
            'newsletter.boolean'    => __(':attribute must be true or false.', ['attribute' => __('Newsletter')]),
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
