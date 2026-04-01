<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdateMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $previousStatus;
    public $isPreorderConversion;

    public function __construct(Order $order, $previousStatus = null, bool $isPreorderConversion = false)
    {
        $this->order = $order;
        $this->previousStatus = $previousStatus;
        $this->isPreorderConversion = $isPreorderConversion;
    }

    public function build()
    {
        $subject = $this->getSubject();
        
        return $this->subject($subject)
            ->view('emails.order-status-update')
            ->with([
                'order' => $this->order,
                'previousStatus' => $this->previousStatus,
                'isPreorderConversion' => $this->isPreorderConversion,
            ]);
    }

    private function getSubject(): string
    {
        if ($this->isPreorderConversion) {
            return __('Your Pre-order has been Converted to Order - #:order_number', [
                'order_number' => $this->order->order_number
            ]);
        }

        $currentStatus = $this->order->status['name'] ?? __('Unknown');
        
        return __('Order Status Update - #:order_number (:status)', [
            'order_number' => $this->order->order_number,
            'status' => $currentStatus
        ]);
    }
}