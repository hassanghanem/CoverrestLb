<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('search_logs', function (Blueprint $table) {
            $table->string('fingerprint', 40)->nullable()->after('text');
        });

        // Backfill fingerprints for existing rows.
        DB::table('search_logs')
            ->select(['id', 'text', 'category_ids', 'brand_ids', 'color_ids', 'price_min', 'price_max'])
            ->orderBy('id')
            ->chunkById(500, function ($rows) {
                foreach ($rows as $row) {
                    $text = $row->text;
                    if (is_string($text)) {
                        $text = preg_replace('/\s+/u', ' ', trim($text));
                        $text = function_exists('mb_strtolower') ? mb_strtolower($text) : strtolower($text);
                        $text = $text === '' ? null : $text;
                    } else {
                        $text = null;
                    }

                    $categoryIds = self::normalizeIdArray($row->category_ids);
                    $brandIds = self::normalizeIdArray($row->brand_ids);
                    $colorIds = self::normalizeIdArray($row->color_ids);

                    $priceMin = self::normalizeDecimal($row->price_min);
                    $priceMax = self::normalizeDecimal($row->price_max);

                    $canonical = [
                        'text' => $text,
                        'category_ids' => $categoryIds,
                        'brand_ids' => $brandIds,
                        'color_ids' => $colorIds,
                        'price_min' => $priceMin,
                        'price_max' => $priceMax,
                    ];

                    $fingerprint = sha1(json_encode($canonical, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

                    DB::table('search_logs')
                        ->where('id', $row->id)
                        ->update(['fingerprint' => $fingerprint]);
                }
            });

        // Consolidate duplicates (same client_session_id + fingerprint) by summing counts.
        $duplicateGroups = DB::table('search_logs')
            ->select('client_session_id', 'fingerprint', DB::raw('COUNT(*) as aggregate_count'))
            ->whereNotNull('fingerprint')
            ->groupBy('client_session_id', 'fingerprint')
            ->having('aggregate_count', '>', 1)
            ->get();

        foreach ($duplicateGroups as $group) {
            $rows = DB::table('search_logs')
                ->where('client_session_id', $group->client_session_id)
                ->where('fingerprint', $group->fingerprint)
                ->orderBy('id')
                ->get(['id', 'count', 'created_at', 'updated_at']);

            if ($rows->count() <= 1) {
                continue;
            }

            $keep = $rows->first();
            $deleteIds = $rows->pluck('id')->slice(1)->all();

            $sumCount = (int) $rows->sum('count');
            $earliestCreatedAt = $rows->min('created_at');
            $latestUpdatedAt = $rows->max('updated_at');

            DB::table('search_logs')
                ->where('id', $keep->id)
                ->update([
                    'count' => $sumCount,
                    'created_at' => $earliestCreatedAt,
                    'updated_at' => $latestUpdatedAt,
                ]);

            if (!empty($deleteIds)) {
                DB::table('search_logs')->whereIn('id', $deleteIds)->delete();
            }
        }

        Schema::table('search_logs', function (Blueprint $table) {
            $table->unique(['client_session_id', 'fingerprint'], 'search_logs_session_fingerprint_unique');
            $table->index('fingerprint');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('search_logs', function (Blueprint $table) {
            $table->dropUnique('search_logs_session_fingerprint_unique');
            $table->dropIndex(['fingerprint']);
            $table->dropColumn('fingerprint');
        });
    }

    /**
     * @return array<int>
     */
    private static function normalizeIdArray(mixed $value): array
    {
        if ($value === null) {
            return [];
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                $value = $decoded;
            }
        }

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

    private static function normalizeDecimal(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (!is_numeric($value)) {
            return null;
        }

        return number_format((float) $value, 2, '.', '');
    }
};
