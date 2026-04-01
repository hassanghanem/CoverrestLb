<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>{{ __('Order Receipt') }} - {{ $order->order_number }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        :root {
            --primary-text: #111827;
            --muted-text: #6b7280;
            --border-color: #e5e7eb;
            --accent: #111827;
            --bg-light: #f9fafb;
            --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            font-family: var(--font-family);
            color: var(--primary-text);
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        body {
            padding: 8px;
        }

        .receipt-wrapper {
            max-width: 80mm;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid var(--border-color);
            padding: 8px 10px;
            font-size: 11px;
        }

        .header {
            text-align: center;
            margin-bottom: 6px;
        }

        .store-logo {
            max-width: 120px;
            height: auto;
            display: block;
            margin: 0 auto 4px auto;
        }

        .store-name {
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.03em;
        }

        .store-meta {
            font-size: 10px;
            color: var(--muted-text);
            line-height: 1.3;
        }

        .section {
            padding: 4px 0;
            border-top: 1px dashed var(--border-color);
        }

        .section:first-of-type {
            border-top: none;
        }

        .section-title {
            font-weight: 600;
            font-size: 11px;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }

        .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1px;
        }

        .meta-label {
            color: var(--muted-text);
        }

        .meta-value {
            font-weight: 500;
            text-align: right;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2px;
        }

        .items-table th,
        .items-table td {
            padding: 2px 0;
        }

        .items-table th {
            font-size: 10px;
            text-align: left;
            border-bottom: 1px dashed var(--border-color);
        }

        .items-table th.qty,
        .items-table th.price,
        .items-table th.total {
            text-align: right;
        }

        .items-table td.qty,
        .items-table td.price,
        .items-table td.total {
            text-align: right;
            white-space: nowrap;
        }

        .item-name {
            font-weight: 500;
        }

        .item-meta {
            font-size: 9px;
            color: var(--muted-text);
        }

        .totals {
            margin-top: 4px;
            border-top: 1px dashed var(--border-color);
            padding-top: 4px;
        }

        .totals-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1px;
        }

        .totals-row span:last-child {
            font-weight: 500;
        }

        .totals-row.grand-total {
            margin-top: 2px;
            padding-top: 2px;
            border-top: 1px solid var(--border-color);
            font-size: 12px;
        }

        .status-badge {
            display: inline-block;
            padding: 1px 4px;
            border-radius: 999px;
            font-size: 9px;
            border: 1px solid var(--border-color);
            margin-left: 4px;
        }

        .footer {
            text-align: center;
            font-size: 9px;
            color: var(--muted-text);
            margin-top: 6px;
        }

        .footer-strong {
            font-weight: 600;
            color: var(--primary-text);
        }

        .print-btn-wrapper {
            text-align: center;
            margin-bottom: 8px;
        }

        .print-btn {
            display: inline-block;
            padding: 4px 10px;
            font-size: 11px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            background: var(--accent);
            color: #ffffff;
        }

        @media print {
            body {
                padding: 0;
            }

            .print-btn-wrapper {
                display: none;
            }

            .receipt-wrapper {
                border: none;
                margin: 0;
                width: 100%;
                max-width: none;
            }
        }
    </style>
</head>

