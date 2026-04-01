<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use App\Models\ClientMagicLink;

class MagicLinkEmail extends Mailable
{
    public $magicLinkUrl;
    public $userName;
    public $expiresAt;
    public $action;

    public function __construct(string $magicLinkUrl, string $userName, $expiresAt, string $action = 'login')
    {
        $this->magicLinkUrl = $magicLinkUrl;
        $this->userName = $userName;
        $this->expiresAt = $expiresAt;
        $this->action = $action;
    }

    public function build()
    {
        $subject = $this->action === 'register' 
            ? __('Complete Your Registration') 
            : __('Your Login Link');
        
        return $this->view('emails.magic-link-client')
            ->subject($subject)
            ->with([
                'magicLinkUrl' => $this->magicLinkUrl,
                'userName' => $this->userName,
                'expiresAt' => $this->expiresAt,
                'action' => $this->action,
            ]);
    }
}
