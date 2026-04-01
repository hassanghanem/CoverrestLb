<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\SizeRequest;
use App\Http\Resources\V1\Admin\AddressResource;
use App\Http\Resources\V1\Admin\BrandResource;
use App\Http\Resources\V1\Admin\CategoryResource;
use App\Http\Resources\V1\Admin\ClientResource;
use App\Http\Resources\V1\Admin\ColorResource;
use App\Http\Resources\V1\Admin\ConfigurationResource;
use App\Http\Resources\V1\Admin\OrderResource;
use App\Http\Resources\V1\Admin\ProductResource;
use App\Http\Resources\V1\Admin\ProductsVariantsResource;
use App\Http\Resources\V1\Admin\SizeResource;
use App\Http\Resources\V1\Admin\TagResource;
use App\Http\Resources\V1\Admin\WarehouseResource;
use App\Models\Address;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Client;
use App\Models\Color;
use App\Models\Configuration;
use App\Models\Contact;
use App\Models\Order;
use App\Models\Product;
use App\Models\ReturnOrder;
use App\Models\Review;
use App\Models\Size;
use App\Models\Tag;
use App\Models\Variant;
use App\Models\Warehouse;
use Exception;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Gate;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $permissions = Permission::select('id', 'name')
                ->whereNotIn('name', ['view-activity_logs'])
                ->orderBy('id', 'asc')
                ->get();

            $roles = Role::where('team_id', getPermissionsTeamId())
                ->select('id', 'name')
                ->get();

            return response()->json([
                'result' => true,
                'message' => __('Retrieved successfully.'),
                'permissions' => $permissions,
                'roles' => $roles,
                'categories' => CategoryResource::collection(Category::all()),
                'brands' => BrandResource::collection(Brand::all()),
                'colors' => ColorResource::collection(Color::get()),
                'sizes' => SizeResource::collection(Size::get()),
                'configurations' => ConfigurationResource::collection(Configuration::all()),
                'tags' => TagResource::collection(Tag::all()),
                'warehouses' => WarehouseResource::collection(Warehouse::all()),
                'availability_statuses' => [
                    ['id' => 'available', 'name' => 'Available'],
                    ['id' => 'coming_soon', 'name' => 'Coming Soon'],
                    ['id' => 'discontinued', 'name' => 'Discontinued'],
                    ['id' => 'pre_order', 'name' => 'Pre Order'],
                    ['id' => 'out_of_stock', 'name' => 'Out of Stock'],
                ],
                'order_statuses' => Order::getAllOrderStatus(),
                'payment_statuses' => Order::getPaymentStatus(),
                'order_status_transitions' => Order::STATUS_TRANSITIONS,
                'payment_status_transitions' => Order::PAYMENT_STATUS_TRANSITIONS,
                'return_order_statuses' => ReturnOrder::getAllReturnStatuses(),
                'return_order_status_transitions' => ReturnOrder::STATUS_TRANSITIONS,
                'payment_methods' => [["value" => 'cod', "label" => __("cod")], ["value" => 'whish', "label" => __("Whish Payment")]],
                'order_sources' => Order::SOURCES,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve data.'), $e);
        }
    }

    public function getAllClients(Request $request)
    {
        try {
            $perPage = $request->input('limit', 10);
            $page = $request->input('page', 1);
            $searchTerm = $request->input('search', '');

            $query = Client::query();

            if ($searchTerm) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                        ->orWhere('email', 'like', "%{$searchTerm}%")
                        ->orWhere('phone', 'like', "%{$searchTerm}%");
                });
            }

            $clients = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'result' => true,
                'message' => __('Clients retrieved successfully.'),
                'clients' => ClientResource::collection($clients),
                'total' => $clients->total(),
                'page' => $clients->currentPage(),
                'limit' => $clients->perPage(),
                'last_page' => $clients->lastPage(),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve client data.'), $e);
        }
    }
    public function getAllProductsVariants(Request $request)
    {
        try {
            $perPage = $request->input('limit', 20);
            $page = $request->input('page', 1);
            $searchTerm = $request->input('search', '');

            $query = Variant::with([
                'product',
                'product.category',
                'color',
                'size',
            ]);

            if ($searchTerm) {
                $locale = app()->getLocale();

                $query->where(function ($q) use ($searchTerm, $locale) {
                    $q->where('sku', 'like', '%' . $searchTerm . '%');
                    $q->orWhereHas('product', function ($productQuery) use ($searchTerm, $locale) {
                        $productQuery->where('barcode', 'like', '%' . $searchTerm . '%')
                            ->orWhere("name->{$locale}", 'like', '%' . $searchTerm . '%');
                    });
                    $q->orWhereHas('product.category', function ($categoryQuery) use ($searchTerm, $locale) {
                        $categoryQuery->where("name->{$locale}", 'like', '%' . $searchTerm . '%');
                    });
                });
            }

            $variants = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'result' => true,
                'message' => __('Products retrieved successfully.'),
                'productVariants' => ProductsVariantsResource::collection($variants),
                'total' => $variants->total(),
                'page' => $variants->currentPage(),
                'limit' => $variants->perPage(),
                'last_page' => $variants->lastPage(),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve product data.'), $e);
        }
    }
    public function getOrderableVariants(Request $request)
    {
        try {
            $perPage = (int) $request->input('limit', 20);
            $page = (int) $request->input('page', 1);
            $searchTerm = $request->input('search', '');
            $locale = app()->getLocale();

            $query = Variant::with([
                'product',
                'product.category',
                'color',
                'size',
            ])
                // Only products that are not discontinued
                ->whereHas('product', function ($q) {
                    $q->where('availability_status', '!=', 'discontinued');
                })
                // Only variants where summed stock adjustments (real stock) is > 0
                ->whereIn('id', function ($sub) {
                    $sub->from('stock_adjustments')
                        ->select('variant_id')
                        ->groupBy('variant_id')
                        ->havingRaw('SUM(quantity) > 0');
                });

            // Apply search filter
            if ($searchTerm) {
                $query->where(function ($q) use ($searchTerm, $locale) {
                    $q->where('sku', 'like', '%' . $searchTerm . '%')
                        ->orWhereHas('product', function ($productQuery) use ($searchTerm, $locale) {
                            $productQuery->where('barcode', 'like', '%' . $searchTerm . '%')
                                ->orWhere("name->{$locale}", 'like', '%' . $searchTerm . '%');
                        })
                        ->orWhereHas('product.category', function ($categoryQuery) use ($searchTerm, $locale) {
                            $categoryQuery->where("name->{$locale}", 'like', '%' . $searchTerm . '%');
                        });
                });
            }

            $variants = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'result' => true,
                'message' => __('Orderable variants retrieved successfully.'),
                'productVariants' => ProductsVariantsResource::collection($variants),
                'total' => $variants->total(),
                'page' => $variants->currentPage(),
                'limit' => $variants->perPage(),
                'last_page' => $variants->lastPage(),
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(__('Failed to retrieve product data.'), $e);
        }
    }

    public function getClientAddresses(Request $request)
    {
        try {
            $perPage = $request->input('limit', 20);
            $page = $request->input('page', 1);
            $searchTerm = $request->input('search', '');
            $clientId = $request->input('client_id');

            if (!$clientId || !Client::where('id', $clientId)->exists()) {
                return response()->json([
                    'result' => false,
                    'message' => __('Invalid client ID.'),
                ], 422);
            }

            $query = Address::with('client')
                ->where('client_id', $clientId);

            if ($searchTerm) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('country', 'like', "%$searchTerm%")
                        ->orWhere('city', 'like', "%$searchTerm%")
                        ->orWhere('district', 'like', "%$searchTerm%")
                        ->orWhere('governorate', 'like', "%$searchTerm%");
                });
            }

            $addresses = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'result' => true,
                'message' => __('Addresses retrieved successfully.'),
                'addresses' => AddressResource::collection($addresses),
                'total' => $addresses->total(),
                'page' => $addresses->currentPage(),
                'limit' => $addresses->perPage(),
                'last_page' => $addresses->lastPage(),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve addresses data.'), $e);
        }
    }

    public function getOrdersCanBeReturned(Request $request)
    {
        try {
            $perPage = $request->input('limit', 20);
            $page = $request->input('page', 1);
            $searchTerm = $request->input('search', '');

            $query = Order::query()
                ->with([
                    'client:id,name',
                    'orderDetails.variant:id,product_id,color_id,size_id,sku',
                    'orderDetails.variant.product:id,name',
                    'orderDetails.variant.color:id,name',
                    'orderDetails.variant.size:id,name',
                    'returnOrders.details'
                ])
                ->whereIn('status', [5, 9, 10]);

            if ($searchTerm) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('order_number', 'like', "%$searchTerm%")
                        ->orWhereHas('client', fn($client) =>
                        $client->where('name', 'like', "%$searchTerm%"));
                });
            }

            $orders = $query->latest()->get();

            $filtered = $orders->map(function ($order) {
                $returnedQtyMap = $order->returnedQuantities();

                $details = $order->orderDetails->map(function ($detail) use ($returnedQtyMap) {
                    $orderedQty = $detail->quantity;
                    $variantId = $detail->variant_id;
                    $returnedQty = $returnedQtyMap[$variantId] ?? 0;

                    $returnableQty = $orderedQty - $returnedQty;

                    if ($returnableQty > 0) {
                        $detail->quantity = $returnableQty;
                        return $detail;
                    }

                    return null;
                })->filter();

                $order->setRelation('orderDetails', $details);
                return $details->isNotEmpty() ? $order : null;
            })->filter()->values();

            $paginated = new LengthAwarePaginator(
                $filtered->forPage($page, $perPage),
                $filtered->count(),
                $perPage,
                $page
            );

            return response()->json([
                'result' => true,
                'message' => __('Order retrieved successfully.'),
                'orders' => OrderResource::collection($paginated),
                'total' => $paginated->total(),
                'page' => $paginated->currentPage(),
                'limit' => $paginated->perPage(),
                'last_page' => $paginated->lastPage(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => __('Failed to retrieve order.'),
            ]);
        }
    }


    public function getAllProductsVariantsCanBePreOrder(Request $request)
    {
        try {
            $perPage = (int) $request->input('limit', 20);
            $page = (int) $request->input('page', 1);
            $searchTerm = $request->input('search', '');
            $locale = app()->getLocale();

            $query = Variant::with([
                'product',
                'product.category',
                'color',
                'size',
            ])

                // Only variants that have total stock = 0 or no stock adjustments
                ->withSum('stockAdjustments as total_stock_quantity', 'quantity')
                ->havingRaw('COALESCE(total_stock_quantity, 0) <= 0');

            // Apply search filter
            if ($searchTerm) {
                $query->where(function ($q) use ($searchTerm, $locale) {
                    $q->where('sku', 'like', '%' . $searchTerm . '%')
                        ->orWhereHas('product', function ($productQuery) use ($searchTerm, $locale) {
                            $productQuery->where('barcode', 'like', '%' . $searchTerm . '%')
                                ->orWhere("name->{$locale}", 'like', '%' . $searchTerm . '%');
                        })
                        ->orWhereHas('product.category', function ($categoryQuery) use ($searchTerm, $locale) {
                            $categoryQuery->where("name->{$locale}", 'like', '%' . $searchTerm . '%');
                        });
                });
            }

            $variants = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'result' => true,
                'message' => __('Products retrieved successfully.'),
                'productVariants' => ProductsVariantsResource::collection($variants),
                'total' => $variants->total(),
                'page' => $variants->currentPage(),
                'limit' => $variants->perPage(),
                'last_page' => $variants->lastPage(),
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(__('Failed to retrieve product data.'), $e);
        }
    }

    public function getAllProducts(Request $request)
    {
        try {
            $perPage = $request->input('limit', 10);
            $page = $request->input('page', 1);
            $searchTerm = $request->input('search', '');

            $query = Product::with([
                'category',
                'brand',
                'images' => function ($query) {
                    $query->orderBy('arrangement', 'asc');
                },
                'variants' => function ($query) {
                    $query->where(function ($q) {
                        $q->whereNotNull('color_id');
                        $q->whereNotNull('size_id');
                    })->with(['color', 'size']);
                },
                'tags',
                'specifications',
            ]);

            if ($searchTerm) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('products.name', 'like', "%{$searchTerm}%")
                        ->orWhere('products.barcode', 'like', "%{$searchTerm}%");
                });
            }

            $products = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'result' => true,
                'message' => __('Products retrieved successfully.'),
                'products' => ProductResource::collection($products),
                'total' => $products->total(),
                'page' => $products->currentPage(),
                'limit' => $products->perPage(),
                'last_page' => $products->lastPage(),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve product data.'), $e);
        }
    }
    public function getNotifications()
    {
        try {
            $notifications = collect();
            $totalUnreadCount = 0;

            // Regular unread orders (non-preorder)
            if (Gate::allows('view-order')) {
                $unreadOrders = Order::where('is_view', false)
                    ->where('is_preorder', false)
                    ->where('is_cart', false)
                    ->with('client')
                    ->latest()
                    ->get();

                $notifications = $notifications->merge(
                    $unreadOrders->map(function ($order) {
                        return [
                            'type' => 'order',
                            'order_id' => $order->id,
                            'message' => __('New order received from :name.', ['name' => $order->client->name]),
                            'created_at' => optional($order->created_at)->toDateTimeString(),
                        ];
                    })
                );

                $unreadOrderCount = $unreadOrders->count();
                $totalUnreadCount += $unreadOrderCount;
            } else {
                $unreadOrderCount = 0;
            }

            // Unread preorders
            if (Gate::allows('view-pre_order')) {
                $unreadPreorders = Order::where('is_view', false)
                    ->where('is_preorder', true)
                    ->where('is_cart', false)
                    ->with('client')
                    ->latest()
                    ->get();

                $notifications = $notifications->merge(
                    $unreadPreorders->map(function ($order) {
                        return [
                            'type' => 'preorder',
                            'order_id' => $order->id,
                            'message' => __('New preorder received from :name.', ['name' => $order->client->name]),
                            'created_at' => optional($order->created_at)->toDateTimeString(),
                        ];
                    })
                );

                $unreadPreorderCount = $unreadPreorders->count();
                $totalUnreadCount += $unreadPreorderCount;
            } else {
                $unreadPreorderCount = 0;
            }

            // Pending return orders
            if (Gate::allows('view-return_order')) {
                $returnOrders = ReturnOrder::where('status', 0)
                    ->with(['client', 'order'])
                    ->latest()
                    ->get();

                $notifications = $notifications->merge(
                    $returnOrders->map(function ($return) {
                        return [
                            'type' => 'return_order',
                            'order_id' => $return->id,
                            'message' => __('Return order #:order_number received from :name.', [
                                'name' => $return->client->name,
                                'order_number' => $return->order_number,
                            ]),
                            'created_at' => optional($return->requested_at)->toDateTimeString(),
                        ];
                    })
                );

                $pendingReturnCount = $returnOrders->count();
                $totalUnreadCount += $pendingReturnCount;
            } else {
                $pendingReturnCount = 0;
            }

            // Unread contact messages
            if (Gate::allows('view-contacts')) {
                $unreadContacts = Contact::where('is_view', false)
                    ->latest()
                    ->get();

                $notifications = $notifications->merge(
                    $unreadContacts->map(function ($contact) {
                        return [
                            'type' => 'contact',
                            'contact_id' => $contact->id,
                            'message' => __('New contact message from :name (:subject).', [
                                'name' => $contact->name,
                                'subject' => $contact->subject,
                            ]),
                            'created_at' => optional($contact->created_at)->toDateTimeString(),
                        ];
                    })
                );

                $unreadContactCount = $unreadContacts->count();
                $totalUnreadCount += $unreadContactCount;
            } else {
                $unreadContactCount = 0;
            }

            // 🔔 Unread reviews
            if (Gate::allows('view-review')) {
                $unreadReviews = Review::where('is_view', false)
                    ->with('client')
                    ->latest()
                    ->get();

                $notifications = $notifications->merge(
                    $unreadReviews->map(function ($review) {
                        return [
                            'type' => 'review',
                            'review_id' => $review->id,
                            'message' => __('New review from :name.', [
                                'name' => $review->client->name ?? __('Unknown client'),
                            ]),
                            'created_at' => optional($review->created_at)->toDateTimeString(),
                        ];
                    })
                );

                $unreadReviewCount = $unreadReviews->count();
                $totalUnreadCount += $unreadReviewCount;
            } else {
                $unreadReviewCount = 0;
            }

            // Sort all merged notifications by creation date
            $notifications = $notifications->sortByDesc('created_at')->values();

            return response()->json([
                'result' => true,
                'notifications' => $notifications,
                'unread_order_count' => $unreadOrderCount,
                'unread_preorder_count' => $unreadPreorderCount,
                'pending_return_count' => $pendingReturnCount,
                'unread_contact_count' => $unreadContactCount,
                'unread_review_count' => $unreadReviewCount,
                'total_unread_count' => $totalUnreadCount,
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(__('Failed to retrieve notifications.'), $e);
        }
    }
}
