<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\Client;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class ReportsController extends Controller
{
    public function salesReport(Request $request)
    {
        try {
            $validated = $request->validate([
                'from' => 'nullable|date',
                'to' => 'nullable|date|after_or_equal:from',
                'status' => 'nullable|integer|min:0|max:10',
            ], [
                'from.date' => __('The from date must be a valid date.'),
                'to.date' => __('The to date must be a valid date.'),
                'to.after_or_equal' => __('The to date must be after or equal to the from date.'),
                'status.integer' => __('The status must be a integer.'),
            ]);

            $from = $validated['from'] ?? Carbon::now()->subMonth();
            $to = $validated['to'] ?? Carbon::now();
            $status = $validated['status'] ?? null;

            $query = Order::with(['client', 'orderDetails.variant.product.category', 'returnOrders.details'])
                ->whereBetween('created_at', [$from, $to])
                ->where('is_cart', 0)
                ->where('is_preorder', 0);


            if (!is_null($status)) {
                $query->where('status', $status);
            }
            $orders = $query->get();

            $report = $orders->map(function ($order) {
                $totalRefunds = $order->returnOrders
                    ->whereIn('status', [1, 3])
                    ->sum(fn($r) => $r->details->sum('refund_amount'));

                $netRevenue = max(($order->subtotal ?? 0) - $totalRefunds, 0);

                return [
                    'order_number' => $order->order_number,
                    'client_name' => $order->client->name ?? '-',
                    'total_items' => $order->orderDetails->sum('quantity'),
                    'total_amount' => round($netRevenue, 2),
                    'status' => $order->status['name'] ?? $order->status,
                    'created_at' => $order->created_at,
                    'delivered_at' => $order->delivered_at,
                ];
            });

            return response()->json([
                'result' => true,
                'message' => __('Sales report retrieved successfully.'),
                'data' => $report,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve sales report.'), $e);
        }
    }


    public function productReport(Request $request)
    {
        try {
            $validated = $request->validate([
                'from' => 'nullable|date',
                'to' => 'nullable|date|after_or_equal:from',
            ], [
                'from.date' => __('The from date must be a valid date.'),
                'to.date' => __('The to date must be a valid date.'),
                'to.after_or_equal' => __('The to date must be after or equal to the from date.'),
            ]);

            $from = $validated['from'] ?? Carbon::now()->subMonth();
            $to = $validated['to'] ?? Carbon::now();

            // Get products with aggregated sales info
            $report = Product::select([
                'products.id',
                'products.name',
                'products.category_id',
                DB::raw('SUM(order_details.quantity) as total_sold'),
                DB::raw('SUM(order_details.price * order_details.quantity) as gross_revenue'),
                DB::raw('SUM(COALESCE(return_order_details.refund_amount,0)) as total_refunds'),
            ])
                ->join('variants', 'variants.product_id', '=', 'products.id')
                ->join('order_details', 'order_details.variant_id', '=', 'variants.id')
                ->join('orders', 'orders.id', '=', 'order_details.order_id')
                ->leftJoin('return_order_details', function ($join) {
                    $join->on('return_order_details.variant_id', '=', 'variants.id')
                        ->join('return_orders', 'return_orders.id', '=', 'return_order_details.return_order_id')
                        ->whereIn('return_orders.status', [1, 3]);
                })
                ->whereBetween('orders.created_at', [$from, $to])
                ->whereIn('orders.status', [10])
                ->groupBy('products.id', 'products.name', 'products.category_id')
                ->orderByDesc(DB::raw('(SUM(order_details.price * order_details.quantity) - SUM(COALESCE(return_order_details.refund_amount,0)))'))
                ->get()
                ->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'name' => $p->name,
                        'category' => $p->category_id ? Category::find($p->category_id)?->getTranslation('name', app()->getLocale()) : null,
                        'total_sold' => (int) $p->total_sold,
                        'net_revenue' => round($p->gross_revenue - $p->total_refunds, 2),
                    ];
                });

            return response()->json([
                'result' => true,
                'message' => __('Product report retrieved successfully.'),
                'data' => $report,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve product report.'), $e);
        }
    }

    public function categoryReport(Request $request)
    {
        try {
            $validated = $request->validate([
                'from' => 'nullable|date',
                'to' => 'nullable|date|after_or_equal:from',
            ], [
                'from.date' => __('The from date must be a valid date.'),
                'to.date' => __('The to date must be a valid date.'),
                'to.after_or_equal' => __('The to date must be after or equal to the from date.'),
            ]);

            $from = $validated['from'] ?? Carbon::now()->subMonth();
            $to = $validated['to'] ?? Carbon::now();

            $report = Category::select([
                'categories.id',
                'categories.name',
                DB::raw('SUM(order_details.price * order_details.quantity) as gross_sales'),
                DB::raw('SUM(order_details.quantity) as total_sold'),
                DB::raw('SUM(COALESCE(return_order_details.refund_amount,0)) as total_refunds')
            ])
                ->join('products', 'products.category_id', '=', 'categories.id')
                ->join('variants', 'variants.product_id', '=', 'products.id')
                ->join('order_details', 'order_details.variant_id', '=', 'variants.id')
                ->join('orders', 'orders.id', '=', 'order_details.order_id')
                ->leftJoin('return_order_details', function ($join) {
                    $join->on('return_order_details.variant_id', '=', 'variants.id')
                        ->join('return_orders', 'return_orders.id', '=', 'return_order_details.return_order_id')
                        ->whereIn('return_orders.status', [1, 3]);
                })
                ->whereBetween('orders.created_at', [$from, $to])
                ->whereIn('orders.status', [10])
                ->groupBy('categories.id', 'categories.name')
                ->orderByDesc(DB::raw('(SUM(order_details.price * order_details.quantity) - SUM(COALESCE(return_order_details.refund_amount,0)))'))
                ->get()
                ->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'total_sold' => (int)$c->total_sold,
                    'net_revenue' => round($c->gross_sales - $c->total_refunds, 2),
                ]);

            return response()->json([
                'result' => true,
                'message' => __('Category report retrieved successfully.'),
                'data' => $report,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve category report.'), $e);
        }
    }

    public function clientReport(Request $request)
    {
        try {
            $validated = $request->validate([
                'from' => 'nullable|date',
                'to' => 'nullable|date|after_or_equal:from',
            ], [
                'from.date' => __('The from date must be a valid date.'),
                'to.date' => __('The to date must be a valid date.'),
                'to.after_or_equal' => __('The to date must be after or equal to the from date.'),
            ]);

            $from = $validated['from'] ?? Carbon::now()->subMonth();
            $to = $validated['to'] ?? Carbon::now();

            $clients = Client::with(['orders.orderDetails', 'orders.returnOrders.details'])
                ->get()
                ->map(function ($client) use ($from, $to) {
                    $orders = $client->orders->filter(
                        fn($o) =>
                        $o->created_at >= $from && $o->created_at <= $to && $o->status['name'] === 'Completed'
                    );

                    $totalSpent = $orders->sum(function ($order) {
                        $refunds = $order->returnOrders
                            ->whereIn('status', [1, 3])
                            ->sum(fn($r) => $r->details->sum('refund_amount'));

                        return max(($order->subtotal ?? 0) - $refunds, 0);
                    });

                    return [
                        'id' => $client->id,
                        'name' => $client->name,
                        'email' => $client->email,
                        'total_orders' => $orders->count(),
                        'total_spent' => round($totalSpent, 2),
                        'avg_order_value' => $orders->count() ? round($totalSpent / $orders->count(), 2) : 0,
                    ];
                })->sortByDesc('total_spent')->values();

            return response()->json([
                'result' => true,
                'message' => __('Client report retrieved successfully.'),
                'data' => $clients,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve client report.'), $e);
        }
    }

    public function paymentReport(Request $request)
    {
        try {
            $validated = $request->validate([
                'from' => 'nullable|date',
                'to' => 'nullable|date|after_or_equal:from',
            ], [
                'from.date' => __('The from date must be a valid date.'),
                'to.date' => __('The to date must be a valid date.'),
                'to.after_or_equal' => __('The to date must be after or equal to the from date.'),
            ]);

            $from = $validated['from'] ?? Carbon::now()->subMonth();
            $to = $validated['to'] ?? Carbon::now();

            $orders = Order::with(['returnOrders.details'])
                ->whereBetween('created_at', [$from, $to])
                ->whereIn('status', [10])
                ->get();

            $report = $orders->groupBy('payment_method')->map(function ($orders, $method) {
                $revenue = $orders->sum(function ($order) {
                    $refunds = $order->returnOrders
                        ->whereIn('status', [1, 3])
                        ->sum(fn($r) => $r->details->sum('refund_amount'));

                    return max(($order->subtotal ?? 0) - $refunds, 0);
                });

                return ['payment_method' => $method, 'net_revenue' => round($revenue, 2)];
            })->values();

            return response()->json([
                'result' => true,
                'message' => __('Payment report retrieved successfully.'),
                'data' => $report,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve payment report.'), $e);
        }
    }

    public function refundsReport(Request $request)
    {
        try {
            $validated = $request->validate([
                'from' => 'nullable|date',
                'to' => 'nullable|date|after_or_equal:from',
            ], [
                'from.date' => __('The from date must be a valid date.'),
                'to.date' => __('The to date must be a valid date.'),
                'to.after_or_equal' => __('The to date must be after or equal to the from date.'),
            ]);

            $from = $validated['from'] ?? Carbon::now()->subMonth();
            $to = $validated['to'] ?? Carbon::now();

            $report = DB::table('return_orders')
                ->join('return_order_details', 'return_orders.id', '=', 'return_order_details.return_order_id')
                ->join('variants', 'variants.id', '=', 'return_order_details.variant_id')
                ->join('products', 'products.id', '=', 'variants.product_id')
                ->join('clients', 'clients.id', '=', 'return_orders.client_id')
                ->whereBetween('return_orders.created_at', [$from, $to])
                ->whereIn('return_orders.status', [1, 3])
                ->select(
                    'products.name as product_name',
                    'clients.name as client_name',
                    DB::raw('SUM(return_order_details.refund_amount) as total_refund'),
                    DB::raw('COUNT(DISTINCT return_orders.id) as total_refund_orders')
                )
                ->groupBy('products.name', 'clients.name')
                ->orderByDesc('total_refund')
                ->get();

            return response()->json([
                'result' => true,
                'message' => __('Refunds report retrieved successfully.'),
                'data' => $report,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve refunds report.'), $e);
        }
    }

    public function profitReport(Request $request)
    {
        try {
            $validated = $request->validate([
                'from' => 'nullable|date',
                'to' => 'nullable|date|after_or_equal:from',
                'status' => 'nullable|integer|min:0|max:10',
            ], [
                'from.date' => __('The from date must be a valid date.'),
                'to.date' => __('The to date must be a valid date.'),
                'to.after_or_equal' => __('The to date must be after or equal to the from date.'),
                'status.integer' => __('The status must be a integer.'),
            ]);

            $from = $validated['from'] ?? Carbon::now()->subMonth();
            $to = $validated['to'] ?? Carbon::now();
            $status = $validated['status'] ?? null;

            $query = Order::with(['client', 'orderDetails', 'returnOrders.details'])
                ->whereBetween('created_at', [$from, $to])
                ->where('is_cart', 0)
                ->where('is_preorder', 0);

            if (!is_null($status)) {
                $query->where('status', $status);
            }

            $orders = $query->get();

            $report = $orders->map(function ($order) {
                $totalCost = 0;
                $totalRevenue = 0;

                // Calculate cost and revenue from order details
                foreach ($order->orderDetails as $detail) {
                    $cost = (float) ($detail->cost ?? 0);
                    $price = (float) ($detail->price ?? 0);
                    $discount = (float) ($detail->discount ?? 0);
                    $quantity = (int) ($detail->quantity ?? 0);

                    $totalCost += $cost * $quantity;
                    $totalRevenue += ($price - $discount) * $quantity;
                }

                // Calculate refunds
                $totalRefunds = $order->returnOrders
                    ->whereIn('status', [1, 3])
                    ->sum(fn($r) => $r->details->sum('refund_amount'));

                $netRevenue = max($totalRevenue - $totalRefunds, 0);
                $profit = max($netRevenue - $totalCost, 0);

                return [
                    'order_number' => $order->order_number,
                    'client_name' => $order->client->name ?? '-',
                    'total_items' => $order->orderDetails->sum('quantity'),
                    'gross_revenue' => round($totalRevenue, 2),
                    'total_cost' => round($totalCost, 2),
                    'total_refunds' => round($totalRefunds, 2),
                    'net_revenue' => round($netRevenue, 2),
                    'profit' => round($profit, 2),
                    'profit_margin' => $netRevenue > 0 ? round(($profit / $netRevenue) * 100, 2) : 0,
                    'status' => $order->status['name'] ?? $order->status,
                    'created_at' => $order->created_at,
                    'delivered_at' => $order->delivered_at,
                ];
            })->sortByDesc('profit')->values();

            return response()->json([
                'result' => true,
                'message' => __('Profit report retrieved successfully.'),
                'data' => $report,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve profit report.'), $e);
        }
    }

    public function deliveryPerformance(Request $request)
    {
        try {
            $validated = $request->validate([
                'from' => 'nullable|date',
                'to' => 'nullable|date|after_or_equal:from',
            ], [
                'from.date' => __('The from date must be a valid date.'),
                'to.date' => __('The to date must be a valid date.'),
                'to.after_or_equal' => __('The to date must be after or equal to the from date.'),
            ]);

            $from = $validated['from'] ?? Carbon::now()->subMonth();
            $to = $validated['to'] ?? Carbon::now();

            $report = Order::select(
                'id',
                'order_number',
                'created_at',
                'shipped_at',
                'delivered_at',
                DB::raw('TIMESTAMPDIFF(HOUR, shipped_at, delivered_at) as delivery_hours'),
                DB::raw('TIMESTAMPDIFF(HOUR, created_at, shipped_at) as processing_hours')
            )
                ->whereBetween('created_at', [$from, $to])
                ->whereIn('status', [10])
                ->get();

            return response()->json([
                'result' => true,
                'message' => __('Delivery performance report retrieved successfully.'),
                'data' => $report,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve delivery performance report.'), $e);
        }
    }
}
