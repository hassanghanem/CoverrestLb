<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PromotionalMail extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public $content;
    public $promotionData;
    public $unsubscribeUrl;

    public function __construct($subject, $content, $promotionData = [], $unsubscribeUrl = null)
    {
        $this->subject = $subject;
        $this->content = $content;
        $this->promotionData = $promotionData;
        $this->unsubscribeUrl = $unsubscribeUrl;
    }

    public function build()
    {
        return $this->subject($this->subject)
            ->view('emails.promotional')
            ->with([
                'content' => $this->content,
                'promotionData' => $this->promotionData,
                'unsubscribeUrl' => $this->unsubscribeUrl,
            ]);
    }
}