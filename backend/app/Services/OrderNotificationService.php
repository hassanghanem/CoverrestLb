<?php

namespace App\Services;

use App\Mail\OrderStatusUpdateMail;
use App\Models\Order;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class OrderNotificationService
{
    /**
     * Status codes that should trigger email notifications to clients
     * Only important status changes that provide value to the customer
     */
    private const NOTIFICATION_WORTHY_STATUSES = [
        1, // Confirmed - Customer needs to know their order is confirmed
        4, // Shipped - Important milestone for customer
        5, // Delivered - Customer should be informed about delivery
        7, // Cancelled by Admin - Customer must know about cancellation
    ];

    /**
     * Status codes that should NOT trigger notifications
     * These are internal statuses or negative experiences
     */
    private const SILENT_STATUSES = [
        0, // Pending - Too early, creates unnecessary noise
        2, // Processing - Internal status, customer doesn't need to know
        3, // On Hold - May cause anxiety, better handled by customer service
        6, // Failed - Internal issue, handle separately
        8, // Cancelled by Customer - They already know they cancelled
        9, // Returned - Handled through return process
        10, // Completed - Final status confirmation
    ];

    /**
     * Send email notification for order status change
     */
    public function sendStatusUpdateNotification(Order $order, ?int $previousStatus = null): void
    {
        // Check if client exists and has email preferences enabled
        if (!$this->shouldSendNotification($order)) {
            return;
        }

        // Get current status as integer
        $currentStatusKey = $this->getStatusKey($order);

        // Only send for notification-worthy statuses
        if (!in_array($currentStatusKey, self::NOTIFICATION_WORTHY_STATUSES)) {
            return;
        }

        // Don't send duplicate notifications for same status
        if ($previousStatus === $currentStatusKey) {
            return;
        }

        try {
            Mail::to($order->client->email)->send(
                new OrderStatusUpdateMail($order, $previousStatus, false)
            );
        } catch (\Exception $e) {
            // Log error but don't fail the order update
            Log::error('Failed to send order status update email', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'client_email' => $order->client->email,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send notification when preorder is converted to regular order
     */
    public function sendPreorderConversionNotification(Order $order): void
    {
        if (!$this->shouldSendNotification($order)) {
            return;
        }

        try {
            Mail::to($order->client->email)->send(
                new OrderStatusUpdateMail($order, null, true)
            );
        } catch (\Exception $e) {
            Log::error('Failed to send preorder conversion email', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'client_email' => $order->client->email,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Check if notification should be sent
     */
    private function shouldSendNotification(Order $order): bool
    {
        // Must have a client
        if (!$order->client) {
            return false;
        }

        // Client must have an email
        if (!$order->client->email) {
            return false;
        }

        // Client must have opted in for order updates
        if (!$order->client->order_updates) {
            return false;
        }

        return true;
    }

    /**
     * Get status key from order status array
     */
    private function getStatusKey(Order $order): ?int
    {
        $statusName = $order->status['name'] ?? null;
        if (!$statusName) {
            return null;
        }

        $statuses = Order::getAllOrderStatus();
        foreach ($statuses as $key => $status) {
            if ($status['name'] === $statusName) {
                return $key;
            }
        }

        return null;
    }

    /**
     * Get human-readable status name from status key
     */
    public function getStatusName(int $statusKey): ?string
    {
        $statuses = Order::getAllOrderStatus();
        return $statuses[$statusKey]['name'] ?? null;
    }
}
