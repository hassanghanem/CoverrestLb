<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ __('New Contact Us Message') }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            background-color: #000000;
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }

        .email-header h1 {
            margin: 0;
            font-size: 24px;
        }

        .email-body {
            padding: 20px;
            line-height: 1.6;
        }

        .email-body p {
            margin: 10px 0;
        }

        .email-body .label {
            font-weight: bold;
            color: #555;
        }

        .email-footer {
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #777;
            background-color: #f7f7f7;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="email-header">
            <h1>{{ __('New Contact Us Message') }}</h1>
        </div>
        <div class="email-body">
            <p><span class="label">{{ __('Name') }}:</span> {{ $data['name'] }}</p>
            <p><span class="label">{{ __('Email') }}:</span> {{ $data['email'] }}</p>
            <p><span class="label">{{ __('Subject') }}:</span> {{ $data['subject'] }}</p>
            <p><span class="label">{{ __('Message') }}:</span></p>
            <p>{{ $data['message'] }}</p>
        </div>
        <div class="email-footer">
            <p>{{ __('This message was submitted via the website contact form.') }}</p>
        </div>
    </div>
</body>

</html>
