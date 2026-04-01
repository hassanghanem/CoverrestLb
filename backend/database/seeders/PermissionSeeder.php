<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view-activity_logs',

            'view-profile',

            'view-settings',

            'view-dashboard',

            // User Permissions
            'create-user',
            'edit-user',
            'delete-user',
            'view-user',

            // Category Permissions
            'create-category',
            'edit-category',
            'delete-category',
            'view-category',

            // Product Permissions
            'view-product',
            'create-product',
            'edit-product',
            'delete-product',

            // Stock Permissions
            'view-stock',
            'view-stock_adjustment',
            'create-stock_adjustment',

            // Client Permissions
            'view-client',
            'create-client',
            'edit-client',
            'delete-client',

            // Coupon Permissions
            'view-coupon',
            'create-coupon',
            'edit-coupon',
            'delete-coupon',

            // Order Permissions
            'view-order',
            'create-order',
            'edit-order',
            'delete-order',

            // Return Order Permissions
            'view-return_order',
            'create-return_order',
            'edit-return_order',
            'delete-return_order',

            // Pre Order Permissions
            'view-pre_order',
            'create-pre_order',
            'edit-pre_order',
            'delete-pre_order',

            // Home Section Permissions
            'view-home_section',
            'create-home_section',
            'edit-home_section',
            'delete-home_section',

            // Contacts Permissions
            'view-contacts',

            // Promotional Email Permissions
            'view-promotional_emails',
            'send-promotional_emails',
            'view-newsletter_stats',

            // Team Member Permissions
            'view-team_member',
            'create-team_member',
            'edit-team_member',
            'delete-team_member',

            // Review Permissions
            'view-review',
            'edit-review',

            // ================================
            // 📊 Report Permissions
            // ================================
            'view-report', // general reports section access
            'view-sales_report',
            'view-product_report',
            'view-category_report',
            'view-client_report',
            'view-order_report',
            'view-stock_report',
            'view-coupon_report',
            'view-payment_report',
            'view-refunds_report',
            'view-delivery_performance_report',
            'view-profit_report',

            'delete-stock_adjustment'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
