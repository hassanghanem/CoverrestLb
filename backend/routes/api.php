<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CaptchaController;
use App\Http\Controllers\V1\Admin\{
    ActivityLogController,
    AddressController,
    AuthController,
    BrandController,
    CategoryController,
    ClientController,
    ColorController,
    ConfigurationController,
    ContactController,
    CouponController,
    CurrencyController,
    DashboardController,
    HomeBannerController,
    HomeSectionController,
    OrderController,
    PageController,
    PreOrderController,
    ProductController,
    ProductImageController,
    ProductVariantController,
    PromotionalEmailController,
    VariantImageController,
    ProfileController,
    ReportsController,
    ReturnOrderController,
    ReviewController,
    SessionController,
    SettingsController,
    SizeController,
    StockAdjustmentController,
    StockController,
    TagController,
    TeamMemberController,
    UserController,
    WarehouseController,
    ClientSessionController
};
use App\Http\Controllers\V1\Client\{
    ClientAddressController,
    ClientAuthController,
    ClientCartController,
    ClientCheckoutController,
    ClientContactController,
    ClientCouponController,
    ClientHomeController,
    ClientNewsletterController,
    ClientOrdersController,
    ClientPreOrdersController,
    ClientProductController,
    ClientProfileController,
    ClientReturnOrdersController,
    ClientReviewController,
    ClientSettingsController,
    ClientShopController,
    ClientTeamMemberController,
    ClientWishlistController
};

