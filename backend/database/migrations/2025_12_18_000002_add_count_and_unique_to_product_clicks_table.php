<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_clicks', function (Blueprint $table) {
            $table->unsignedInteger('count')->default(1)->after('product_id');
        });

        // Consolidate duplicates (same client_session_id + product_id) by summing counts.
        $duplicateGroups = DB::table('product_clicks')
            ->select('client_session_id', 'product_id', DB::raw('COUNT(*) as aggregate_count'))
            ->groupBy('client_session_id', 'product_id')
            ->having('aggregate_count', '>', 1)
            ->get();

        foreach ($duplicateGroups as $group) {
            $rows = DB::table('product_clicks')
                ->where('client_session_id', $group->client_session_id)
                ->where('product_id', $group->product_id)
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

            DB::table('product_clicks')
                ->where('id', $keep->id)
                ->update([
                    'count' => $sumCount,
                    'created_at' => $earliestCreatedAt,
                    'updated_at' => $latestUpdatedAt,
                ]);

            if (!empty($deleteIds)) {
                DB::table('product_clicks')->whereIn('id', $deleteIds)->delete();
            }
        }

        Schema::table('product_clicks', function (Blueprint $table) {
            $table->unique(['client_session_id', 'product_id'], 'product_clicks_session_product_unique');
            $table->index('product_id');
            $table->index('client_session_id');
        });
    }

    public function down(): void
    {
        Schema::table('product_clicks', function (Blueprint $table) {
            $table->dropUnique('product_clicks_session_product_unique');
            $table->dropIndex(['product_id']);
            $table->dropIndex(['client_session_id']);
            $table->dropColumn('count');
        });
    }
};
