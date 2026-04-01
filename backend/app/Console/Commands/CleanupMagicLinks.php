<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\MagicLinkService;

class CleanupMagicLinks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'magic-links:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old and expired magic links';

    /**
     * Execute the console command.
     */
    public function handle(MagicLinkService $magicLinkService)
    {
        $this->info('Cleaning up old magic links...');
        
        $deleted = $magicLinkService->cleanup();
        
        $this->info("Cleaned up {$deleted} old magic link(s).");
        
        return Command::SUCCESS;
    }
}
