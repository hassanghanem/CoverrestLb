<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Client;
use App\Models\ClientSession;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\Variant;
use App\Models\ReturnOrder;
use App\Models\ReturnOrderDetail;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Date ranges
            $today = Carbon::today();
            $startMonth = Carbon::now()->startOfMonth();
            $last30Days = Carbon::now()->subDays(30);
            $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
            $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

            // Base query for completed orders
            $baseCompleted = Order::with(['returnOrders', 'orderDetails'])
                ->whereIn('status', [10])
                ->where('is_cart', false)
                ->where('is_preorder', false);

            // Helper: calculate net revenue for an order
            $calculateNetRevenue = function ($order) {
                // Revenue from products only (exclude delivery)
                $orderProductsTotal = $order->subtotal ?? 0;

                // Sum of approved/completed return refunds (product refunds only)
                $totalRefunds = 0;
                if ($order->relationLoaded('returnOrders')) {
                    $totalRefunds = $order->returnOrders
                        ->whereIn('status', [1, 3])
                        ->sum(fn($r) => $r->details->sum('refund_amount'));
                } else {
                    $totalRefunds = ReturnOrderDetail::whereHas('returnOrder', function ($q) use ($order) {
                        $q->where('order_id', $order->id)
                            ->whereIn('status', [1, 3]);
                    })
                        ->sum('refund_amount');
                }

                return max($orderProductsTotal - $totalRefunds, 0);
            };

            // Helper: calculate profit for an order
            $calculateProfit = function ($order) {
                if (!$order->relationLoaded('orderDetails')) {
                    $order->load('orderDetails');
                }

                $totalProfit = 0;
                foreach ($order->orderDetails as $detail) {
                    $cost = (float) ($detail->cost ?? 0);
                    $price = (float) ($detail->price ?? 0);
                    $discount = (float) ($detail->discount ?? 0);
                    $quantity = (int) ($detail->quantity ?? 0);
                    
                    // Profit = (price - discount - cost) * quantity
                    $profit = ($price - $discount - $cost) * $quantity;
                    $totalProfit += max($profit, 0);
                }

                // Account for refunds (reduce profit by refund amount)
                $totalRefunds = 0;
                if ($order->relationLoaded('returnOrders')) {
                    $totalRefunds = $order->returnOrders
                        ->whereIn('status', [1, 3])
                        ->sum(fn($r) => $r->details->sum('refund_amount'));
                } else {
                    $totalRefunds = ReturnOrderDetail::whereHas('returnOrder', function ($q) use ($order) {
                        $q->where('order_id', $order->id)
                            ->whereIn('status', [1, 3]);
                    })
                        ->sum('refund_amount');
                }

                return max($totalProfit - $totalRefunds, 0);
            };

            // ========== KPI CALCULATIONS ==========

            // Revenue metrics
            $allCompletedOrders = $baseCompleted->get();
            $totalRevenue = $allCompletedOrders->sum($calculateNetRevenue);
            $totalProfit = $allCompletedOrders->sum($calculateProfit);

            $monthlyOrders = (clone $baseCompleted)->where('created_at', '>=', $startMonth)->get();
            $monthlyRevenue = $monthlyOrders->sum($calculateNetRevenue);
            $monthlyProfit = $monthlyOrders->sum($calculateProfit);

            $prevMonthOrders = (clone $baseCompleted)->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->get();
            $prevRevenue = $prevMonthOrders->sum($calculateNetRevenue);
            $prevProfit = $prevMonthOrders->sum($calculateProfit);

            // Order metrics
            $totalOrdersCount = Order::where('is_cart', false)->count();
            $completedOrdersCount = (clone $baseCompleted)->count();
            $pendingOrdersCount = Order::whereIn('status', [1, 2, 3, 4, 5, 6, 7, 8, 9])
                ->where('is_cart', false)
                ->count();

            // Return/Refund metrics
            $totalRefundsAmount = ReturnOrderDetail::whereHas('returnOrder', function ($q) {
                $q->whereIn('status', [1, 3]);
            })->sum('refund_amount');

            $totalReturnOrdersCount = ReturnOrder::whereIn('status', [1, 3])->count();

            // Customer metrics
            $totalClients = Client::count();
            $activeClients = Client::where('is_active', true)->count();
            $conversionRate = $totalClients > 0 ? round(($activeClients / $totalClients) * 100, 2) : 0;

            // Customer acquisition metrics
            $customersThisMonth = Client::whereHas('orders', fn($q) => $q->where('created_at', '>=', $startMonth))->get();
            $newCustomersThisMonth = $customersThisMonth->where(fn($c) => !$c->orders()->where('created_at', '<', $startMonth)->exists())->count();

            $repeatCustomers = Client::whereHas('orders', fn($q) => $q->where('is_cart', false))
                ->withCount('orders')
                ->having('orders_count', '>', 1)
                ->count();

            // Performance metrics
            $avgOrderValue = $completedOrdersCount > 0
                ? round($monthlyOrders->sum($calculateNetRevenue) / max(1, $monthlyOrders->count()), 2)
                : 0;


            $growthRate = $prevRevenue > 0
                ? round((($monthlyRevenue - $prevRevenue) / $prevRevenue) * 100, 2)
                : ($monthlyRevenue > 0 ? 100 : 0);

            $returnsRate = $totalOrdersCount > 0 ? round(($totalReturnOrdersCount / max(1, $totalOrdersCount)) * 100, 2) : 0;

            // Inventory metrics
            $abandonedCartsCount = Order::where('is_cart', true)->where('created_at', '>=', $last30Days)->count();

            $inventoryValuation = Variant::with('product')->get();
            $totalInventoryValue = $inventoryValuation->sum(function ($v) {
                $available = (float) ($v->available_quantity ?? 0);
                $price = (float) ($v->product?->price ?? 0);
                return $available * $price;
            });

            $lowStockCount = $inventoryValuation->filter(fn($v) => ($v->available_quantity ?? 0) <= 5)->count();

            // Fulfillment metrics
            $avgFulfillmentDays = Order::whereNotNull('shipped_at')
                ->whereNotNull('delivered_at')
                ->where('is_cart', false)
                ->avg(DB::raw('TIMESTAMPDIFF(SECOND, shipped_at, delivered_at)'));
            $avgFulfillmentDays = $avgFulfillmentDays ? round($avgFulfillmentDays / 86400, 2) : null;

            $avgRefundPerReturn = $totalReturnOrdersCount > 0 ? round($totalRefundsAmount / max(1, $totalReturnOrdersCount), 2) : 0;

            // Session metrics
            $totalSessions = ClientSession::count();
            $customersWithOrdersThisMonth = Client::whereHas('orders', fn($q) => $q->where('created_at', '>=', $startMonth))->get();
            $newThisMonth = $customersWithOrdersThisMonth->filter(function ($c) use ($startMonth) {
                return !$c->orders()->where('created_at', '<', $startMonth)->exists();
            })->count();
            $returningThisMonth = $customersWithOrdersThisMonth->count() - $newThisMonth;

            // ========== CHARTS & TRENDS ==========

            // 1) Revenue by day (last 30 days)
            $completedLast30 = (clone $baseCompleted)->where('created_at', '>=', $last30Days)->get();
            $revenueByDay = $completedLast30
                ->groupBy(fn($o) => $o->created_at->format('Y-m-d'))
                ->map(function ($orders, $date) use ($calculateNetRevenue) {
                    $net = $orders->sum($calculateNetRevenue);
                    return ['date' => $date, 'total' => round($net, 2)];
                })
                ->sortBy('date')
                ->values();

            // 1.5) Profit by day (last 30 days)
            $profitByDay = $completedLast30
                ->groupBy(fn($o) => $o->created_at->format('Y-m-d'))
                ->map(function ($orders, $date) use ($calculateProfit) {
                    $profit = $orders->sum($calculateProfit);
                    return ['date' => $date, 'total' => round($profit, 2)];
                })
                ->sortBy('date')
                ->values();

            // 2) Orders by status
            $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
                ->where('is_cart', false)
                ->groupBy('status')
                ->get()
                ->map(fn($r) => ['status' => $r->status, 'count' => $r->count]);

            // 3) Refunds by day (last 30 days)
            $refundsByDay = ReturnOrder::whereIn('status', [1, 3])
                ->where('created_at', '>=', $last30Days)
                ->get()
                ->groupBy(fn($r) => $r->created_at->format('Y-m-d'))
                ->map(fn($rs, $date) => [
                    'date' => $date,
                    'refunds_count' => $rs->count(),
                    'refund_amount' => round($rs->sum('total_refund_amount'), 2),
                ])
                ->sortBy('date')
                ->values();

            // 4) Orders by day (count) - last 30 days
            $ordersByDay = Order::where('created_at', '>=', $last30Days)
                ->where('is_cart', false)
                ->get()
                ->groupBy(fn($o) => $o->created_at->format('Y-m-d'))
                ->map(fn($orders, $date) => [
                    'date' => $date,
                    'orders_count' => $orders->count(),
                    'avg_order_value' => round($orders->sum('grand_total') / max(1, $orders->count()), 2),
                ])
                ->sortBy('date')
                ->values();

            // 5) Top products by net quantity
            $topProducts = Product::select([
                'products.id',
                'products.name',
                DB::raw('COALESCE(SUM(order_details.quantity), 0) as total_ordered'),
                DB::raw('COALESCE(SUM(return_order_details.quantity), 0) as total_returned'),
                DB::raw('COALESCE(SUM(order_details.quantity * order_details.price), 0) as gross_revenue')
            ])
                ->join('variants', 'variants.product_id', '=', 'products.id')
                ->join('order_details', 'order_details.variant_id', '=', 'variants.id')
                ->join('orders', 'orders.id', '=', 'order_details.order_id')
                ->leftJoin('return_order_details', function ($join) {
                    $join->on('return_order_details.variant_id', '=', 'variants.id')
                        ->join('return_orders', 'return_orders.id', '=', 'return_order_details.return_order_id')
                        ->whereIn('return_orders.status', [1, 3]);
                })
                ->where('orders.is_cart', false)
                ->where('orders.is_preorder', false)
                ->whereIn('orders.status', [10])
                ->groupBy('products.id', 'products.name')
                ->havingRaw('(COALESCE(SUM(order_details.quantity),0) - COALESCE(SUM(return_order_details.quantity),0)) > 0')
                ->orderByDesc(DB::raw('(COALESCE(SUM(order_details.quantity),0) - COALESCE(SUM(return_order_details.quantity),0))'))
                ->take(10)
                ->get()
                ->map(function ($product) {
                    $netQty = max(($product->total_ordered - $product->total_returned), 0);
                    $netRevenue = max(($product->gross_revenue - 0), 0);
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'net_quantity' => (int)$netQty,
                        'gross_revenue' => round($netRevenue, 2),
                    ];
                });

            // 6) Sales by category
            $salesByCategory = DB::table('order_details')
                ->join('variants', 'order_details.variant_id', '=', 'variants.id')
                ->join('products', 'variants.product_id', '=', 'products.id')
                ->join('orders', 'orders.id', '=', 'order_details.order_id')
                ->leftJoin('return_order_details', function ($join) {
                    $join->on('return_order_details.variant_id', '=', 'variants.id')
                        ->join('return_orders', 'return_orders.id', '=', 'return_order_details.return_order_id')
                        ->whereIn('return_orders.status', [1, 3]);
                })
                ->where('orders.is_cart', false)
                ->where('orders.is_preorder', false)
                ->whereIn('orders.status', [10])
                ->select([
                    'products.category_id',
                    DB::raw('COALESCE(SUM(order_details.price * order_details.quantity), 0) as gross_sales'),
                    DB::raw('COALESCE(SUM(return_order_details.refund_amount), 0) as total_refunds'),
                ])
                ->groupBy('products.category_id')
                ->get()
                ->map(function ($row) {
                    $category = Category::find($row->category_id);

                    return [
                        'category_id' => $row->category_id,
                        'product_category' => $category ? $category->getTranslation('name', app()->getLocale()) : null,
                        'total' => round(max($row->gross_sales - $row->total_refunds, 0), 2),
                    ];
                });
            // 7) Top customers
            $topCustomers = Client::with(['orders.orderDetails'])
                ->whereHas('orders', function ($q) {
                    $q->where('is_cart', false)->whereIn('status', [10]);
                })
                ->get()
                ->map(function ($client) {
                    $totalSpent = $client->orders->sum(fn($o) => $o->grand_total);
                    return [
                        'id' => $client->id,
                        'name' => $client->name,
                        'total_spent' => round($totalSpent, 2),
                        'orders_count' => $client->orders->count(),
                    ];
                })
                ->sortByDesc('total_spent')
                ->take(10)
                ->values();

            // 8) Coupon usage
            $couponUsage = Coupon::with(['orders' => function ($q) {
                $q->where('is_cart', false)->whereIn('status', [10]);
            }, 'orders.orderDetails'])
                ->get()
                ->map(function ($coupon) {
                    $uses = $coupon->orders->count();
                    $revenue = $coupon->orders->sum(fn($o) => $o->grand_total);
                    return [
                        'id' => $coupon->id,
                        'code' => $coupon->code,
                        'uses' => $uses,
                        'revenue' => round($revenue, 2),
                    ];
                })
                ->sortByDesc('uses')
                ->take(10)
                ->values();

          

            // 10) Sessions by device
            $sessionsByDevice = ClientSession::select([
                DB::raw("CASE 
                        WHEN user_agent LIKE '%Mobile%' THEN 'mobile'
                        WHEN user_agent LIKE '%Windows%' THEN 'desktop'
                        WHEN user_agent LIKE '%Macintosh%' THEN 'desktop'
                        WHEN user_agent LIKE '%Android%' THEN 'mobile'
                        WHEN user_agent LIKE '%iPhone%' THEN 'mobile'
                        ELSE 'other' END as device"),
                DB::raw('COUNT(*) as count')
            ])
                ->groupBy('device')
                ->get()
                ->map(fn($r) => ['device' => $r->device, 'count' => (int)$r->count]);

            // ========== RESPONSE ==========

            return response()->json([
                'result' => true,
                'message' => __('Dashboard retrieved successfully.'),
                'kpis' => [
                    // Revenue KPIs
                    'totalRevenue' => round($totalRevenue, 2),
                    'monthlyRevenue' => round($monthlyRevenue, 2),
                    'growthRate' => $growthRate,
                    'avgOrderValue' => round($avgOrderValue, 2),

                    // Profit KPIs
                    'totalProfit' => round($totalProfit, 2),
                    'monthlyProfit' => round($monthlyProfit, 2),
                    'profitMargin' => $totalRevenue > 0 ? round(($totalProfit / $totalRevenue) * 100, 2) : 0,

                    // Order KPIs
                    'totalOrders' => (int)$totalOrdersCount,
                    'completedOrders' => (int)$completedOrdersCount,
                    'pendingOrders' => (int)$pendingOrdersCount,

                    // Customer KPIs
                    'totalClients' => (int)$totalClients,
                    'activeClients' => (int)$activeClients,
                    'conversionRate' => $conversionRate,
                    'repeatCustomers' => (int)$repeatCustomers,
                    'newCustomersThisMonth' => (int)$newCustomersThisMonth,

                    // Return/Refund KPIs
                    'returnsRate' => $returnsRate,
                    'totalRefundsAmount' => round($totalRefundsAmount, 2),
                    'totalReturnOrders' => (int)$totalReturnOrdersCount,
                    'avgRefundPerReturn' => $avgRefundPerReturn,

                    // Inventory KPIs
                    'abandonedCarts' => (int)$abandonedCartsCount,
                    'inventoryValue' => round($totalInventoryValue, 2),
                    'lowStockCount' => $lowStockCount,

                    // Performance KPIs
                    'avgFulfillmentDays' => $avgFulfillmentDays,
                    'totalSessions' => (int)$totalSessions,
                ],
                'charts' => [
                    'revenueByDay' => $revenueByDay,
                    'profitByDay' => $profitByDay,
                    'ordersByDay' => $ordersByDay,
                    'ordersByStatus' => $ordersByStatus,
                    'refundsByDay' => $refundsByDay,
                    'topProducts' => $topProducts,
                    'salesByCategory' => $salesByCategory,
                    'topCustomers' => $topCustomers,
                    'couponUsage' => $couponUsage,
                    'sessionsByDevice' => $sessionsByDevice,
                    'newVsReturning' => [
                        'new' => (int)$newThisMonth,
                        'returning' => (int)$returningThisMonth,
                    ],
                ],
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve dashboard data.'), $e);
        }
    }
}
