<?php

namespace App\Services;

use App\Models\SearchLog;
use App\Models\ClientSession;
use Illuminate\Support\Facades\DB;

class SearchLogService
{
    /**
     * Logs a client search action efficiently.
     */
    public function log(?ClientSession $session, array $filters = []): void
    {
        if (!$session) {
            return;
        }

        $payload = $this->normalizePayload($filters);
        if ($payload === null) {
            return;
        }

        $now = now();
        $fingerprint = $this->fingerprint($payload);

        // Best practice: enforce dedupe at the DB layer (unique index) and use an atomic upsert.
        // This prevents duplicates even under concurrency and avoids fragile JSON comparisons.
        DB::table('search_logs')->upsert(
            [
                [
                    'client_session_id' => $session->id,
                    'fingerprint' => $fingerprint,
                    'category_ids' => json_encode($payload['category_ids'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    'brand_ids' => json_encode($payload['brand_ids'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    'color_ids' => json_encode($payload['color_ids'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    'price_min' => $payload['price_min'],
                    'price_max' => $payload['price_max'],
                    'text' => $payload['text'],
                    'count' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ],
            ['client_session_id', 'fingerprint'],
            [
                // Always keep canonicalized fields in sync.
                'category_ids' => json_encode($payload['category_ids'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'brand_ids' => json_encode($payload['brand_ids'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'color_ids' => json_encode($payload['color_ids'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'price_min' => $payload['price_min'],
                'price_max' => $payload['price_max'],
                'text' => $payload['text'],
                // Increment the counter instead of inserting duplicates.
                'count' => DB::raw('count + 1'),
                'updated_at' => $now,
            ]
        );
    }

    /**
     * @return array{text:?string,category_ids:array<int>,brand_ids:array<int>,color_ids:array<int>,price_min:?string,price_max:?string}|null
     */
    private function normalizePayload(array $filters): ?array
    {
        $text = $filters['search'] ?? null;
        if (is_string($text)) {
            $text = preg_replace('/\s+/u', ' ', trim($text));
            $text = function_exists('mb_strtolower') ? mb_strtolower($text) : strtolower($text);
            $text = $text === '' ? null : $text;
        } else {
            $text = null;
        }

        $categoryIds = $this->normalizeIdArray($filters['categories'] ?? null);
        $brandIds = $this->normalizeIdArray($filters['brands'] ?? null);
        $colorIds = $this->normalizeIdArray($filters['colors'] ?? null);

        $priceMin = $this->normalizeDecimal($filters['price_min'] ?? null);
        $priceMax = $this->normalizeDecimal($filters['price_max'] ?? null);

        // Skip empty searches and filters (avoid noise logs for pagination/sorting).
        if ($text === null && $categoryIds === [] && $brandIds === [] && $colorIds === [] && $priceMin === null && $priceMax === null) {
            return null;
        }

        return [
            'text' => $text,
            'category_ids' => $categoryIds,
            'brand_ids' => $brandIds,
            'color_ids' => $colorIds,
            'price_min' => $priceMin,
            'price_max' => $priceMax,
        ];
    }

    /**
     * @param array{text:?string,category_ids:array<int>,brand_ids:array<int>,color_ids:array<int>,price_min:?string,price_max:?string} $payload
     */
    private function fingerprint(array $payload): string
    {
        $canonical = [
            'text' => $payload['text'],
            'category_ids' => $payload['category_ids'],
            'brand_ids' => $payload['brand_ids'],
            'color_ids' => $payload['color_ids'],
            'price_min' => $payload['price_min'],
            'price_max' => $payload['price_max'],
        ];

        return sha1(json_encode($canonical, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    /**
     * @return array<int>
     */
    private function normalizeIdArray(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        $ids = [];
        foreach ($value as $item) {
            if (is_numeric($item)) {
                $ids[] = (int) $item;
            }
        }

        $ids = array_values(array_unique($ids));
        sort($ids);

        return $ids;
    }

    private function normalizeDecimal(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (!is_numeric($value)) {
            return null;
        }

        return number_format((float) $value, 2, '.', '');
    }

    /**
     * Optional: prune old logs to save space.
     */
    public function pruneOldLogs(int $months = 6): void
    {
        SearchLog::where('created_at', '<', now()->subMonths($months))->delete();
    }
}
