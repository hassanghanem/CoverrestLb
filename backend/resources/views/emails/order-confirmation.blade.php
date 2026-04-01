@extends('emails.layouts.client')

@section('title', __('Order Confirmation') . ' - #' . $order->order_number)

@section('header-title', __('Thank You for Your Order!'))
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
    <p>{{ __('Dear') }} {{ $order->client->name ?? __('Valued Customer') }},</p>

    <p>{{ __('Thank you for your order! We have received your order and it is being processed.') }}</p>

    @if ($order->is_preorder)
        <div class="info-box danger">
            <h3>{{ __('Pre-order Notice') }}</h3>
            <p>{{ __('This is a pre-order. Your order contains items that are currently out of stock or not yet available. We will notify you when your items are ready for shipment.') }}
            </p>
        </div>
    @else
        <div class="info-box warning">
            <h3>{{ __('Order Confirmation Required') }}</h3>
            <p>{{ __('Your order has been placed successfully and is pending confirmation. We will review your order and confirm it shortly. You will receive an email notification once your order is confirmed.') }}
            </p>
        </div>
    @endif

    <div class="info-box primary">
        <h3>{{ __('Order Information') }}</h3>
        <p><strong>{{ __('Order Number') }}:</strong> #{{ $order->order_number }}</p>
        <p><strong>{{ __('Order Date') }}:</strong> {{ $order->created_at->format('Y-m-d H:i:s') }}</p>
        <p><strong>{{ __('Payment Method') }}:</strong> {{ __($order->payment_method) }}</p>
        <p><strong>{{ __('Payment Status') }}:</strong> {{ $order->payment_status ? __('Paid') : __('Pending') }}</p>
        @if ($order->notes)
            <p><strong>{{ __('Your Notes') }}:</strong> {{ $order->notes }}</p>
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
                                    style="width: 80px; height: 80px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 12px;">
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

                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        @if ($detail->discount > 0)
                            <span
                                style="text-decoration: line-through; color: #999;">${{ number_format($detail->price, 2) }}</span><br>
                            <strong
                                style="color: #e74c3c;">${{ number_format($detail->price - ($detail->price * $detail->discount) / 100, 2) }}</strong>
                            <br><small style="color: #e74c3c;">{{ $detail->discount }}% {{ __('off') }}</small>
                        @else
                            <strong>${{ number_format($detail->price, 2) }}</strong>
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

    <p>{{ __('We will keep you updated on the status of your order. If you have any questions, please don\'t hesitate to contact us.') }}
    </p>

    @php
        use App\Models\Configuration;
        $appName = Configuration::getValue('store_name', config('app.name'));
    @endphp
    <p><strong>{{ __('Thank you for choosing') }} {{ $appName }}!</strong></p>
@endsection
