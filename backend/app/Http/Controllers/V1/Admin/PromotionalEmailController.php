<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\PromotionalEmailService;
use App\Models\NewsletterEmail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\V1\Admin\PromotionalEmailRequest;

class PromotionalEmailController extends Controller
{
    protected $promotionalEmailService;

    public function __construct(PromotionalEmailService $promotionalEmailService)
    {
        $this->promotionalEmailService = $promotionalEmailService;
    }

    /**
     * Unified endpoint to send promotional emails with flexible options
     */
    public function send(PromotionalEmailRequest $request): JsonResponse
    {
        try {
            // Get validated data from the form request
            $data = $request->validated();

            // Handle test mode - send only to admin email for testing
            if ($request->input('test_mode', false)) {
                $result = $this->sendTestEmail($data);
            } else {
                $result = $this->sendProductionEmail($data);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Email campaign processed successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => __('An error occurred.'),
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Preview email before sending
     */
    public function preview(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'promotion' => 'sometimes|array',
            'products' => 'sometimes|array',
            'design' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $previewData = $this->generateEmailPreview($request->all());

            return response()->json([
                'status' => 'success',
                'data' => [
                    'html_preview' => $previewData['html'],
                    'text_preview' => $previewData['text'],
                    'estimated_recipients' => $previewData['recipient_count'],
                    'estimated_size' => $previewData['email_size'] . ' KB'
                ]
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    /**
     * Send promotional email to all active subscribers
     */
    public function sendToAll(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'promotion_data' => 'sometimes|array',
            'promotion_data.discount_percentage' => 'sometimes|numeric|min:0|max:100',
            'promotion_data.promo_code' => 'sometimes|string|max:50',
            'promotion_data.valid_until' => 'sometimes|date|after:today',
            'promotion_data.minimum_order' => 'sometimes|numeric|min:0',
            'promotion_data.featured_products' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->promotionalEmailService->sendPromotionalEmail(
                $request->input('subject'),
                $request->input('content'),
                $request->input('promotion_data', [])
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Promotional emails sent successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    /**
     * Send promotional email to specific subscribers
     */
    public function sendToSpecific(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'emails' => 'required|array|min:1',
            'emails.*' => 'email',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'promotion_data' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->promotionalEmailService->sendPromotionalEmailToSpecific(
                $request->input('emails'),
                $request->input('subject'),
                $request->input('content'),
                $request->input('promotion_data', [])
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Promotional emails sent to specific subscribers',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    /**
     * Send promotional email with product recommendations
     */
    public function sendWithProducts(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'products' => 'required|array|min:1',
            'products.*.name' => 'required|string',
            'products.*.price' => 'sometimes|numeric|min:0',
            'products.*.image' => 'sometimes|url',
            'products.*.url' => 'sometimes|url',
            'promotion_data' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->promotionalEmailService->sendProductPromotionalEmail(
                $request->input('subject'),
                $request->input('content'),
                $request->input('products'),
                $request->input('promotion_data', [])
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Product promotional emails sent successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    /**
     * Get newsletter statistics
     */
    public function getStats(): JsonResponse
    {
        try {
            $stats = $this->promotionalEmailService->getPromotionalStats();

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    /**
     * Get all active subscribers
     */
    public function getActiveSubscribers(): JsonResponse
    {
        try {
            $subscribers = NewsletterEmail::active()
                ->select('id', 'email', 'subscribed_at')
                ->orderBy('subscribed_at', 'desc')
                ->paginate(50);

            return response()->json([
                'status' => 'success',
                'data' => $subscribers
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    /**
     * Get email templates
     */
    public function getTemplates(): JsonResponse
    {
        try {
            $templates = [
                [
                    'id' => 'modern',
                    'name' => 'Modern',
                    'description' => 'Clean and contemporary design with bold typography',
                    'preview_image' => '/images/templates/modern-preview.jpg',
                    'features' => ['Responsive', 'Product showcase', 'Social links']
                ],
                [
                    'id' => 'classic',
                    'name' => 'Classic',
                    'description' => 'Traditional email layout with elegant styling',
                    'preview_image' => '/images/templates/classic-preview.jpg',
                    'features' => ['Professional', 'Clean layout', 'Brand focused']
                ],
                [
                    'id' => 'minimal',
                    'name' => 'Minimal',
                    'description' => 'Simple and focused design with lots of white space',
                    'preview_image' => '/images/templates/minimal-preview.jpg',
                    'features' => ['Simple', 'Fast loading', 'Content focused']
                ],
                [
                    'id' => 'festive',
                    'name' => 'Festive',
                    'description' => 'Colorful and engaging design for special occasions',
                    'preview_image' => '/images/templates/festive-preview.jpg',
                    'features' => ['Colorful', 'Engaging', 'Holiday themed']
                ]
            ];

            return response()->json([
                'status' => 'success',
                'data' => $templates
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    /**
     * Get recipient count estimation
     */
    public function getRecipientCount(Request $request): JsonResponse
    {
        try {
            $sendType = $request->input('send_type', 'all');
            $includeInactive = $request->input('include_inactive', false);

            $query = NewsletterEmail::query();

            if (!$includeInactive) {
                $query->where('is_active', true);
            }

            switch ($sendType) {
                case 'all':
                    $count = $query->count();
                    break;

                case 'specific':
                    $emails = $request->input('recipients', []);
                    $count = $query->whereIn('email', $emails)->count();
                    break;

                case 'recent':
                    $days = $request->input('days_filter', 30);
                    $count = $query->where('subscribed_at', '>=', now()->subDays($days))->count();
                    break;

                case 'custom':
                    // Allow for future custom filtering
                    $count = $query->count();
                    break;

                default:
                    $count = 0;
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'estimated_recipients' => $count,
                    'send_type' => $sendType,
                    'includes_inactive' => $includeInactive
                ]
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    /**
     * Save email as template
     */
    public function saveAsTemplate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'sometimes|string|max:500',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'promotion' => 'sometimes|array',
            'design' => 'sometimes|array',
            'is_default' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Here you would save to a templates table if you have one
            // For now, we'll just return success

            return response()->json([
                'status' => 'success',
                'message' => 'Template saved successfully',
                'data' => [
                    'template_id' => uniqid(),
                    'name' => $request->input('name')
                ]
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    /**
     * Unsubscribe a user from promotional emails
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        try {
            $email = $request->input('email');

            $subscriber = NewsletterEmail::where('email', $email)->first();

            if (!$subscriber) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Subscriber not found'
                ], 404);
            }

            $subscriber->update(['is_active' => false]);

            return response()->json([
                'status' => 'success',
                'message' => 'Successfully unsubscribed from promotional emails'
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    // Private helper methods
    private function sendTestEmail(array $data): array
    {
        // Send to admin email only for testing
        $adminEmail = config('mail.admin_email', 'admin@example.com');

        // Format data for service
        $serviceData = [
            'subject' => '[TEST] ' . $data['subject'],
            'content' => $data['content'],
            'promotion_data' => $data['promotion_data'] ?? [],
            'products' => $data['products'] ?? []
        ];

        return $this->promotionalEmailService->sendPromotionalEmail($serviceData, [$adminEmail]);
    }

    private function sendProductionEmail(array $data): array
    {
        $sendType = $data['send_type'];

        switch ($sendType) {
            case 'all':
                // Format data for service
                $serviceData = [
                    'subject' => $data['subject'],
                    'content' => $data['content'],
                    'promotion_data' => $data['promotion_data'] ?? [],
                    'products' => $data['products'] ?? []
                ];
                return $this->promotionalEmailService->sendPromotionalEmail($serviceData);

            case 'specific':
                // Format data for service with specific recipients
                $serviceData = [
                    'subject' => $data['subject'],
                    'content' => $data['content'],
                    'promotion_data' => $data['promotion_data'] ?? [],
                    'products' => $data['products'] ?? []
                ];
                $recipients = $data['emails'] ?? $data['recipients'] ?? [];
                return $this->promotionalEmailService->sendPromotionalEmail($serviceData, $recipients);

            case 'products':
                // Format data for service with products
                $serviceData = [
                    'subject' => $data['subject'],
                    'content' => $data['content'],
                    'promotion_data' => $data['promotion_data'] ?? [],
                    'products' => $data['products'] ?? []
                ];
                return $this->promotionalEmailService->sendPromotionalEmail($serviceData);

            default:
                throw new \Exception('Invalid send type');
        }
    }

    private function formatPromotionData(array $data): array
    {
        $promotionData = [];

        if (isset($data['promotion'])) {
            $promotion = $data['promotion'];

            $promotionData['discount_percentage'] = $promotion['discount_percentage'] ?? null;
            $promotionData['discount_amount'] = $promotion['discount_amount'] ?? null;
            $promotionData['promo_code'] = $promotion['promo_code'] ?? null;
            $promotionData['valid_until'] = $promotion['valid_until'] ?? null;
            $promotionData['minimum_order'] = $promotion['minimum_order'] ?? null;
            $promotionData['type'] = $promotion['type'] ?? 'discount';
            $promotionData['description'] = $promotion['description'] ?? null;
        }

        if (isset($data['products'])) {
            $promotionData['featured_products'] = $data['products'];
        }

        if (isset($data['design'])) {
            $promotionData['design'] = $data['design'];
        }

        $promotionData['shop_url'] = url('/');

        return $promotionData;
    }

    private function getRecentSubscriberEmails(int $days): array
    {
        return NewsletterEmail::active()
            ->where('subscribed_at', '>=', now()->subDays($days))
            ->pluck('email')
            ->toArray();
    }

    private function generateEmailPreview(array $data): array
    {
        // Generate HTML preview
        $promotionData = $this->formatPromotionData($data);

        // Simulate rendering the email template
        $htmlContent = view('emails.promotional', [
            'content' => $data['content'],
            'promotionData' => $promotionData,
            'unsubscribeUrl' => '#preview-mode'
        ])->render();

        // Generate text version
        $textContent = strip_tags($data['content']);

        // Estimate recipient count
        $recipientCount = NewsletterEmail::active()->count();

        // Estimate email size
        $emailSize = round(strlen($htmlContent) / 1024, 2);

        return [
            'html' => $htmlContent,
            'text' => $textContent,
            'recipient_count' => $recipientCount,
            'email_size' => $emailSize
        ];
    }
}
