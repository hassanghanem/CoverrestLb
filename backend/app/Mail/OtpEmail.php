<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class OtpEmail extends Mailable
{
    public $otp;
    public $userName;
    public $expiresAt;
    public $userType;

    public function __construct($otp, $userName, $expiresAt, $userType = 'admin')
    {
        $this->otp = $otp;
        $this->userName = $userName;
        $this->expiresAt = $expiresAt;
        $this->userType = $userType;
    }

    public function build()
    {
        $view = $this->userType === 'client' ? 'emails.otp-client' : 'emails.otp-admin';
        
        return $this->view($view)
            ->subject(__('Your OTP Code'))
            ->with([
                'otp' => $this->otp,
                'userName' => $this->userName,
                'expiresAt' => $this->expiresAt,
            ]);
    }
}
