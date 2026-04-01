<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Page;

class PagesSeeder extends Seeder
{
    public function run()
    {
        $pages = [
            [
                'slug' => 'privacy-policy',
                'title' => [
                    'en' => 'Privacy Policy',
                ],
                'content' => [
                    'en' => '
                        <h2 class="text-3xl font-bold mb-4">Privacy Policy - CoverrestLB</h2>
                        <p class="mb-6 text-lg text-muted-foreground">At CoverrestLB, we value your privacy and are committed to protecting your personal information.</p>
                        
                        <h3 class="text-2xl font-semibold mb-2">Information We Collect</h3>
                        <ul class="list-disc list-inside mb-6 text-lg text-muted-foreground space-y-2">
                            <li>Name, email, and contact details when you register or place an order.</li>
                            <li>Payment information for processing transactions.</li>
                            <li>Browsing and usage data for improving our services.</li>
                        </ul>
                        
                        <h3 class="text-2xl font-semibold mb-2">How We Use Your Information</h3>
                        <ul class="list-disc list-inside mb-6 text-lg text-muted-foreground space-y-2">
                            <li>To process and deliver your orders.</li>
                            <li>To provide customer support.</li>
                            <li>To send promotional emails (with your consent).</li>
                        </ul>
                        
                        <h3 class="text-2xl font-semibold mb-2">Security</h3>
                        <p class="mb-6 text-lg text-muted-foreground">We implement appropriate measures to protect your data from unauthorized access, disclosure, or alteration.</p>
                    ',
                ],
            ],

            [
                'slug' => 'terms-conditions',
                'title' => [
                    'en' => 'Terms & Conditions',
                ],
                'content' => [
                    'en' => '
                        <h2 class="text-3xl font-bold mb-4">Terms & Conditions - CoverrestLB</h2>
                        <p class="mb-6 text-lg text-muted-foreground">By using our website, you agree to comply with these terms and conditions.</p>
                        
                        <h3 class="text-2xl font-semibold mb-2">Order Acceptance</h3>
                        <p class="mb-6 text-lg text-muted-foreground">All orders are subject to availability and confirmation of the order price.</p>
                        
                        <h3 class="text-2xl font-semibold mb-2">Pricing & Payment</h3>
                        <p class="mb-6 text-lg text-muted-foreground">Prices are as stated on the website. We accept various payment methods at checkout.</p>
                        
                        <h3 class="text-2xl font-semibold mb-2">Shipping & Delivery</h3>
                        <p class="mb-6 text-lg text-muted-foreground">Delivery times are estimates and may vary depending on location and availability.</p>
                        
                        <h3 class="text-2xl font-semibold mb-2">Limitation of Liability</h3>
                        <p class="mb-6 text-lg text-muted-foreground">CoverrestLB is not responsible for indirect or consequential damages arising from the use of our products or website.</p>
                    ',
                ],
            ],

            [
                'slug' => 'return-policy',
                'title' => [
                    'en' => 'Return Policy',
                ],
                'content' => [
                    'en' => '
                        <h2 class="text-3xl font-bold mb-4">Return & Refund Policy - CoverrestLB</h2>
                        <p class="mb-6 text-lg text-muted-foreground">If you are not satisfied with your purchase, you can return items within 30 days.</p>
                        
                        <h3 class="text-2xl font-semibold mb-2">Eligibility</h3>
                        <ul class="list-disc list-inside mb-6 text-lg text-muted-foreground space-y-2">
                            <li>Items must be unused, in original packaging, and with receipts.</li>
                        </ul>
                        
                        <h3 class="text-2xl font-semibold mb-2">Refund Process</h3>
                        <p class="mb-6 text-lg text-muted-foreground">Once we receive your return, we will inspect the items and notify you of the approval or rejection of your refund.</p>
                        
                        <h3 class="text-2xl font-semibold mb-2">Exchanges</h3>
                        <p class="mb-6 text-lg text-muted-foreground">We offer exchanges for defective or incorrect items.</p>
                    ',
                ],
            ],

            [
                'slug' => 'about-us',
                'title' => [
                    'en' => 'About Us',
                ],
                'content' => [
                    'en' => '
                        <h2 class="text-3xl font-bold mb-4">About CoverrestLB</h2>
                        <p class="mb-6 text-lg text-muted-foreground">CoverrestLB is your trusted online store for premium electronics, including smartphones, laptops, and accessories. Our goal is to provide top-quality products that enhance your everyday life.</p>
                        
                        <h3 class="text-2xl font-semibold mb-2">Our Mission</h3>
                        <p class="mb-6 text-lg text-muted-foreground">Our mission is to deliver high-quality electronics with exceptional customer service. We strive to make online shopping seamless, reliable, and enjoyable for every customer.</p>
                        
                        <h3 class="text-2xl font-semibold mb-2">Our Values</h3>
                        <ul class="list-disc list-inside mb-6 text-lg text-muted-foreground space-y-2">
                            <li><strong>Customer Satisfaction:</strong> We prioritize our customers in everything we do, ensuring your needs are met promptly and efficiently.</li>
                            <li><strong>Integrity:</strong> We conduct our business with honesty, transparency, and fairness, building trust in every interaction.</li>
                            <li><strong>Innovation:</strong> We embrace the latest technology and trends to provide cutting-edge products and solutions.</li>
                        </ul>
                        
                        <h3 class="text-2xl font-semibold mb-2">Contact Us</h3>
                        <p class="text-lg text-muted-foreground">Have questions or need support? Reach out to our friendly team anytime at <a href="mailto:contacts@coverrestlb.com" class="text-primary underline hover:text-accent">contacts@coverrestlb.com</a>. We’re here to help!</p>
                    ',
                ],
            ],
              [
                'slug' => 'faq',
                'title' => [
                    'en' => 'Frequently Asked Questions',
                ],
                'content' => [
                    'en' => '
                        <h2 class="text-3xl font-bold mb-6">Frequently Asked Questions - CoverrestLB</h2>
                        <p class="mb-6 text-lg text-muted-foreground">Find answers to the most common questions about our products, services, and policies.</p>
                        
                        <div class="mb-6">
                            <h3 class="text-2xl font-semibold mb-2">1. How do I place an order?</h3>
                            <p class="text-lg text-muted-foreground">You can browse our products online and add the items you wish to purchase to your cart. Then, proceed to checkout to complete your order securely.</p>
                        </div>
                        
                        <div class="mb-6">
                            <h3 class="text-2xl font-semibold mb-2">2. What payment methods do you accept?</h3>
                            <p class="text-lg text-muted-foreground">We accept various payment methods including credit/debit cards, PayPal, and other online payment options as displayed at checkout.</p>
                        </div>
                        
                        <div class="mb-6">
                            <h3 class="text-2xl font-semibold mb-2">3. Can I track my order?</h3>
                            <p class="text-lg text-muted-foreground">Yes! Once your order is shipped, you will receive a tracking number via email to monitor your package’s delivery status.</p>
                        </div>
                        
                        <div class="mb-6">
                            <h3 class="text-2xl font-semibold mb-2">4. What is your return policy?</h3>
                            <p class="text-lg text-muted-foreground">You can return items within 30 days of purchase if they are unused, in original packaging, and accompanied by a receipt. Refunds and exchanges are processed as described in our Return Policy page.</p>
                        </div>
                        
                        <div class="mb-6">
                            <h3 class="text-2xl font-semibold mb-2">5. How can I contact customer support?</h3>
                            <p class="text-lg text-muted-foreground">You can reach our friendly support team anytime at <a href="mailto:contacts@coverrestlb.com" class="text-primary underline hover:text-accent">contacts@coverrestlb.com</a>. We’re happy to assist you!</p>
                        </div>
                    ',
                ],
            ],
        ];

        foreach ($pages as $data) {
            Page::create($data);
        }
    }
}
