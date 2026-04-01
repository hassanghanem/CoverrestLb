<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ConfigureMeilisearchIndex extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'meilisearch:configure-index {--index=products_index : The index to configure}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Configure Meilisearch index settings (searchable, filterable, ranking, synonyms)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Syncing Meilisearch index settings from config/scout.php...');

        try {
            $host = rtrim((string) config('scout.meilisearch.host'), '/');
            if ($host === '') {
                $this->error('MEILISEARCH_HOST is not configured.');
                return Command::FAILURE;
            }

            // Fail fast if Meilisearch is not reachable.
            $healthUrl = $host.'/health';
            $health = Http::timeout(3)->retry(1, 200)->get($healthUrl);
            if (! $health->ok()) {
                $this->error('Meilisearch is not reachable at: '.$healthUrl);
                return Command::FAILURE;
            }

            $exitCode = $this->call('scout:sync-index-settings', ['--driver' => 'meilisearch']);

            if ($exitCode !== 0) {
                return Command::FAILURE;
            }

            $this->info('✓ Index settings synced successfully!');
            
            $this->newLine();
            $this->info('Next steps:');
            $this->line('1. Import products: php artisan scout:import "App\Models\Product"');
            $this->line('2. Test search: php artisan tinker -> Product::search("test")->get()');
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to configure index: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
