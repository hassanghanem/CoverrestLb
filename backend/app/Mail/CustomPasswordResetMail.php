<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CustomPasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $token;
    public $email;
    public $resetUrl; // Add resetUrl variable

    /**
     * Create a new message instance.
     *
     * @param  string  $token
     * @param  string  $email
     * @return void
     */
    public function __construct($token, $email)
    {
        $this->token = $token;
        $this->email = $email;

        // Create the reset URL
        $this->resetUrl = env('ADMIN_URL', 'http://localhost:5173') . '/resetPassword?token=' . $token . '&email=' . urlencode($this->email);
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Password Reset Request')
                    ->view('emails.password-reset')
                    ->with([
                        'resetUrl' => $this->resetUrl, // Pass resetUrl to the view
                        'token' => $this->token,
                        'email' => $this->email,
                    ]);
    }
}