<body>
    <div class="print-btn-wrapper">
        <button class="print-btn" onclick="window.print()">{{ __('Print Receipt') }}</button>
    </div>

    <div class="receipt-wrapper">
        <div class="header">
            <img src="{{ asset('images/logo-white-nobg.png') }}" alt="{{ config('app.name', 'Store') }}"
                class="store-logo">
            @php
                $addressInfo = $order->address_info ?? $order->address?->toArray();
                $client = $order->client;
            @endphp
        </div>

        <div class="section">
            <div class="section-title">{{ __('Order Info') }}</div>
            <div class="meta-row">
                <span class="meta-label">{{ __('Order #') }}</span>
                <span class="meta-value">{{ $order->order_number }}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">{{ __('Date') }}</span>
                <span class="meta-value">{{ $order->created_at?->format('Y-m-d H:i') }}</span>
            </div>

            @if ($order->payment_method)
                <div class="meta-row">
                    <span class="meta-label">{{ __('Payment') }}</span>
                    <span class="meta-value">{{ __($order->payment_method) }}</span>
                </div>
            @endif
        </div>

        <div class="section">
            <div class="section-title">{{ __('Customer') }}</div>

            {{-- Prefer recipient_name from addressInfo, fallback to client name --}}
            <div class="meta-row">
                <span class="meta-label">{{ __('Name') }}</span>
                <span class="meta-value">
                    {{ $addressInfo['recipient_name'] ?? ($client?->name ?? '-') }}
                </span>
            </div>

            {{-- Prefer address phone_number, fallback to client phone --}}
            @php
                $phone = $addressInfo['phone_number'] ?? ($client?->phone ?? null);
                $addressLine = $addressInfo['address'] ?? null;
                $city = $addressInfo['city'] ?? null;
            @endphp

            @if ($phone)
                <div class="meta-row">
                    <span class="meta-label">{{ __('Phone') }}</span>
                    <span class="meta-value">{{ $phone }}</span>
                </div>
            @endif
            @if ($city)
                <div class="meta-row">
                    <span class="meta-label">{{ __('City') }}</span>
                    <span class="meta-value">{{ $city }}</span>
                </div>
                @endif @if ($addressLine)
                    <div class="meta-row">
                        <span class="meta-label">{{ __('Address') }}</span>
                        <span class="meta-value">{{ $addressLine }}</span>
                    </div>
                @endif

                {{-- Optional: show notes if you want in the email --}}
                @if (!empty($addressInfo['notes']))
                    <div class="meta-row">
                        <span class="meta-label">{{ __('Notes') }}</span>
                        <span class="meta-value" style="max-width: 52mm; white-space: normal; text-align: right;">
                            {{ $addressInfo['notes'] }}
                        </span>
                    </div>
                @endif
        </div>


        <div class="section">
            <div class="section-title">{{ __('Items') }}</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>{{ __('Item') }}</th>
                        <th class="qty">{{ __('Qty') }}</th>
                        <th class="price">{{ __('Price') }}</th>
                        <th class="total">{{ __('Total') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($order->orderDetails as $detail)
                        @php
                            $variant = $detail->variant;
                            $product = $variant?->product;
                            $productName = $product?->name ?: '';
                            $metaParts = [];
                            if ($variant?->color?->name) {
                                $metaParts[] = $variant->color->name;
                            }
                            if ($variant?->size?->name) {
                                $metaParts[] = $variant->size->name;
                            }
                        @endphp
                        <tr>
                            <td>
                                <div class="item-name">{{ $productName }}</div>
                                @if (count($metaParts))
                                    <div class="item-meta">{{ implode(' / ', $metaParts) }}</div>
                                @endif
                            </td>
                            <td class="qty">{{ $detail->quantity }}</td>
                            <td class="price">${{ number_format($detail->price, 2) }}</td>
                            <td class="total">${{ number_format($detail->total, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="totals">
                <div class="totals-row">
                    <span>{{ __('Subtotal') }}</span>
                    <span>${{ number_format($order->subtotal, 2) }}</span>
                </div>

                @php
                    $discountAmount = 0;
                    if ($order->coupon_value && $order->coupon_type) {
                        if ($order->coupon_type === 'fixed') {
                            $discountAmount = $order->coupon_value;
                        } elseif ($order->coupon_type === 'percentage') {
                            $discountAmount = ($order->subtotal * $order->coupon_value) / 100;
                        }
                    }
                @endphp

                @if ($discountAmount > 0)
                    <div class="totals-row">
                        <span>{{ __('Discount') }} @if ($order->coupon)
                                ({{ $order->coupon->code }})
                            @endif
                        </span>
                        <span>-${{ number_format($discountAmount, 2) }}</span>
                    </div>
                @endif

                @if ($order->delivery_amount > 0)
                    <div class="totals-row">
                        <span>{{ __('Delivery') }}</span>
                        <span>${{ number_format($order->delivery_amount, 2) }}</span>
                    </div>
                @endif

                <div class="totals-row grand-total">
                    <span>{{ __('Total') }}</span>
                    <span>${{ number_format($order->grand_total, 2) }}</span>
                </div>
            </div>
        </div>

        @if ($order->notes)
            <div class="section">
                <div class="section-title">{{ __('Notes') }}</div>
                <div style="font-size: 10px; white-space: pre-wrap;">{{ $order->notes }}</div>
            </div>
        @endif

        <div class="footer">
            <div class="footer-strong">{{ __('Thank you for your purchase!') }}</div>
            <div style="margin-top: 2px;">{{ __('Developed by :company', ['company' => 'AppFinity.cloud']) }}</div>
        </div>
    </div>

    <script>
        window.addEventListener('load', function() {
            // Automatically open the browser print dialog when the receipt loads
            try {
                window.print();
            } catch (e) {
                console.error('Auto-print failed', e);
            }
        });
    </script>

</body>

</html>
