<?php

namespace App\Http\Requests\V1\Client;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'    => 'required|string|max:100',
            'email'   => 'required|email|max:150',
            'phone'   => 'required|string|max:100',
            'subject' => 'required|string|max:200',
            'message' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => __(':attribute is required.', ['attribute' => __('Name')]),
            'name.string'      => __(':attribute must be a string.', ['attribute' => __('Name')]),
            'name.max'         => __(':attribute may not be greater than :max characters.', ['attribute' => __('Name'), 'max' => 100]),

            'email.required'   => __(':attribute is required.', ['attribute' => __('Email')]),
            'email.email'      => __(':attribute must be a valid email.', ['attribute' => __('Email')]),
            'email.max'        => __(':attribute may not be greater than :max characters.', ['attribute' => __('Email'), 'max' => 150]),

            'phone.required'   => __(':attribute is required.', ['attribute' => __('Phone')]),
            'phone.string'     => __(':attribute must be a string.', ['attribute' => __('Phone')]),
            'phone.max'        => __(':attribute may not be greater than :max characters.', ['attribute' => __('Phone'), 'max' => 100]),

            'subject.required' => __(':attribute is required.', ['attribute' => __('Subject')]),
            'subject.string'   => __(':attribute must be a string.', ['attribute' => __('Subject')]),
            'subject.max'      => __(':attribute may not be greater than :max characters.', ['attribute' => __('Subject'), 'max' => 200]),

            'message.required' => __(':attribute is required.', ['attribute' => __('Message')]),
            'message.string'   => __(':attribute must be a string.', ['attribute' => __('Message')]),
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
