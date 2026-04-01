@extends('emails.layouts.client')

@section('title', __('New Order Received') . ' - #' . $order->order_number)

@section('header-title', __('New Order Received'))
@section('header-subtitle', __('Order') . ' #' . $order->order_number)

@push('styles')
    <style>
        .product-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }

        .product-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .product-details h4 {
            margin: 0 0 5px;
            font-size: 16px;
            color: #333;
            font-weight: 600;
        }

        .product-details p {
            margin: 0;
            font-size: 14px;
            color: #666;
        }

        .variant-info {
            font-size: 14px;
            color: #555;
        }

        .admin-highlight {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
        }

        @media only screen and (max-width: 600px) {
            .product-info {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }

            .product-image {
                width: 60px;
                height: 60px;
            }

            .data-table th,
            .data-table td {
                padding: 8px 6px;
                font-size: 13px;
            }
        }
    </style>
@endpush

@section('content')
    <div class="admin-highlight">
        <h3>🎉 {{ __('New Order Alert') }}</h3>
        <p>{{ __('A new order has been placed and requires your attention. Please login to your admin panel to manage this order.') }}
        </p>
    </div>

    <div class="info-box primary">
        <h3>{{ __('Order Information') }}</h3>
        <p><strong>{{ __('Order Number') }}:</strong> #{{ $order->order_number }}</p>
        <p><strong>{{ __('Order Date') }}:</strong> {{ $order->created_at->format('Y-m-d H:i:s') }}</p>
        <p><strong>{{ __('Customer') }}:</strong> {{ $order->client->name ?? 'N/A' }}</p>
        <p><strong>{{ __('Customer Email') }}:</strong> {{ $order->client->email ?? 'N/A' }}</p>
        <p><strong>{{ __('Customer Phone') }}:</strong> {{ $order->client->phone ?? 'N/A' }}</p>
        <p><strong>{{ __('Payment Method') }}:</strong> {{ __($order->payment_method) }}</p>
        <p><strong>{{ __('Payment Status') }}:</strong> {{ $order->payment_status ? __('Paid') : __('Pending') }}</p>
        @if ($order->is_preorder)
            <p><strong>{{ __('Order Type') }}:</strong> <span style="color: #ff6b35; font-weight: bold;">🔄
                    {{ __('Pre-order') }}</span></p>
        @endif
        @if ($order->notes)
            <p><strong>{{ __('Customer Notes') }}:</strong> <em>"{{ $order->notes }}"</em></p>
        @endif
    </div>
    @if ($order->address_info)
        @php
            $address = is_array($order->address_info) ? $order->address_info : json_decode($order->address_info, true);

            $recipientName = $address['recipient_name'] ?? null;
            $addressLine = $address['address'] ?? null;
            $city = $address['city'] ?? null;
            $phone = $address['phone_number'] ?? ($address['phone'] ?? null);
            $notes = $address['notes'] ?? null;
            $lat = $address['latitude'] ?? null;
            $lng = $address['longitude'] ?? null;
        @endphp

        @if ($address)
            <div class="info-box">
                <h3>📍 {{ __('Delivery Address') }}</h3>

                @if ($recipientName)
                    <p><strong>{{ __('Recipient') }}:</strong> {{ $recipientName }}</p>
                @endif
                @if ($city)
                    <p><strong>{{ __('City') }}:</strong> {{ $city }}</p>
                @endif
                @if ($addressLine)
                    <p style="margin: 5px 0;">
                        <strong>{{ __('Address') }}:</strong>
                        {{ $addressLine }}
                    </p>
                @endif

                @if ($phone)
                    <p><strong>📞 {{ __('Phone') }}:</strong> {{ $phone }}</p>
                @endif

                @if ($notes)
                    <div
                        style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 6px; border-left: 3px solid #007bff;">
                        <p style="margin: 0;"><strong>📝 {{ __('Delivery Notes') }}:</strong></p>
                        <p style="margin: 5px 0 0; font-style: italic;">"{{ $notes }}"</p>
                    </div>
                @endif

                @if (!empty($lat) && !empty($lng))
                    <div
                        style="margin-top: 15px; padding: 10px; background-color: #e8f5e8; border-radius: 6px; border-left: 3px solid #28a745;">
                        <p style="margin: 5px 0 0; font-size: 12px;">
                            <a href="https://maps.google.com/?q={{ $lat }},{{ $lng }}" target="_blank"
                                style="color: #007bff; text-decoration: none;">
                                🌍 {{ __('View on Google Maps') }}
                            </a>
                        </p>
                    </div>
                @endif
            </div>
        @endif
    @endif


    <h3>{{ __('Order Items') }}</h3>
    <table class="data-table">
        <thead>
            <tr>
                <th>{{ __('Product') }}</th>
                <th>{{ __('Price') }}</th>
                <th>{{ __('Discount') }}</th>
                <th>{{ __('Quantity') }}</th>
                <th>{{ __('Total') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($order->orderDetails as $detail)
                <tr>
                    <td>
                        <div class="product-info">
                            @php
                                // Get variant image or fallback to product image
                                $variantImage = $detail->variant->images->first();
                                $productImage = $detail->variant->product->images->first();
                                $imageUrl = null;

                                // Try to get image URL with multiple fallback approaches
                                if ($variantImage) {
                                    try {
                                        $imageUrl = $variantImage->image; // This uses the model's accessor
    } catch (Exception $e) {
        // Fallback: try direct storage path
        if (!empty($variantImage->getRawOriginal('image'))) {
            $imageUrl = asset('storage/' . $variantImage->getRawOriginal('image'));
        }
    }
} elseif ($productImage) {
    try {
        $imageUrl = $productImage->image; // This uses the model's accessor
                                    } catch (Exception $e) {
                                        // Fallback: try direct storage path
                                        if (!empty($productImage->getRawOriginal('image'))) {
                                            $imageUrl = asset('storage/' . $productImage->getRawOriginal('image'));
                                        }
                                    }
                                }
                            @endphp

                            @if ($imageUrl)
                                <img src="{{ $imageUrl }}" alt="Product Image" class="product-image"
                                    style="max-width: 80px; height: auto;">
                            @else
                                <div
                                    style="width: 80px; height: 80px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 12px; text-align: center;">
                                    📷<br>No Image
                                </div>
                            @endif

                            <div class="product-details">
                                @php
                                    // Get product name
                                    $productName = $detail->variant->product->name ?? 'N/A';
                                    if (is_string($productName)) {
                                        $decodedName = json_decode($productName, true);
                                        if (json_last_error() === JSON_ERROR_NONE && is_array($decodedName)) {
                                            $productName =
                                                $decodedName['en'] ??
                                                ($decodedName['ar'] ??
                                                    ($decodedName[array_key_first($decodedName)] ?? 'N/A'));
                                        }
                                    }
                                @endphp
                                <h4>{{ $productName }}</h4>

                                <div class="variant-info">
                                    @if ($detail->variant->color)
                                        @php
                                            $colorName = $detail->variant->color->name;
                                            if (is_string($colorName)) {
                                                $decodedColor = json_decode($colorName, true);
                                                if (json_last_error() === JSON_ERROR_NONE && is_array($decodedColor)) {
                                                    $colorName =
                                                        $decodedColor['en'] ??
                                                        ($decodedColor['ar'] ??
                                                            ($decodedColor[array_key_first($decodedColor)] ?? ''));
                                                }
                                            }
                                        @endphp
                                        <span><strong>{{ __('Color') }}:</strong> {{ $colorName }}</span>
                                    @endif

                                    @if ($detail->variant->size)
                                        @php
                                            $sizeName = $detail->variant->size->name;
                                            if (is_string($sizeName)) {
                                                $decodedSize = json_decode($sizeName, true);
                                                if (json_last_error() === JSON_ERROR_NONE && is_array($decodedSize)) {
                                                    $sizeName =
                                                        $decodedSize['en'] ??
                                                        ($decodedSize['ar'] ??
                                                            ($decodedSize[array_key_first($decodedSize)] ?? ''));
                                                }
                                            }
                                        @endphp
                                        @if ($detail->variant->color)
                                            <br>
                                        @endif
                                        <span><strong>{{ __('Size') }}:</strong> {{ $sizeName }}</span>
                                    @endif

                                    @if ($detail->variant->sku)
                                        <br><span
                                            style="font-size: 12px; color: #999;"><strong>{{ __('SKU') }}:</strong>
                                            {{ $detail->variant->sku }}</span>
                                    @endif

                                    @if ($detail->cost)
                                        <br><span
                                            style="font-size: 12px; color: #666;"><strong>{{ __('Cost') }}:</strong>
                                            ${{ number_format($detail->cost, 2) }}</span>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </td>
                    <td><strong>${{ number_format($detail->price, 2) }}</strong></td>
                    <td>
                        @if ($detail->discount > 0)
                            <span style="color: #e74c3c; font-weight: bold;">{{ $detail->discount }}%</span>
                        @else
                            <span style="color: #999;">0%</span>
                        @endif
                    </td>
                    <td><strong>{{ $detail->quantity }}</strong></td>
                    <td>
                        @php
                            $itemTotal = $detail->price * $detail->quantity;
                            if ($detail->discount) {
                                $itemTotal -= ($detail->discount / 100) * $itemTotal;
                            }
                        @endphp
                        <strong>${{ number_format($itemTotal, 2) }}</strong>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <div class="summary-box">
        <h3>{{ __('Order Summary') }}</h3>
        @php
            $subtotal = 0;
            foreach ($order->orderDetails as $detail) {
                $itemTotal = $detail->price * $detail->quantity;
                if ($detail->discount) {
                    $itemTotal -= ($detail->discount / 100) * $itemTotal;
                }
                $subtotal += $itemTotal;
            }

            $couponDiscount = 0;
            if ($order->coupon_value && $order->coupon_type) {
                if ($order->coupon_type === 'percentage') {
                    $couponDiscount = ($order->coupon_value / 100) * $subtotal;
                } else {
                    $couponDiscount = $order->coupon_value;
                }
            }

            $total = $subtotal - $couponDiscount + ($order->delivery_amount ?? 0);
        @endphp

        <div class="summary-item">
            <span>{{ __('Subtotal') }}:</span>
            <span>${{ number_format($subtotal, 2) }}</span>
        </div>

        @if ($couponDiscount > 0)
            <div class="summary-item">
                <span>{{ __('Coupon Discount') }}:</span>
                <span>-${{ number_format($couponDiscount, 2) }}</span>
            </div>
        @endif

        @if ($order->delivery_amount > 0)
            <div class="summary-item">
                <span>{{ __('Delivery') }}:</span>
                <span>${{ number_format($order->delivery_amount, 2) }}</span>
            </div>
        @endif

        <div class="summary-item">
            <span>{{ __('Total') }}:</span>
            <span>${{ number_format($total, 2) }}</span>
        </div>
    </div>

    <div class="admin-highlight">
        <h3>🚀 {{ __('Next Steps') }}</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
            <li>{{ __('Login to your admin panel to review this order') }}</li>
            <li>{{ __('Confirm the order and update the payment status') }}</li>
            <li>{{ __('Process the items for shipment') }}</li>
            <li>{{ __('Send shipping confirmation to the customer') }}</li>
        </ul>
    </div>

@endsection

@section('custom-footer')
    @php
        use App\Models\Configuration;
        $appName = Configuration::getValue('store_name', config('app.name'));
    @endphp
    <p><strong>{{ $appName }} - {{ __('Admin Panel') }}</strong></p>
    <p>{{ __('This is an automated notification from') }} {{ $appName }}</p>
    <p>{{ __('Please login to your admin panel to manage this order') }}</p>

    <p style="font-size: 12px; color: #adb5bd; margin-top: 20px;">
        {{ __('This email was sent because a new order was placed on your store.') }}
    </p>
@endsection
