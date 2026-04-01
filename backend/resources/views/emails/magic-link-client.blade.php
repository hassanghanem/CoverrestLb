@extends('emails.layouts.client')

@section('title', __('Access Your Account'))

@section('header-title', __('Welcome!'))
@section('header-subtitle', __('Click the button below to access your account'))

@push('styles')
<style>
    .magic-link-container {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 12px;
        text-align: center;
        padding: 40px 30px;
        margin: 30px 0;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    }

    .magic-link-button {
        display: inline-block;
        padding: 18px 45px;
        background: linear-gradient(135deg, {{ \App\Models\Configuration::getValue('theme_color1', '#000000') }} 0%, {{ \App\Models\Configuration::getValue('theme_color2', '#333333') }} 100%);
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 50px;
        font-size: 18px;
        font-weight: bold;
        margin: 20px 0;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .magic-link-button:hover {
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
        transform: translateY(-2px);
    }

    .timer-container {
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        text-align: center;
    }

    .timer {
        font-size: 24px;
        font-weight: bold;
        color: #856404;
        margin: 10px 0;
    }

    .security-notice {
        background-color: #d1ecf1;
        border: 1px solid #bee5eb;
        color: #0c5460;
        padding: 20px;
        border-radius: 8px;
        margin: 25px 0;
    }

    .alternative-link {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        word-break: break-all;
        font-size: 12px;
        color: #6c757d;
    }

    @media only screen and (max-width: 600px) {
        .magic-link-button {
            font-size: 16px;
            padding: 15px 35px;
        }
        
        .timer {
            font-size: 20px;
        }
    }
</style>
@endpush

@section('content')
    @php
        use App\Models\Configuration;
        use Carbon\Carbon;
        $minutesRemaining = max(1, ceil(Carbon::now()->diffInMinutes($expiresAt, false)));
    @endphp

    <p>{{ __('Hello :name!', ['name' => $userName]) }}</p>
    
    <p>{{ __('We received a request to access your account. Click the button below to sign in securely.') }}</p>

    <div class="magic-link-container">
        <a href="{{ $magicLinkUrl }}" class="magic-link-button">
            🔐 {{ __('Sign In Securely') }}
        </a>
    </div>

    <div class="timer-container">
        <h3 style="margin: 0 0 10px; color: #856404;">⏰ {{ __('Time Remaining') }}</h3>
        <div class="timer">{{ $minutesRemaining }} {{ __('minutes') }}</div>
        <p style="margin: 10px 0 0; color: #856404; font-size: 14px;">
            {{ __('This link will expire at') }} {{ $expiresAt->format('H:i') }}
        </p>
    </div>

    <div class="info-box primary">
        <h3>{{ __('How it works:') }}</h3>
        <ol style="margin: 10px 0; padding-left: 20px;">
            <li>{{ __('Click the button above') }}</li>
            <li>{{ __('You will be automatically signed in') }}</li>
            <li>{{ __('No password needed!') }}</li>
        </ol>
    </div>

    <div class="alternative-link">
        <p style="margin: 0 0 10px;"><strong>{{ __('Button not working?') }}</strong></p>
        <p style="margin: 0;">{{ __('Copy and paste this link into your browser:') }}</p>
        <p style="margin: 10px 0 0;">{{ $magicLinkUrl }}</p>
    </div>

    <div class="security-notice">
        <h3>🔒 {{ __('Security Notice') }}</h3>
        <p><strong>{{ __('Keep this link secure!') }}</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
            <li>{{ __('This link can only be used once') }}</li>
            <li>{{ __('Never share this link with anyone') }}</li>
            <li>{{ __('Our team will never ask for this link') }}</li>
            <li>{{ __("If you didn't request this, please ignore this email") }}</li>
        </ul>
    </div>

    <p>{{ __('If you continue to have problems, please contact our support team.') }}</p>

@endsection
