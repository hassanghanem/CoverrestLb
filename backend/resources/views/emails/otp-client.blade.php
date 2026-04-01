@extends('emails.layouts.client')

@section('title', __('Your OTP Code'))

@section('header-title', __('Verification Code'))
@section('header-subtitle', __('Please verify your account'))

@push('styles')
<style>
    .otp-container {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border: 2px dashed #dee2e6;
        border-radius: 12px;
        text-align: center;
        padding: 30px;
        margin: 30px 0;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    }

    .otp-label {
        font-size: 16px;
        color: #666;
        margin-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 600;
    }

    .otp {
        font-size: 42px;
        font-weight: bold;
        margin: 20px 0;
        letter-spacing: 12px;
        background: linear-gradient(135deg, {{ \App\Models\Configuration::getValue('theme_color1', '#000000') }} 0%, {{ \App\Models\Configuration::getValue('theme_color2', '#333333') }} 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        font-family: 'Courier New', monospace;
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
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
        padding: 20px;
        border-radius: 8px;
        margin: 25px 0;
    }

    @media only screen and (max-width: 600px) {
        .otp {
            font-size: 32px;
            letter-spacing: 8px;
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

    <p>{{ __('Hello!') }}</p>
    
    <p>{{ __('You have requested a verification code. Please use the code below to complete your verification:') }}</p>

    <div class="otp-container">
        <div class="otp-label">{{ __('Your Verification Code') }}</div>
        <div class="otp">{{ $otp }}</div>
    </div>

    <div class="timer-container">
        <h3 style="margin: 0 0 10px; color: #856404;">⏰ {{ __('Time Remaining') }}</h3>
        <div class="timer">{{ $minutesRemaining }} {{ __('minutes') }}</div>
        <p style="margin: 10px 0 0; color: #856404; font-size: 14px;">
            {{ __('This code will expire at') }} {{ $expiresAt->format('H:i') }}
        </p>
    </div>

    <div class="info-box primary">
        <h3>{{ __('How to use this code:') }}</h3>
        <ol style="margin: 10px 0; padding-left: 20px;">
            <li>{{ __('Return to the verification page') }}</li>
            <li>{{ __('Enter the 6-digit code exactly as shown above') }}</li>
            <li>{{ __('Click verify to complete the process') }}</li>
        </ol>
    </div>

    <div class="security-notice">
        <h3>🔒 {{ __('Security Notice') }}</h3>
        <p><strong>{{ __('Keep this code secure!') }}</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
            <li>{{ __('Never share this code with anyone') }}</li>
            <li>{{ __('Our team will never ask for this code') }}</li>
            <li>{{ __('If you didn\'t request this code, please ignore this email') }}</li>
        </ul>
    </div>

    <p>{{ __('If you continue to have problems, please contact our support team.') }}</p>

@endsection