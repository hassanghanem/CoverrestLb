<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;
use App\Models\Variant;

class ProductRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $productId = $this->route('product');

        $rules = [
            'name' => 'required|array',
            'short_description' => 'required|array',
            'description' => 'required|array',

            'barcode' => 'required|string|max:50|unique:products,barcode,' . ($productId ?? 'NULL'),
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'availability_status' => 'required|in:available,coming_soon,discontinued,pre_order,out_of_stock',
            'price' => 'required|numeric|min:0',
            'discount' => 'integer|min:0|max:100',
            'coupon_eligible' => 'sometimes|boolean',
            'min_order_quantity' => 'required|integer|min:1',
            'max_order_quantity' => 'nullable|integer|min:0',
            'warranty' => 'nullable|string|max:191',

            'images' => [$this->isMethod('post') ? 'required' : 'nullable', 'array'],
            'images.*.image' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,gif',
                'max:2048',
            ],
            'images.*.is_active' => 'required|boolean',
            'images.*.arrangement' => 'required|integer|min:1',

            'tags' => 'nullable|array',
            'tags.*' => 'nullable|exists:tags,id',

            // Variants
            'variants' => ['nullable', 'array', function ($attribute, $value, $fail) use ($productId) {
                $unique = [];

                foreach ($value as $index => $variant) {
                    $sizeKey = (isset($variant['size_id']) && $variant['size_id'] !== null && $variant['size_id'] !== '' && $variant['size_id'] !== 'null')
                        ? (int)$variant['size_id']
                        : null;

                    $colorKey = (isset($variant['color_id']) && $variant['color_id'] !== null && $variant['color_id'] !== '' && $variant['color_id'] !== 'null')
                        ? (int)$variant['color_id']
                        : null;

                    $key = ($sizeKey === null ? 'null' : $sizeKey) . '-' . ($colorKey === null ? 'null' : $colorKey);

                    if (in_array($key, $unique, true)) {
                        return $fail(__('messages.product.duplicate_variant', ['index' => $index + 1]));
                    }
                    $unique[] = $key;
                }

                $submittedKeys = array_map(function ($variant) {
                    $sizeKey = (isset($variant['size_id']) && $variant['size_id'] !== null && $variant['size_id'] !== '' && $variant['size_id'] !== 'null')
                        ? (int)$variant['size_id']
                        : null;
                    $colorKey = (isset($variant['color_id']) && $variant['color_id'] !== null && $variant['color_id'] !== '' && $variant['color_id'] !== 'null')
                        ? (int)$variant['color_id']
                        : null;
                    return ($sizeKey === null ? 'null' : $sizeKey) . '-' . ($colorKey === null ? 'null' : $colorKey);
                }, $value);

                $variantIds = array_filter(array_map(fn($v) => $v['id'] ?? null, $value));

                $existingVariants = \App\Models\Variant::where('product_id', $productId)
                    ->when(count($variantIds) > 0, function ($query) use ($variantIds) {
                        $query->whereNotIn('id', $variantIds);
                    })
                    ->get(['size_id', 'color_id'])
                    ->map(function ($variant) {
                        return ($variant->size_id === null ? 'null' : $variant->size_id)
                            . '-' .
                            ($variant->color_id === null ? 'null' : $variant->color_id);
                    })
                    ->toArray();

                foreach ($submittedKeys as $index => $key) {
                    if (in_array($key, $existingVariants, true)) {
                        return $fail(__('messages.product.duplicate_variant', ['index' => $index + 1]));
                    }
                }
            }],
            'variants.*.size_id' => 'nullable|exists:sizes,id',
            'variants.*.color_id' => 'nullable|exists:colors,id',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.discount' => 'nullable|integer|min:0|max:100',
            'variants.*.open_quantity' => 'nullable|integer|min:1',
            'variants.*.warehouse_id' => 'required_with:variants.*.open_quantity|exists:warehouses,id',
            
            // Variant images
            'variants.*.images' => 'nullable|array',
            'variants.*.images.*.image' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,gif',
                'max:2048',
            ],
            'variants.*.images.*.is_active' => 'required|boolean',
            'variants.*.images.*.arrangement' => 'required|integer|min:1',
            
            // Specifications
            'specifications' => 'nullable|array',
        ];

        // Multilingual fields
        $locales = config('app.locales');
        foreach ($locales as $locale) {
            $rules["name.$locale"] = [
                'required',
                'string',
                'max:191',
                "unique:products,name->$locale," . ($productId ?? 'NULL'),
            ];
            $rules["short_description.$locale"] = ['required', 'string', 'max:191'];
            $rules["description.$locale"] = ['required', 'string'];
            $rules["specifications.*.description.$locale"] = ['required', 'string', 'max:1000'];
        }

        return $rules;
    }

    public function messages()
    {
        $messages = [
            'barcode.required' => __(':attribute is required.', ['attribute' => __('Barcode')]),
            'barcode.unique' => __(':attribute must be unique.', ['attribute' => __('Barcode')]),
            'category_id.required' => __(':attribute is required.', ['attribute' => __('Category')]),
            'category_id.exists' => __('Selected :attribute does not exist.', ['attribute' => __('Category')]),
            'brand_id.required' => __(':attribute is required.', ['attribute' => __('Brand')]),
            'brand_id.exists' => __('Selected :attribute does not exist.', ['attribute' => __('Brand')]),
            'price.required' => __(':attribute is required.', ['attribute' => __('Price')]),
            'price.numeric' => __(':attribute must be numeric.', ['attribute' => __('Price')]),
            'price.min' => __(':attribute must be at least :min.', ['attribute' => __('Price'), 'min' => 0]),
            'discount.integer' => __(':attribute must be an integer.', ['attribute' => __('Discount')]),
            'min_order_quantity.required' => __(':attribute is required.', ['attribute' => __('Min Order Quantity')]),
            'min_order_quantity.integer' => __(':attribute must be an integer.', ['attribute' => __('Min Order Quantity')]),
            'min_order_quantity.min' => __(':attribute must be at least :min.', ['attribute' => __('Min Order Quantity'), 'min' => 1]),
            'max_order_quantity.integer' => __(':attribute must be an integer.', ['attribute' => __('Max Order Quantity')]),

            'images.required' => __('At least one :attribute is required.', ['attribute' => __('Image')]),
            'images.*.image.mimes' => __(':attribute must be a file of type: jpeg, jpg, png, gif.', ['attribute' => __('Image')]),
            'images.*.image.max' => __(':attribute may not be greater than 2 MB.', ['attribute' => __('Image')]),

            'variants.*.color_id.exists' => __('Selected :attribute does not exist.', ['attribute' => __('Color')]),
            'variants.*.size_id.exists' => __('Selected :attribute does not exist.', ['attribute' => __('Size')]),
            
            'variants.*.images.*.image.mimes' => __(':attribute must be a file of type: jpeg, jpg, png, gif.', ['attribute' => __('Variant Image')]),
            'variants.*.images.*.image.max' => __(':attribute may not be greater than 2 MB.', ['attribute' => __('Variant Image')]),
            
            'tags.*.exists' => __('Selected :attribute does not exist.', ['attribute' => __('Tag')]),
        ];
        foreach (config('app.locales') as $locale) {
            $messages["name.$locale.required"] = __(':attribute is required.', ['attribute' => __("Name (:locale)", ['locale' => $locale])]);
            $messages["name.$locale.unique"] = __(':attribute must be unique.', ['attribute' => __("Name (:locale)", ['locale' => $locale])]);
            $messages["short_description.$locale.required"] = __(':attribute is required.', ['attribute' => __("Short Description (:locale)", ['locale' => $locale])]);
            $messages["description.$locale.required"] = __(':attribute is required.', ['attribute' => __("Description (:locale)", ['locale' => $locale])]);
            $messages["specifications.*.description.$locale.required"] = __(':attribute is required.', ['attribute' => __("Specification (:locale)", ['locale' => $locale])]);
        }


        return $messages;
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
