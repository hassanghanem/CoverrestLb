<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            // 🔹 General
            'New Arrival', 'Best Seller', 'Trending', 'Limited Edition', 'Exclusive', 'On Sale',
            'Discount', 'Clearance', 'Hot Deal', 'Back in Stock', 'Preorder', 'Gift Idea',
            'Eco Friendly', 'Sustainable', 'Handmade', 'Premium', 'Luxury', 'Budget Friendly',

            // 🔹 Fashion & Apparel
            // 'Men', 'Women', 'Kids', 'Unisex', 'Casual', 'Formal', 'Sportswear',
            // 'Shoes', 'Sneakers', 'Accessories', 'Bags', 'Jewelry', 'Watches',
            // 'Summer Collection', 'Winter Collection', 'Streetwear',

            // 🔹 Electronics & Tech
            'Smartphone', 'Laptop', 'Tablet', 'Smartwatch', 'Headphones', 'Gaming',
            'Camera', 'Audio', 'Wearable', 'Charger', 'Gadget', 'Tech Deal',

            // 🔹 Home & Living
            'Home Decor', 'Furniture', 'Kitchen', 'Lighting', 'Bathroom', 'Outdoor',
            'Bedding', 'Storage', 'Office', 'Garden', 'Smart Home',

            // 🔹 Beauty & Personal Care
            // 'Skincare', 'Haircare', 'Makeup', 'Fragrance', 'Vegan Beauty', 'Organic',

            // 🔹 Health & Fitness
            // 'Wellness', 'Supplements', 'Workout Gear', 'Yoga', 'Sports Equipment',

            // 🔹 Seasonal
            'Christmas', 'Black Friday', 'Cyber Monday', 'Valentine\'s Day', 'Back to School',
            'Mother\'s Day', 'Father\'s Day', 'Eid', 'Diwali', 'Halloween',

            // 🔹 Misc / Functional
            'Free Shipping', 'Top Rated', 'Limited Stock', 'Bundle Offer', 'New Collection',
            'Editor\'s Pick', 'Under $50', 'Made in USA', 'Online Exclusive'
        ];

        foreach ($tags as $tag) {
            Tag::create(['name' => $tag]);
        }
    }
}
