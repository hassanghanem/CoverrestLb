<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class UserRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $userId = $this->route('user');
        $isCreate = $this->isMethod('post');

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . ($userId ? $userId->id : 'NULL') . ',id',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
            'is_active' => 'nullable|boolean',
        ];

        if ($isCreate) {
            $rules['password'] = ['required', 'string', 'min:8', 'confirmed'];
        } else {
            $rules['password'] = ['nullable', 'string', 'min:8', 'confirmed'];
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'name.required' => __('messages.validation.required', ['attribute' => __('messages.validation.attributes.name')]),
            'email.required' => __('messages.validation.required', ['attribute' => __('messages.validation.attributes.email')]),
            'password.min' => __('messages.validation.min.string', ['attribute' => __('messages.validation.attributes.password'), 'min' => 8]),
            'permissions.*.exists' => __('messages.validation.exists', ['attribute' => __('messages.validation.attributes.permissions')]),
            'is_active.boolean' => __('messages.validation.boolean', ['attribute' => __('messages.validation.attributes.is_active')]),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new ValidationException($validator, response()->json([
            'result' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 200));
    }
}
