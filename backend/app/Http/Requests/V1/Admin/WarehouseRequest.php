<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class WarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $warehouseId = $this->route('warehouse');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:warehouses,name,' . ($warehouseId ?? 'NULL'),
            ],
            'location' => [
                'nullable',
                'string',
                'max:255',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => __(':attribute is required.', ['attribute' => __('Name')]),
            'name.string'   => __(':attribute must be a string.', ['attribute' => __('Name')]),
            'name.max'      => __(':attribute may not be greater than :max characters.', ['attribute' => __('Name'), 'max' => 255]),
            'name.unique'   => __(':attribute has already been taken.', ['attribute' => __('Name')]),

            'location.string' => __(':attribute must be a string.', ['attribute' => __('Location')]),
            'location.max'    => __(':attribute may not be greater than :max characters.', ['attribute' => __('Location'), 'max' => 255]),
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
