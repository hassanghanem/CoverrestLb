@php
    use App\Models\Configuration;
    $appName = Configuration::getValue('store_name', config('app.name'));
    $themeColor1 = Configuration::getValue('theme_color1', '#000000');
    $themeColor2 = Configuration::getValue('theme_color2', '#333333');
    $logoUrl = Configuration::getValue('logo_url', '');
@endphp
<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', $appName)</title>
    <style>
        /* Reset styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            color: #333333;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        .email-wrapper {
            width: 100%;
            background-color: #f8f9fa;
            padding: 20px 0;
        }

        .email-container {
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid #e9ecef;
        }

        /* Header */
        .email-header {
            background: linear-gradient(135deg, {{ $themeColor1 }} 0%, {{ $themeColor2 }} 100%);
            color: #ffffff;
            text-align: center;
            padding: 40px 30px;
            position: relative;
        }

        .email-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
            pointer-events: none;
        }

        .logo {
            max-width: 120px;
            height: auto;
            margin-bottom: 15px;
            position: relative;
            z-index: 1;
        }

        .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .email-header p {
            font-size: 16px;
            margin: 10px 0 0;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }

        /* Body */
        .email-body {
            padding: 40px 30px;
        }

        .email-body h2 {
            color: #2c3e50;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 10px;
        }

        .email-body h3 {
            color: #34495e;
            font-size: 20px;
            font-weight: 600;
            margin: 30px 0 15px;
        }

        .email-body p {
            font-size: 16px;
            margin: 0 0 15px;
            color: #555555;
        }

        /* Info boxes */
        .info-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .info-box.primary {
            background-color: #e3f2fd;
            border-color: #2196f3;
        }

        .info-box.success {
            background-color: #e8f5e8;
            border-color: #4caf50;
        }

        .info-box.warning {
            background-color: #fff3cd;
            border-color: #ff9800;
        }

        .info-box.danger {
            background-color: #f8d7da;
            border-color: #dc3545;
        }

        /* Tables */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e9ecef;
        }

        .data-table th,
        .data-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }

        .data-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #495057;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .data-table td {
            font-size: 15px;
            color: #333333;
        }

        .data-table tr:last-child td {
            border-bottom: none;
        }

        /* Summary box */
        .summary-box {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }

        .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #dee2e6;
        }

        .summary-item:last-child {
            border-bottom: none;
            font-weight: 700;
            font-size: 18px;
            color: {{ $themeColor1 }};
            padding-top: 15px;
            border-top: 2px solid #dee2e6;
        }

        /* Buttons */
        .btn {
            display: inline-block;
            padding: 12px 30px;
            margin: 20px 0;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: linear-gradient(135deg, {{ $themeColor1 }} 0%, {{ $themeColor2 }} 100%);
            color: #ffffff;
        }

        .btn-secondary {
            background-color: #6c757d;
            color: #ffffff;
        }

        /* Footer */
        .email-footer {
            background-color: #f8f9fa;
            border-top: 1px solid #e9ecef;
            padding: 30px;
            text-align: center;
        }

        .email-footer p {
            font-size: 14px;
            color: #6c757d;
            margin: 5px 0;
        }

        .email-footer a {
            color: {{ $themeColor1 }};
            text-decoration: none;
            font-weight: 600;
        }

        .email-footer a:hover {
            text-decoration: underline;
        }

        .social-links {
            margin: 20px 0 10px;
        }

        .social-links a {
            display: inline-block;
            margin: 0 10px;
            padding: 8px;
            background-color: #ffffff;
            border-radius: 50%;
            border: 1px solid #e9ecef;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        /* Responsive design */
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 10px;
            }

            .email-container {
                border-radius: 8px;
            }

            .email-header {
                padding: 30px 20px;
            }

            .email-header h1 {
                font-size: 24px;
            }

            .email-body {
                padding: 30px 20px;
            }

            .email-footer {
                padding: 20px;
            }

            .data-table th,
            .data-table td {
                padding: 8px 10px;
                font-size: 14px;
            }

            .summary-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }

            .btn {
                width: 100%;
                box-sizing: border-box;
            }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background-color: #ffffff;
            }
        }
    </style>
    @stack('styles')
</head>

<body>
    <div class="email-wrapper">
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                @if($logoUrl)
                    <img src="{{ $logoUrl }}" alt="{{ $appName }}" class="logo">
                @endif
                <h1>@yield('header-title', $appName)</h1>
                @hasSection('header-subtitle')
                    <p>@yield('header-subtitle')</p>
                @endif
            </div>

            <!-- Body -->
            <div class="email-body">
                @yield('content')
            </div>

            <!-- Footer -->
            <div class="email-footer">
                @hasSection('custom-footer')
                    @yield('custom-footer')
                @else
                    <p><strong>{{ $appName }}</strong></p>
                    <p>{{ __('Thank you for choosing us!') }}</p>
                    
                    @hasSection('contact-info')
                        @yield('contact-info')
                    @else
                        <p>{{ __('For support, contact us at') }} <a href="mailto:{{ config('mail.contacts') }}">{{ config('mail.contacts') }}</a></p>
                    @endif
                    
                    <p style="font-size: 12px; color: #adb5bd; margin-top: 20px;">
                        {{ __('This email was sent to you because you have an account with us.') }}
                    </p>
                @endif
            </div>
        </div>
    </div>
</body>
</html>