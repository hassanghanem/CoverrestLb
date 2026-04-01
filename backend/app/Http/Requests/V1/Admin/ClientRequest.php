<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class ClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clientId = $this->route('client');

        return [
            'name'       => 'required|string|max:100',
            'gender'     => 'nullable|in:male,female,other',
            'birthdate'  => 'nullable|date',
            'phone'      => 'nullable|string|max:20|unique:clients,phone,' . ($clientId ?? 'NULL'),
            'email'      => 'required|email|max:150|unique:clients,email,' . ($clientId ?? 'NULL'),
            'is_active'  => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => __(':attribute is required.', ['attribute' => __('Name')]),
            'name.string'   => __(':attribute must be a string.', ['attribute' => __('Name')]),
            'name.max'      => __(':attribute may not be greater than :max characters.', ['attribute' => __('Name'), 'max' => 100]),

            'gender.in'     => __(':attribute must be one of the following: :values.', ['attribute' => __('Gender'), 'values' => 'male, female, other']),

            'birthdate.date' => __(':attribute must be a valid date.', ['attribute' => __('Birthdate')]),

            'phone.string'  => __(':attribute must be a string.', ['attribute' => __('Phone')]),
            'phone.max'     => __(':attribute may not be greater than :max characters.', ['attribute' => __('Phone'), 'max' => 20]),
            'phone.unique'  => __(':attribute has already been taken.', ['attribute' => __('Phone')]),

            'email.required' => __(':attribute is required.', ['attribute' => __('Email')]),
            'email.email'    => __(':attribute must be a valid email address.', ['attribute' => __('Email')]),
            'email.max'      => __(':attribute may not be greater than :max characters.', ['attribute' => __('Email'), 'max' => 150]),
            'email.unique'   => __(':attribute has already been taken.', ['attribute' => __('Email')]),

            'is_active.boolean' => __(':attribute must be true or false.', ['attribute' => __('Active Status')]),
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
