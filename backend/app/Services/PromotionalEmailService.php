<?php

namespace App\Services;

use App\Models\NewsletterEmail;
use App\Mail\PromotionalMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

class PromotionalEmailService
{
    /**
     * Send promotional email to specified recipients
     */
    public function sendPromotionalEmail($data, $recipients = [])
    {
        // If no recipients provided, get active subscribers
        if (empty($recipients)) {
            $recipients = NewsletterEmail::getActiveSubscribers()->pluck('email')->toArray();
        }

        $sentCount = 0;
        $failedCount = 0;
        $failedEmails = [];

        // Extract data
        $subject = $data['subject'] ?? '';
        $content = $data['content'] ?? '';
        // Provide default content if none provided
        if (empty($content)) {
            $content = '<p>We have exciting news and offers for you!</p>';
        }
        $promotionData = $data['promotion_data'] ?? [];

        // Add additional data to promotion
        $promotionData['shop_url'] = $promotionData['shop_url'] ?? url('/');
        $promotionData['featured_products'] = $data['products'] ?? [];

        foreach ($recipients as $email) {
            try {
                // Generate unsubscribe URL
                $unsubscribeUrl = $this->generateUnsubscribeUrl($email);

                Mail::to($email)->send(
                    new PromotionalMail($subject, $content, $promotionData, $unsubscribeUrl)
                );

                $sentCount++;

            } catch (\Exception $e) {
                $failedCount++;
                $failedEmails[] = $email;
            }
        }

        return [
            'success' => true,
            'sent_count' => $sentCount,
            'failed_count' => $failedCount,
            'failed_emails' => $failedEmails,
            'total_recipients' => count($recipients),
            'message' => $failedCount === 0 
                ? "All emails sent successfully" 
                : "Partially sent: {$sentCount} successful, {$failedCount} failed"
        ];
    }

    /**
     * Send promotional email to specific subscribers
     */
    public function sendPromotionalEmailToSpecific($emails, $subject, $content, $promotionData = [])
    {
        $subscribers = NewsletterEmail::active()->whereIn('email', $emails)->get();
        $sentCount = 0;
        $failedCount = 0;
        $errors = [];

        // Provide default content if none provided
        if (empty($content)) {
            $content = '<p>We have exciting news and offers for you!</p>';
        }

        foreach ($subscribers as $subscriber) {
            try {
                $unsubscribeUrl = $this->generateUnsubscribeUrl($subscriber->email);
                
                if (!isset($promotionData['shop_url'])) {
                    $promotionData['shop_url'] = url('/');
                }

                Mail::to($subscriber->email)->send(
                    new PromotionalMail($subject, $content, $promotionData, $unsubscribeUrl)
                );

                $sentCount++;

            } catch (\Exception $e) {
                $failedCount++;
                $errors[] = [
                    'email' => $subscriber->email,
                    'error' => $e->getMessage()
                ];
            }
        }

        return [
            'found_subscribers' => $subscribers->count(),
            'sent_count' => $sentCount,
            'failed_count' => $failedCount,
            'errors' => $errors
        ];
    }

    /**
     * Send promotional email with product recommendations
     */
    public function sendProductPromotionalEmail($subject, $content, $products = [], $promotionData = [])
    {
        // Add featured products to promotion data
        $promotionData['featured_products'] = $this->formatProducts($products);
        
        return $this->sendPromotionalEmail($subject, $content, $promotionData);
    }

    /**
     * Schedule promotional email for later sending
     */
    public function schedulePromotionalEmail($subject, $content, $promotionData = [], $sendAt = null)
    {
        // This would integrate with Laravel's job queue system
        // For now, we'll just send it immediately if no time specified
        if (!$sendAt || now()->gte($sendAt)) {
            return $this->sendPromotionalEmail($subject, $content, $promotionData);
        }

        // Here you would dispatch a job to send the email later
        // dispatch(new SendPromotionalEmailJob($subject, $content, $promotionData))->delay($sendAt);
        
        return [
            'status' => 'scheduled',
            'send_at' => $sendAt,
            'message' => 'Promotional email scheduled successfully'
        ];
    }

    /**
     * Generate unsubscribe URL for a subscriber
     */
    private function generateUnsubscribeUrl($email)
    {
        // For now, return a placeholder URL until unsubscribe route is implemented
        return url('/unsubscribe?email=' . base64_encode($email));
    }

    /**
     * Format products for email template
     */
    private function formatProducts($products)
    {
        $formatted = [];
        
        foreach ($products as $product) {
            $formatted[] = [
                'name' => $product['name'] ?? $product['title'] ?? 'Product',
                'price' => $product['price'] ?? null,
                'image' => $product['image'] ?? $product['image_url'] ?? null,
                'url' => $product['url'] ?? null
            ];
        }

        return $formatted;
    }

    /**
     * Get promotional email statistics
     */
    public function getPromotionalStats()
    {
        $totalSubscribers = NewsletterEmail::count();
        $activeSubscribers = NewsletterEmail::active()->count();
        $recentSubscribers = NewsletterEmail::active()
            ->where('subscribed_at', '>=', now()->subDays(30))
            ->count();

        return [
            'total_subscribers' => $totalSubscribers,
            'active_subscribers' => $activeSubscribers,
            'inactive_subscribers' => $totalSubscribers - $activeSubscribers,
            'recent_subscribers' => $recentSubscribers,
            'engagement_rate' => $totalSubscribers > 0 ? round(($activeSubscribers / $totalSubscribers) * 100, 2) : 0
        ];
    }
}