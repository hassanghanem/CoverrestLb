<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

class PromotionalEmailRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [
            // Basic email content
            'subject' => 'required|string|min:3|max:255',
            'content' => ['sometimes', 'nullable', 'string', function ($attribute, $value, $fail) {
                // Skip validation if content is null, empty string, or only contains whitespace/HTML tags
                if ($value === null || $value === '' || trim(strip_tags($value)) === '') {
                    return;
                }
                
                $textContent = strip_tags($value);
                if (strlen(trim($textContent)) < 10) {
                    $fail('Email content must contain at least 10 characters of actual text.');
                }
            }],
            
            // Send type and recipients
            'send_type' => 'required|in:all,specific,products',
            
            // Test mode and scheduling
            'test_mode' => 'sometimes|boolean',
            'schedule_at' => 'sometimes|nullable|date|after:now',
        ];

        // Conditional validation based on send_type
        if ($this->input('send_type') === 'specific') {
            $rules['emails'] = 'required|array|min:1|max:1000';
            $rules['emails.*'] = 'required|email:rfc,dns|max:255';
        }

        if ($this->input('send_type') === 'products') {
            $rules['products'] = 'required|array|min:1|max:50';
            $rules['products.*.name'] = 'required|string|min:1|max:255';
            $rules['products.*.price'] = 'sometimes|nullable|numeric|min:0|max:999999.99';
            $rules['products.*.image'] = 'sometimes|nullable|url|max:2048';
            $rules['products.*.url'] = 'sometimes|nullable|url|max:2048';
        }

        // Promotion data validation (optional)
        if ($this->has('promotion_data')) {
            $rules['promotion_data'] = 'sometimes|array';
            $rules['promotion_data.discount_percentage'] = 'sometimes|nullable|numeric|min:0|max:100';
            $rules['promotion_data.promo_code'] = 'sometimes|nullable|string|max:50|regex:/^[A-Z0-9_-]+$/';
            $rules['promotion_data.valid_until'] = 'sometimes|nullable|date|after:today';
            $rules['promotion_data.minimum_order'] = 'sometimes|nullable|numeric|min:0|max:999999.99';
        }

        return $rules;
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            // Subject validation messages
            'subject.required' => 'Email subject is required.',
            'subject.min' => 'Email subject must be at least 3 characters long.',
            'subject.max' => 'Email subject cannot exceed 255 characters.',
            
            // Content validation messages
            'content.string' => 'Email content must be a valid text.',
            
            // Send type validation messages
            'send_type.required' => 'Please select how to send the email.',
            'send_type.in' => 'Invalid send type selected.',
            
            // Email validation messages
            'emails.required' => 'Email addresses are required when sending to specific recipients.',
            'emails.min' => 'At least one email address is required.',
            'emails.max' => 'You can send to a maximum of 1000 recipients at once.',
            'emails.*.email' => 'Please provide valid email addresses.',
            'emails.*.max' => 'Email address is too long.',
            
            // Products validation messages
            'products.required' => 'At least one product is required for product-based campaigns.',
            'products.min' => 'At least one product must be added.',
            'products.max' => 'You can feature a maximum of 50 products per email.',
            'products.*.name.required' => 'Product name is required.',
            'products.*.name.min' => 'Product name cannot be empty.',
            'products.*.name.max' => 'Product name cannot exceed 255 characters.',
            'products.*.price.numeric' => 'Product price must be a valid number.',
            'products.*.price.min' => 'Product price cannot be negative.',
            'products.*.price.max' => 'Product price is too high.',
            'products.*.image.url' => 'Product image must be a valid URL.',
            'products.*.image.max' => 'Product image URL is too long.',
            'products.*.url.url' => 'Product URL must be a valid URL.',
            'products.*.url.max' => 'Product URL is too long.',
            
            // Promotion validation messages
            'promotion_data.discount_percentage.numeric' => 'Discount percentage must be a number.',
            'promotion_data.discount_percentage.min' => 'Discount percentage cannot be negative.',
            'promotion_data.discount_percentage.max' => 'Discount percentage cannot exceed 100%.',
            'promotion_data.promo_code.max' => 'Promo code cannot exceed 50 characters.',
            'promotion_data.promo_code.regex' => 'Promo code can only contain uppercase letters, numbers, hyphens and underscores.',
            'promotion_data.valid_until.date' => 'Valid until date must be a valid date.',
            'promotion_data.valid_until.after' => 'Valid until date must be in the future.',
            'promotion_data.minimum_order.numeric' => 'Minimum order amount must be a number.',
            'promotion_data.minimum_order.min' => 'Minimum order amount cannot be negative.',
            'promotion_data.minimum_order.max' => 'Minimum order amount is too high.',
            
            // Schedule validation messages
            'schedule_at.date' => 'Schedule date must be a valid date.',
            'schedule_at.after' => 'Schedule date must be in the future.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'send_type' => 'send type',
            'emails.*' => 'email address',
            'products.*.name' => 'product name',
            'products.*.price' => 'product price',
            'products.*.image' => 'product image',
            'products.*.url' => 'product URL',
            'promotion_data.discount_percentage' => 'discount percentage',
            'promotion_data.promo_code' => 'promo code',
            'promotion_data.valid_until' => 'valid until date',
            'promotion_data.minimum_order' => 'minimum order amount',
            'schedule_at' => 'schedule date',
        ];
    }


    /**
     * Get validation suggestions based on errors
     */
    private function getValidationSuggestions(array $errors): array
    {
        $suggestions = [];
        
        if (isset($errors['subject'])) {
            $suggestions[] = 'Try a clear, engaging subject line that describes your promotion';
        }
        
        if (isset($errors['content'])) {
            $suggestions[] = 'Add more descriptive content about your promotion or products';
        }
        
        if (isset($errors['emails']) || str_contains(implode(' ', $errors), 'email')) {
            $suggestions[] = 'Make sure all email addresses are valid and properly formatted';
        }
        
        if (isset($errors['products']) || str_contains(implode(' ', $errors), 'product')) {
            $suggestions[] = 'Ensure all product information is complete and valid';
        }
        
        if (str_contains(implode(' ', $errors), 'promotion_data')) {
            $suggestions[] = 'Check your promotion details - discount percentages, promo codes, and dates';
        }
        
        return $suggestions;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Clean and prepare email addresses
        if ($this->has('emails') && is_array($this->emails)) {
            $cleanEmails = array_map('trim', $this->emails);
            $cleanEmails = array_filter($cleanEmails); // Remove empty values
            $cleanEmails = array_unique($cleanEmails); // Remove duplicates
            
            $this->merge([
                'emails' => array_values($cleanEmails)
            ]);
        }
        
        // Clean promotion data
        if ($this->has('promotion_data.promo_code')) {
            $this->merge([
                'promotion_data' => array_merge($this->promotion_data ?? [], [
                    'promo_code' => strtoupper(trim($this->promotion_data['promo_code'] ?? ''))
                ])
            ]);
        }
    }
       protected function failedValidation(Validator $validator)
    {
        throw new ValidationException(
            $validator,
            response()->json([
                'result' => false,
                'message' => __('Validation failed'),
                'errors' => $validator->errors(),
            ], 200)
        );
    }
}