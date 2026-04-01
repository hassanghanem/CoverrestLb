<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update - #{{ $order->order_number }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }

        .email-container {
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }

        .content {
            padding: 30px 20px;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 10px 0;
        }

        .status-confirmed {
            background-color: #e3f2fd;
            color: #1976d2;
        }

        .status-shipped {
            background-color: #f3e5f5;
            color: #7b1fa2;
        }

        .status-delivered {
            background-color: #e8f5e8;
            color: #2e7d32;
        }

        .status-cancelled {
            background-color: #ffebee;
            color: #d32f2f;
        }

        .status-completed {
            background-color: #e8f5e8;
            color: #2e7d32;
        }

        .order-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .order-info h3 {
            margin-top: 0;
            color: #495057;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px solid #e9ecef;
        }

        .info-row:last-child {
            border-bottom: none;
        }

        .info-label {
            font-weight: 600;
            color: #6c757d;
        }

        .info-value {
            color: #495057;
        }

        .message-box {
            background-color: #e7f3ff;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
        }

        .preorder-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }

        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }

        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            margin: 15px 0;
        }

        .btn:hover {
            background-color: #0056b3;
        }

        @media (max-width: 600px) {
            body {
                padding: 10px;
            }

            .content {
                padding: 20px 15px;
            }

            .info-row {
                flex-direction: column;
            }

            .info-label {
                margin-bottom: 5px;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            @if ($isPreorderConversion)
                <h1>🎉 {{ __('Pre-order Converted to Order') }}</h1>
            @else
                <h1>📦 {{ __('Order Status Update') }}</h1>
            @endif
            <p style="margin: 10px 0 0 0; opacity: 0.9;">{{ __('Order') }} #{{ $order->order_number }}</p>
        </div>

        <div class="content">
            @if ($isPreorderConversion)
                <div class="preorder-box">
                    <h3 style="margin-top: 0;">🚀 {{ __('Great News!') }}</h3>
                    <p>{{ __('Your pre-order has been converted to a regular order and is now being processed. Your items are now in stock and ready to be prepared for shipment.') }}
                    </p>
                </div>
            @else
                <div class="message-box">
                    <h3 style="margin-top: 0;">{{ __('Order Status Update') }}</h3>
                    <p>{{ __('We wanted to keep you informed about your order status.') }}</p>
                </div>
            @endif

            @php
                $currentStatus = $order->status;
                $statusKey = null;
                foreach (\App\Models\Order::getAllOrderStatus() as $key => $status) {
                    if ($status['name'] === $currentStatus['name']) {
                        $statusKey = $key;
                        break;
                    }
                }
                $statusClass = match ($statusKey) {
                    1 => 'status-confirmed',
                    4 => 'status-shipped',
                    5 => 'status-delivered',
                    7 => 'status-cancelled',
                    10 => 'status-completed',
                    default => 'status-confirmed',
                };
            @endphp

            <div style="text-align: center; margin: 25px 0;">
                <div class="status-badge {{ $statusClass }}">
                    {{ $currentStatus['name'] ?? __('Unknown Status') }}
                </div>
                <p style="color: #6c757d; margin-top: 10px;">
                    {{ $currentStatus['description'] ?? '' }}
                </p>
            </div>

            @if ($order->address_info)
                @php
                    $address = is_array($order->address_info)
                        ? $order->address_info
                        : json_decode($order->address_info, true);

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
                                    <a href="https://maps.google.com/?q={{ $lat }},{{ $lng }}"
                                        target="_blank" style="color: #007bff; text-decoration: none;">
                                        🌍 {{ __('View on Google Maps') }}
                                    </a>
                                </p>
                            </div>
                        @endif
                    </div>
                @endif
            @endif

            @if ($statusKey === 4)
                {{-- Shipped --}}
                <div class="message-box">
                    <h4 style="margin-top: 0;">🚚 {{ __('Your Order is on the Way!') }}</h4>
                    <p>{{ __('Your order has been shipped and is on its way to you. You should receive it soon.') }}
                    </p>
                </div>
            @elseif($statusKey === 5)
                {{-- Delivered --}}
                <div class="message-box">
                    <h4 style="margin-top: 0;">✅ {{ __('Order Delivered Successfully!') }}</h4>
                    <p>{{ __('Your order has been delivered. We hope you enjoy your purchase!') }}</p>
                </div>
            @elseif($statusKey === 7)
                {{-- Cancelled --}}
                <div class="message-box">
                    <h4 style="margin-top: 0;">❌ {{ __('Order Cancelled') }}</h4>
                    <p>{{ __('Unfortunately, your order has been cancelled. If you have any questions, please contact our customer service team.') }}
                    </p>
                </div>
            @elseif($statusKey === 1)
                {{-- Confirmed --}}
                <div class="message-box">
                    <h4 style="margin-top: 0;">✨ {{ __('Order Confirmed!') }}</h4>
                    <p>{{ __('Great news! Your order has been confirmed and will be processed soon.') }}</p>
                </div>
            @elseif($statusKey === 10)
                {{-- Completed --}}
                <div class="message-box">
                    <h4 style="margin-top: 0;">🎉 {{ __('Order Completed!') }}</h4>
                    <p>{{ __('Your order has been completed successfully. Thank you for choosing us!') }}</p>
                </div>
            @endif

            @if ($order->notes)
                <div class="message-box">
                    <h4 style="margin-top: 0;">📝 {{ __('Additional Notes') }}</h4>
                    <p>{{ $order->notes }}</p>
                </div>
            @endif

            <div style="text-align: center; margin: 30px 0;">
                <p>{{ __('If you have any questions about your order, please don\'t hesitate to contact us.') }}</p>
            </div>
        </div>

        <div class="footer">
            <p>{{ __('Thank you for your business!') }}</p>
            <p style="font-size: 12px; margin-top: 15px;">
                {{ __('You received this email because you have opted in to receive order updates. You can manage your email preferences in your account settings.') }}
            </p>
        </div>
    </div>
</body>

</html>
