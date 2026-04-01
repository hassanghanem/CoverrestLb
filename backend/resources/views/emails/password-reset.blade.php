@extends('emails.layouts.client')

@section('title', __('Password Reset Request'))

@section('header-title', __('Password Reset Request'))
@section('header-subtitle', __('Reset your account password'))

@section('content')
    <p>{{ __('Hello!') }}</p>
    
    <p>{{ __('You are receiving this email because we received a password reset request for your account.') }}</p>
    
    <div class="info-box primary">
        <h3>{{ __('Reset Your Password') }}</h3>
        <p>{{ __('Click the button below to reset your password. This link will expire in 60 minutes.') }}</p>
        
        <a href="{{ $resetUrl }}" class="btn btn-primary">{{ __('Reset Password') }}</a>
    </div>
    
    <p>{{ __('If you did not request a password reset, no further action is required.') }}</p>
    
    <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 6px; font-size: 14px; color: #6c757d;">
        <p><strong>{{ __('Having trouble with the button?') }}</strong></p>
        <p>{{ __('Copy and paste the following URL into your browser:') }}</p>
        <p style="word-break: break-all; color: #495057;">{{ $resetUrl }}</p>
    </div>
@endsection
