<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class ConfigurationRequest extends FormRequest
{
    protected array $configKeys = [
        'theme_color1',
        'theme_color2',
        'delivery_charge',
        'delivery_duration',
        'min_stock_alert',
        'store_name',
        'contact_email',
        'contact_phone',
        'store_address',
        'facebook_link',
        'instagram_link',
        'youtube_link',
        'tiktok_link',
        'cost_method',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [];

        foreach ($this->configKeys as $key) {
            switch ($key) {
                case 'theme_color1':
                case 'theme_color2':
                    $rules[$key] = 'nullable|string|max:7';
                    break;
                case 'delivery_charge':
                case 'delivery_duration':
                    $rules[$key] = 'nullable|numeric|min:0';
                    break;
                case 'min_stock_alert':
                    $rules[$key] = 'nullable|integer|min:1';
                    break;
                case 'contact_email':
                    $rules[$key] = 'nullable|email|max:255';
                    break;
                case 'contact_phone':
                    $rules[$key] = 'nullable|string|max:20';
                    break;
                case 'store_name':
                case 'store_address':
                    $rules[$key] = 'nullable|string|max:255';
                    break;
                case 'cost_method':
                    $rules[$key] = 'nullable|string|in:fifo,lifo,average';
                    break;
                default:
                    $rules[$key] = 'nullable|string|max:255';
            }
        }

        return $rules;
    }

    public function messages(): array
    {
        $messages = [];

        foreach ($this->configKeys as $key) {
            $max = match($key) {
                'theme_color1', 'theme_color2' => 7,
                'contact_phone' => 20,
                'contact_email' => 255,
                default => 255
            };

            $messages["{$key}.string"] = __(':attribute must be a string.', ['attribute' => __($this->humanize($key))]);
            $messages["{$key}.max"] = __(':attribute may not be greater than :max characters.', [
                'attribute' => __($this->humanize($key)),
                'max' => $max
            ]);
        }

        $messages['delivery_charge.numeric'] = __(':attribute must be a number.', ['attribute' => __('Delivery Charge')]);
        $messages['delivery_charge.min'] = __(':attribute must be at least :min.', ['attribute' => __('Delivery Charge'), 'min' => 0]);

        $messages['delivery_duration.numeric'] = __(':attribute must be a number.', ['attribute' => __('Delivery Duration')]);
        $messages['delivery_duration.min'] = __(':attribute must be at least :min.', ['attribute' => __('Delivery Duration'), 'min' => 0]);

        $messages['min_stock_alert.integer'] = __(':attribute must be an integer.', ['attribute' => __('Minimum Stock Alert')]);
        $messages['min_stock_alert.min'] = __(':attribute must be at least :min.', ['attribute' => __('Minimum Stock Alert'), 'min' => 1]);

        $messages['contact_email.email'] = __(':attribute must be a valid email address.', ['attribute' => __('Contact Email')]);

        return $messages;
    }

    private function humanize(string $key): string
    {
        return match($key) {
            'theme_color1' => 'Theme Color 1',
            'theme_color2' => 'Theme Color 2',
            'delivery_charge' => 'Delivery Charge',
            'delivery_duration' => 'Delivery Duration',
            'min_stock_alert' => 'Minimum Stock Alert',
            'store_name' => 'Store Name',
            'contact_email' => 'Contact Email',
            'contact_phone' => 'Contact Phone',
            'store_address' => 'Store Address',
            'facebook_link' => 'Facebook Link',
            'instagram_link' => 'Instagram Link',
            'youtube_link' => 'YouTube Link',
            'tiktok_link' => 'TikTok Link',
            'cost_method' => 'Cost Calculation Method',
            default => str_replace('_', ' ', ucfirst($key))
        };
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