Route::prefix('v1')->group(function () {
    Route::prefix('admin')->group(function () {
        Route::middleware(['manage_auth_session', 'app_auth'])->group(function () {
            Route::get('/app-launch', function () {
                return response()->json([
                    'result' => true,
                    'message' => 'App launch successful and session managed.',
                ]);
            });
            Route::middleware(['guest', 'recaptcha'])->group(function () {
                Route::post('login', [AuthController::class, 'login']);
                Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
                Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
                Route::post('reset-password', [AuthController::class, 'resetPassword']);
            });

            Route::middleware(['auth:admin'])->group(function () {
                Route::middleware('auth.actions')->group(function () {
                    Route::get('getCurrentUser', [ProfileController::class, 'getCurrentUser']);
                    Route::post('logout', [ProfileController::class, 'logout']);
                    Route::get('allSettings', [SettingsController::class, 'index']);
                    Route::get('getNotifications', [SettingsController::class, 'getNotifications']);

                    Route::middleware('can:view-activity_logs')->get('activity-logs', [ActivityLogController::class, 'index']);


                    Route::get('getAllClients', [SettingsController::class, 'getAllClients']);
                    Route::get('getAllProductsVariants', [SettingsController::class, 'getAllProductsVariants']);
                    Route::get('getOrderableVariants', [SettingsController::class, 'getOrderableVariants']);
                    Route::get('getClientAddresses', [SettingsController::class, 'getClientAddresses']);
                    Route::get('getOrdersCanBeReturned', [SettingsController::class, 'getOrdersCanBeReturned']);
                    Route::get('getAllProductsVariantsCanBePreOrder', [SettingsController::class, 'getAllProductsVariantsCanBePreOrder']);
                    Route::get('getAllProducts', [SettingsController::class, 'getAllProducts']);

                    Route::get('/dashboard', [DashboardController::class, 'index']);

                    // Admin: List client sessions
                    Route::middleware('can:view-client')->get('client-sessions', [ClientSessionController::class, 'index']);
                    Route::middleware('can:edit-client')->post('client-sessions/set-active', [ClientSessionController::class, 'update']);


                    Route::middleware('can:view-profile')->post('changePassword', [ProfileController::class, 'changePassword']);
                    Route::middleware('can:view-profile')->get('sessions', [SessionController::class, 'getAllSessions']);
                    Route::middleware('can:view-profile')->post('logoutOtherDevices', [SessionController::class, 'logoutOtherDevices']);
                    Route::middleware('can:view-profile')->post('logoutSpecificDevice', [SessionController::class, 'logoutSpecificDevice']);

                    Route::middleware('can:view-user')->get('users', [UserController::class, 'index']);
                    Route::middleware('can:view-user')->get('users/{id}', [UserController::class, 'show']);
                    Route::middleware('can:create-user')->post('users', [UserController::class, 'create']);
                    Route::middleware('can:edit-user')->put('users/{user}', [UserController::class, 'update']);
                    Route::middleware('can:delete-user')->delete('users/{user}', [UserController::class, 'destroy']);

                    Route::middleware('can:view-category')->get('categories', [CategoryController::class, 'index']);
                    Route::middleware('can:view-category')->get('categories/{category}', [CategoryController::class, 'show']);
                    Route::middleware('can:create-category')->post('categories', [CategoryController::class, 'store']);
                    Route::middleware('can:edit-category')->put('categories/{category}', [CategoryController::class, 'update']);
                    Route::middleware('can:delete-category')->delete('categories/{category}', [CategoryController::class, 'destroy']);


                    Route::middleware('can:create-product')->get('products/export-template', [ProductController::class, 'exportTemplate']);
                    Route::middleware('can:view-product')->post('products/export-selected', [ProductController::class, 'exportSelected']);
                    Route::middleware('can:create-product')->post('products/import', [ProductController::class, 'import']);
                    Route::middleware('can:create-product')->post('products/import_validate', [ProductController::class, 'validateImport']);
                    Route::middleware('can:edit-product')->put('products/bulk-update', [ProductController::class, 'bulkUpdate']);


                    Route::middleware('can:create-product')->get('products/generate-barcode', [ProductController::class, 'generateBarcode']);
                    Route::middleware('can:view-product')->get('products/{product}/barcodes', [ProductController::class, 'getPrintableBarcodes']);
                    Route::middleware('can:view-product')->get('products/{product}/barcodes/print', [ProductController::class, 'printBarcodes']);
                    Route::middleware('can:view-product')->get('barcodes/print', [ProductController::class, 'printBulkBarcodes']);
                    Route::middleware('can:view-product')->get('products', [ProductController::class, 'index']);
                    Route::middleware('can:view-product')->get('products/{product}', [ProductController::class, 'show']);
                    Route::middleware('can:create-product')->post('products', [ProductController::class, 'store']);
                    Route::middleware('can:edit-product')->put('products/{product}', [ProductController::class, 'update']);
                    Route::middleware('can:delete-product')->delete('products/{product}', [ProductController::class, 'destroy']);
                    Route::middleware('can:edit-product')->group(function () {
                        Route::put('product_image/{product_image}', [ProductImageController::class, 'update']);
                        Route::delete('product_image/{product_image}', [ProductImageController::class, 'destroy']);
                        Route::put('variant_image/{variant_image}', [VariantImageController::class, 'update']);
                        Route::delete('variant_image/{variant_image}', [VariantImageController::class, 'destroy']);
                        Route::delete('product_variant/{product_variant}', [ProductVariantController::class, 'destroy']);
                    });





                    Route::middleware('can:view-review')->get('reviews', [ReviewController::class, 'index']);
                    Route::middleware('can:edit-review')->put('reviews/{review}', [ReviewController::class, 'update']);

                    Route::get('/stocks', [StockController::class, 'index'])
                        ->middleware('can:view-stock');

                    Route::get('/stock-adjustments', [StockAdjustmentController::class, 'index'])
                        ->middleware('can:view-stock_adjustment');

                    Route::get('/stock-adjustments/{stockAdjustment}', [StockAdjustmentController::class, 'show'])
                        ->middleware('can:view-stock_adjustment');

                    Route::post('/stock-adjustments/manual', [StockAdjustmentController::class, 'manualAdjustWithDirection'])
                        ->middleware('can:create-stock_adjustment');

                    Route::delete('/stock-adjustments/{stockAdjustment}', [StockAdjustmentController::class, 'destroy'])
                        ->middleware('can:delete-stock_adjustment');

                    Route::middleware('can:view-client')->get('clients', [ClientController::class, 'index']);
                    Route::middleware('can:view-client')->get('clients/{client}', [ClientController::class, 'show']);
                    Route::middleware('can:create-client')->post('clients', [ClientController::class, 'store']);
                    Route::middleware('can:edit-client')->put('clients/{client}', [ClientController::class, 'update']);
                    Route::middleware('can:delete-client')->delete('clients/{client}', [ClientController::class, 'destroy']);

                    Route::middleware('can:view-client')->get('addresses', [AddressController::class, 'index']);
                    Route::middleware('can:view-client')->get('addresses/{address}', [AddressController::class, 'show']);
                    Route::middleware('can:view-client')->post('addresses', [AddressController::class, 'store']);
                    Route::middleware('can:view-client')->put('addresses/{address}', [AddressController::class, 'update']);
                    Route::middleware('can:view-client')->delete('addresses/{address}', [AddressController::class, 'destroy']);

                    Route::middleware('can:view-coupon')->get('coupons', [CouponController::class, 'index']);
                    Route::middleware('can:view-coupon')->get('coupons/{coupon}', [CouponController::class, 'show']);
                    Route::middleware('can:create-coupon')->post('coupons', [CouponController::class, 'store']);
                    Route::middleware('can:edit-coupon')->put('coupons/{coupon}', [CouponController::class, 'update']);
                    Route::middleware('can:delete-coupon')->delete('coupons/{coupon}', [CouponController::class, 'destroy']);


                    Route::middleware('can:view-order')->get('orders', [OrderController::class, 'index']);
                    Route::middleware('can:view-order')->get('orders/{order}', [OrderController::class, 'show']);
                    Route::middleware('can:view-order')->get('orders/{order}/receipt', [OrderController::class, 'receipt']);
                    Route::middleware('can:create-order')->post('orders', [OrderController::class, 'store']);
                    Route::middleware('can:edit-order')->put('orders/{order}', [OrderController::class, 'update']);



                    Route::middleware('can:view-return_order')->get('return-orders', [ReturnOrderController::class, 'index']);
                    Route::middleware('can:view-return_order')->get('return-orders/{returnOrder}', [ReturnOrderController::class, 'show']);
                    Route::middleware('can:create-return_order')->post('return-orders', [ReturnOrderController::class, 'store']);
                    Route::middleware('can:edit-return_order')->put('return-orders/{returnOrder}', [ReturnOrderController::class, 'update']);

                    Route::middleware('can:view-pre_order')->get('pre-orders', [PreOrderController::class, 'index']);
                    Route::middleware('can:view-pre_order')->get('pre-orders/{order}', [PreOrderController::class, 'show']);
                    Route::middleware('can:create-pre_order')->post('pre-orders', [PreOrderController::class, 'store']);
                    Route::middleware('can:edit-pre_order')->put('pre-orders/{order}', [PreOrderController::class, 'update']);

                    Route::middleware('can:view-contacts')->get('contacts', [ContactController::class, 'index']);

                    // Promotional Email Routes - Enhanced & Flexible
                    Route::prefix('promotional-emails')->group(function () {
                        // Core Statistics & Data
                        Route::middleware('can:view-newsletter_stats')->get('stats', [PromotionalEmailController::class, 'getStats']);
                        Route::middleware('can:view-promotional_emails')->get('subscribers', [PromotionalEmailController::class, 'getActiveSubscribers']);

                        // Unified Send Endpoint (Replaces multiple endpoints)
                        Route::middleware('can:send-promotional_emails')->post('send', [PromotionalEmailController::class, 'send']);

                        // Email Preview & Templates
                        Route::middleware('can:send-promotional_emails')->post('preview', [PromotionalEmailController::class, 'preview']);
                        Route::middleware('can:view-promotional_emails')->get('templates', [PromotionalEmailController::class, 'getTemplates']);
                        Route::middleware('can:send-promotional_emails')->post('save-template', [PromotionalEmailController::class, 'saveAsTemplate']);

                        // Helper Endpoints
                        Route::middleware('can:view-promotional_emails')->post('recipient-count', [PromotionalEmailController::class, 'getRecipientCount']);

                        // Legacy endpoints (kept for backward compatibility)
                        Route::middleware('can:send-promotional_emails')->post('send-to-all', [PromotionalEmailController::class, 'sendToAll']);
                        Route::middleware('can:send-promotional_emails')->post('send-to-specific', [PromotionalEmailController::class, 'sendToSpecific']);
                        Route::middleware('can:send-promotional_emails')->post('send-with-products', [PromotionalEmailController::class, 'sendWithProducts']);
                        Route::middleware('can:send-promotional_emails')->post('unsubscribe', [PromotionalEmailController::class, 'unsubscribe']);
                    });

                    Route::middleware('can:view-team_member')->get('team-members', [TeamMemberController::class, 'index']);
                    Route::middleware('can:view-team_member')->get('team-members/{team_member}', [TeamMemberController::class, 'show']);
                    Route::middleware('can:create-team_member')->post('team-members', [TeamMemberController::class, 'store']);
                    Route::middleware('can:edit-team_member')->put('team-members/{team_member}', [TeamMemberController::class, 'update']);
                    Route::middleware('can:delete-team_member')->delete('team-members/{team_member}', [TeamMemberController::class, 'destroy']);

                    Route::middleware('can:view-home_section')->get('home-sections', [HomeSectionController::class, 'index']);
                    Route::middleware('can:view-home_section')->get('home-sections/{home_section}', [HomeSectionController::class, 'show']);
                    Route::middleware('can:create-home_section')->post('home-sections', [HomeSectionController::class, 'store']);
                    Route::middleware('can:edit-home_section')->put('home-sections/{home_section}', [HomeSectionController::class, 'update']);
                    Route::middleware('can:delete-home_section')->delete('home-sections/{home_section}', [HomeSectionController::class, 'destroy']);

                    Route::middleware('can:edit-home_section')->group(function () {
                        Route::delete('home_banners/{home_banner}', [HomeBannerController::class, 'destroy']);
                    });

                    Route::middleware('can:view-settings')->group(function () {
                        Route::get('brands', [BrandController::class, 'index']);
                        Route::get('brands/{brand}', [BrandController::class, 'show']);
                        Route::post('brands', [BrandController::class, 'store']);
                        Route::put('brands/{brand}', [BrandController::class, 'update']);
                        Route::delete('brands/{brand}', [BrandController::class, 'destroy']);


                        Route::get('colors', [ColorController::class, 'index']);
                        Route::get('colors/{color}', [ColorController::class, 'show']);
                        Route::post('colors', [ColorController::class, 'store']);
                        Route::put('colors/{color}', [ColorController::class, 'update']);
                        Route::delete('colors/{color}', [ColorController::class, 'destroy']);

                        Route::get('sizes', [SizeController::class, 'index']);
                        Route::get('sizes/{size}', [SizeController::class, 'show']);
                        Route::post('sizes', [SizeController::class, 'store']);
                        Route::put('sizes/{size}', [SizeController::class, 'update']);
                        Route::delete('sizes/{size}', [SizeController::class, 'destroy']);

                        Route::get('warehouses', [WarehouseController::class, 'index']);
                        Route::get('warehouses/{warehouse}', [WarehouseController::class, 'show']);
                        Route::post('warehouses', [WarehouseController::class, 'store']);
                        Route::put('warehouses/{warehouse}', [WarehouseController::class, 'update']);
                        Route::delete('warehouses/{warehouse}', [WarehouseController::class, 'destroy']);

                        Route::get('tags', [TagController::class, 'index']);
                        Route::get('tags/{tag}', [TagController::class, 'show']);
                        Route::post('tags', [TagController::class, 'store']);
                        Route::put('tags/{tag}', [TagController::class, 'update']);
                        Route::delete('tags/{tag}', [TagController::class, 'destroy']);

                        Route::get('configurations', [ConfigurationController::class, 'index']);
                        Route::put('configurations', [ConfigurationController::class, 'update']);

                        Route::get('currencies', [CurrencyController::class, 'index']);
                        Route::get('currencies/{currency}', [CurrencyController::class, 'show']);
                        Route::post('currencies', [CurrencyController::class, 'store']);
                        Route::put('currencies/{currency}', [CurrencyController::class, 'update']);
                        Route::delete('currencies/{currency}', [CurrencyController::class, 'destroy']);

                        Route::get('pages', [PageController::class, 'index']);
                        Route::get('pages/{page}', [PageController::class, 'show']);
                        Route::put('pages/{page}', [PageController::class, 'update']);
                    });


                    Route::prefix('reports')->controller(ReportsController::class)->group(function () {

                        Route::get('sales', 'salesReport')
                            ->middleware('can:view-sales_report');

                        Route::get('products', 'productReport')
                            ->middleware('can:view-product_report');

                        Route::get('categories', 'categoryReport')
                            ->middleware('can:view-category_report');

                        Route::get('clients', 'clientReport')
                            ->middleware('can:view-client_report');

                        Route::get('payments', 'paymentReport')
                            ->middleware('can:view-payment_report');

                        Route::get('refunds', 'refundsReport')
                            ->middleware('can:view-refunds_report');

                        Route::get('profit', 'profitReport')
                            ->middleware('can:view-profit_report');

                        Route::get('delivery-performance', 'deliveryPerformance')
                            ->middleware('can:view-delivery_performance_report');
                    });
                });
            });
        });
    });

    Route::prefix('client')->group(function () {
        Route::middleware(['manage_client_session', 'app_auth'])->group(function () {
            Route::get('allSettings', [ClientSettingsController::class, 'index']);
            Route::get('home', [ClientHomeController::class, 'index']);
            Route::get('product/{slug}', [ClientProductController::class, 'show']);
            Route::get('shop', [ClientShopController::class, 'index']);
            Route::get('team-members', [ClientTeamMemberController::class, 'index']);

            // Google OAuth Routes
            Route::get('auth/google', [ClientAuthController::class, 'redirectToGoogle']);

            // Magic Link Routes (with recaptcha protection)
            Route::middleware(['recaptcha'])->group(function () {
                Route::post('send-magic-link', [ClientAuthController::class, 'sendMagicLink']);
                Route::post('contact', [ClientContactController::class, 'store']);
                Route::post('newsletterSubscribe', [ClientNewsletterController::class, 'subscribe']);
            });

            // Magic Link Verification (no recaptcha needed as token is already secure)
            Route::get('verify-magic-link/{token}', [ClientAuthController::class, 'verifyMagicLink']);


            Route::middleware('auth:client')->group(function () {
                Route::get('getCurrentUser', [ClientProfileController::class, 'getCurrentUser']);
                Route::post('logout', [ClientProfileController::class, 'logout']);
                Route::post('updateProfile', [ClientProfileController::class, 'update']);
                Route::post('deleteAccount', [ClientProfileController::class, 'deleteAccount']);

                Route::prefix('cart')->controller(ClientCartController::class)->group(function () {
                    Route::get('/', 'index');
                    Route::post('addOrUpdate', 'addOrUpdate');
                    Route::delete('remove', 'remove');
                });
                Route::prefix('coupon')->controller(ClientCouponController::class)->group(function () {
                    Route::get('/', 'index');
                    Route::post('apply', 'apply');
                    Route::post('remove', 'remove');
                });
                Route::prefix('coupons')->controller(ClientCouponController::class)->group(function () {
                    Route::get('/', 'index');
                });
                Route::prefix('addresses')->controller(ClientAddressController::class)->group(function () {
                    Route::get('/', 'index');
                    Route::get('default', 'defaultAddress');
                    Route::get('{address}', 'show');
                    Route::post('/', 'store');
                    Route::put('{id}', 'update');
                    Route::delete('{address}', 'destroy');
                });

                Route::post('placeOrder', [ClientCheckoutController::class, 'placeOrder']);


                Route::get('orders', [ClientOrdersController::class, 'index']);
                Route::get('orders/{order}', [ClientOrdersController::class, 'show']);

                Route::get('return-orders', [ClientReturnOrdersController::class, 'index']);
                Route::get('pre-orders', [ClientPreOrdersController::class, 'index']);
                Route::get('pre-orders/{order}', [ClientPreOrdersController::class, 'show']);

                Route::prefix('wishlist')->controller(ClientWishlistController::class)->group(function () {
                    Route::get('/', 'index');
                    Route::post('addOrRemove', 'addOrRemove');
                });
                Route::post('placeOrder', [ClientCheckoutController::class, 'placeOrder']);

                Route::prefix('reviews')->controller(ClientReviewController::class)->group(function () {

                    Route::post('/', 'store');
                    Route::put('{id}', 'update');
                    Route::delete('{review}', 'destroy');
                });
            });
        });
    });
    Route::get('auth/google/callback', [ClientAuthController::class, 'handleGoogleCallback']);
    Route::middleware(['app_auth'])->group(function () {
        Route::get('/captcha-token', [CaptchaController::class, 'getToken']);
    });
});

Route::fallback(fn() => abort(404));
