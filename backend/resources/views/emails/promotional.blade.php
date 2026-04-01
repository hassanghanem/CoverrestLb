@extends('emails.layouts.client')

@section('title', $subject ?? 'Special Promotion')

@section('content')
    <div class="email-content">
        <div class="promotion-header">
            <h1 style="color: {{ $themeColor1 ?? '#007bff' }}; margin-bottom: 20px; font-size: 28px; text-align: center;">
                🎉 Special Promotion Just for You!
            </h1>
        </div>

        <div class="promotion-content" style="padding: 20px; line-height: 1.8;">
            {!! $content !!}
        </div>

        @if(isset($promotionData) && !empty($promotionData) && (
            isset($promotionData['discount_percentage']) || 
            isset($promotionData['promo_code']) || 
            isset($promotionData['valid_until']) || 
            isset($promotionData['minimum_order'])
        ))
            <div class="promotion-details" style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid {{ $themeColor1 ?? '#007bff' }};">
                @if(isset($promotionData['discount_percentage']))
                    <div class="discount-badge" style="text-align: center; margin-bottom: 15px;">
                        <span style="background-color: {{ $themeColor1 ?? '#007bff' }}; color: white; padding: 10px 20px; border-radius: 25px; font-size: 18px; font-weight: bold;">
                            {{ $promotionData['discount_percentage'] }}% OFF
                        </span>
                    </div>
                @endif

                @if(isset($promotionData['promo_code']))
                    <div class="promo-code" style="text-align: center; margin: 15px 0;">
                        <p style="margin: 5px 0; font-weight: bold;">Use Promo Code:</p>
                        <div style="background-color: #fff; border: 2px dashed {{ $themeColor1 ?? '#007bff' }}; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 16px; font-weight: bold; color: {{ $themeColor1 ?? '#007bff' }};">
                            {{ $promotionData['promo_code'] }}
                        </div>
                    </div>
                @endif

                @if(isset($promotionData['valid_until']))
                    <div class="validity" style="text-align: center; margin-top: 15px;">
                        <p style="color: #dc3545; font-weight: bold;">
                            ⏰ Valid until: {{ \Carbon\Carbon::parse($promotionData['valid_until'])->format('M d, Y') }}
                        </p>
                    </div>
                @endif

                @if(isset($promotionData['minimum_order']))
                    <div class="terms" style="text-align: center; margin-top: 10px;">
                        <p style="font-size: 14px; color: #666;">
                            *Minimum order value: ${{ number_format($promotionData['minimum_order'], 2) }}
                        </p>
                    </div>
                @endif
            </div>
        @endif

        <div class="cta-section" style="text-align: center; margin: 30px 0;">
            <a href="{{ $promotionData['shop_url'] ?? config('app.frontend_url') }}" 
               style="display: inline-block; background-color: {{ $themeColor1 ?? '#007bff' }}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">
                Shop Now & Save!
            </a>
        </div>

        @if(isset($promotionData['featured_products']) && !empty($promotionData['featured_products']))
            <div class="featured-products" style="margin: 30px 0;">
                <h3 style="text-align: center; color: {{ $themeColor1 ?? '#007bff' }}; margin-bottom: 20px;">Featured Products</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
                    @foreach($promotionData['featured_products'] as $product)
                        <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 15px; max-width: 200px; text-align: center;">
                            @if(isset($product['image']))
                                <img src="{{ $product['image'] }}" alt="{{ $product['name'] }}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 5px; margin-bottom: 10px;">
                            @endif
                            <h4 style="font-size: 14px; margin: 10px 0; color: #333;">{{ $product['name'] }}</h4>
                            @if(isset($product['price']))
                                <p style="color: {{ $themeColor1 ?? '#007bff' }}; font-weight: bold; margin: 5px 0;">${{ number_format($product['price'], 2) }}</p>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        <div class="social-sharing" style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="margin-bottom: 15px; color: #666;">Share this amazing deal with your friends!</p>
            <div>
                <a href="#" style="display: inline-block; margin: 0 10px; color: {{ $themeColor1 ?? '#007bff' }}; text-decoration: none;">📘 Facebook</a>
                <a href="#" style="display: inline-block; margin: 0 10px; color: {{ $themeColor1 ?? '#007bff' }}; text-decoration: none;">🐦 Twitter</a>
                <a href="#" style="display: inline-block; margin: 0 10px; color: {{ $themeColor1 ?? '#007bff' }}; text-decoration: none;">📧 Email</a>
            </div>
        </div>
    </div>
@endsection

@section('footer')
    <div class="newsletter-footer" style="text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; font-size: 12px;">
        <p style="margin: 5px 0;">You're receiving this email because you subscribed to our newsletter.</p>
        @if($unsubscribeUrl)
            <p style="margin: 5px 0;">
                <a href="{{ $unsubscribeUrl }}" style="color: #666; text-decoration: underline;">
                    Unsubscribe from promotional emails
                </a>
            </p>
        @endif
        <p style="margin: 5px 0;">© {{ date('Y') }} {{ $appName ?? 'Store' }}. All rights reserved.</p>
    </div>
@endsection