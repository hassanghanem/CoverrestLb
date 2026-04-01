<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class AddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id'    => 'required|exists:clients,id',
            'city'         => 'required|string|max:191',
            'address'       => 'required|string|max:191',
            'recipient_name' => 'required|string|max:191',
            'phone_number' => 'required|string|max:20',
            'notes'        => 'nullable|string',
            'latitude'     => 'nullable|numeric|between:-90,90',
            'longitude'    => 'nullable|numeric|between:-180,180',
            'is_active'    => 'boolean',
            'is_default'   => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'client_id.required' => __(':attribute is required.', ['attribute' => __('Client')]),
            'client_id.exists'   => __('The selected :attribute is invalid.', ['attribute' => __('Client')]),
            'city.required'      => __(':attribute is required.', ['attribute' => __('City')]),
            'city.string'        => __(':attribute must be a string.', ['attribute' => __('City')]),
            'city.max'           => __(':attribute may not be greater than :max characters.', ['attribute' => __('City'), 'max' => 191]),
            'address.required'   => __(':attribute is required.', ['attribute' => __('Address')]),
            'address.string'     => __(':attribute must be a string.', ['attribute' => __('Address')]),
            'address.max'        => __(':attribute may not be greater than :max characters.', ['attribute' => __('Address'), 'max' => 191]),
            'recipient_name.required' => __(':attribute is required.', ['attribute' => __('Recipient Name')]),
            'recipient_name.string'   => __(':attribute must be a string.', ['attribute' => __('Recipient Name')]),
            'recipient_name.max'      => __(':attribute may not be greater than :max characters.', ['attribute' => __('Recipient Name'), 'max' => 191]),
            'phone_number.required' => __(':attribute is required.', ['attribute' => __('Phone Number')]),
            'phone_number.string'   => __(':attribute must be a string.', ['attribute' => __('Phone Number')]),
            'phone_number.max'      => __(':attribute may not be greater than :max characters.', ['attribute' => __('Phone Number'), 'max' => 20]),
            'notes.string'          => __(':attribute must be a string.', ['attribute' => __('Notes')]),
            'latitude.numeric'      => __(':attribute must be a number.', ['attribute' => __('Latitude')]),
            'latitude.between'      => __(':attribute must be between :min and :max.', ['attribute' => __('Latitude'), 'min' => -90, 'max' => 90]),
            'longitude.numeric'     => __(':attribute must be a number.', ['attribute' => __('Longitude')]),
            'longitude.between'     => __(':attribute must be between :min and :max.', ['attribute' => __('Longitude'), 'min' => -180, 'max' => 180]),
            'is_active.boolean'     => __(':attribute must be true or false.', ['attribute' => __('Active Status')]),
            'is_default.boolean'    => __(':attribute must be true or false.', ['attribute' => __('Default Status')]),
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
