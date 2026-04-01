<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class BackupHealthCheck extends Command
{
    protected $signature = 'backup:health-check {--notify : Send notifications if issues found}';
    protected $description = 'Check backup health and integrity';

    public function handle()
    {
        $this->info('🔍 Checking backup health...');
        
        $issues = [];
        
        // Check Google Drive connection
        $this->line('Checking Google Drive connection...');
        if (!$this->testGoogleDriveConnection()) {
            $issues[] = 'Google Drive connection failed';
            $this->error('❌ Google Drive connection failed');
        } else {
            $this->info('✅ Google Drive connection successful');
        }
        
        // Check recent backups
        $this->line('Checking recent backups...');
        $recentBackups = $this->getRecentBackups();
        
        if (empty($recentBackups)) {
            $issues[] = 'No recent backups found';
            $this->error('❌ No recent backups found');
        } else {
            $this->info("✅ Found {count($recentBackups)} recent backups");
            
            foreach ($recentBackups as $backup) {
                $this->line("  - {$backup['name']} ({$backup['date']})");
            }
        }
        
        // Check backup age
        $lastBackupAge = $this->getLastBackupAge();
        if ($lastBackupAge > 24) { // More than 24 hours
            $issues[] = "Last backup is {$lastBackupAge} hours old";
            $this->error("❌ Last backup is {$lastBackupAge} hours old");
        } else {
            $this->info("✅ Last backup is {$lastBackupAge} hours old");
        }
        
        // Check disk space
        $this->line('Checking storage space...');
        $spaceInfo = $this->checkStorageSpace();
        
        if ($spaceInfo['usage_percent'] > 80) {
            $issues[] = "Storage usage is {$spaceInfo['usage_percent']}%";
            $this->error("❌ High storage usage: {$spaceInfo['usage_percent']}%");
        } else {
            $this->info("✅ Storage usage: {$spaceInfo['usage_percent']}%");
        }
        
        // Summary
        $this->newLine();
        if (empty($issues)) {
            $this->info('🎉 All backup health checks passed!');
            return 0;
        } else {
            $this->error('⚠️  Backup health issues found:');
            foreach ($issues as $issue) {
                $this->line("  - {$issue}");
            }
            
            if ($this->option('notify')) {
                $this->sendHealthNotification($issues);
            }
            
            return 1;
        }
    }
    
    private function testGoogleDriveConnection(): bool
    {
        try {
            $testFile = 'health-check-' . now()->format('Y-m-d-H-i-s') . '.txt';
            Storage::disk('google_drive')->put($testFile, 'Health check test');
            $content = Storage::disk('google_drive')->get($testFile);
            Storage::disk('google_drive')->delete($testFile);
            
            return $content === 'Health check test';
        } catch (\Exception $e) {
            $this->line("Google Drive error: {$e->getMessage()}");
            return false;
        }
    }
    
    private function getRecentBackups(): array
    {
        $backups = [];
        
        try {
            // Check Google Drive backups
            $gdFiles = Storage::disk('google_drive')->files('/');
            foreach ($gdFiles as $file) {
                if (str_contains($file, '.zip')) {
                    $backups[] = [
                        'name' => $file,
                        'date' => Storage::disk('google_drive')->lastModified($file) 
                            ? Carbon::createFromTimestamp(Storage::disk('google_drive')->lastModified($file))->format('Y-m-d H:i:s')
                            : 'Unknown',
                        'location' => 'Google Drive'
                    ];
                }
            }
        } catch (\Exception $e) {
            $this->line("Error reading Google Drive: {$e->getMessage()}");
        }
        
        // Sort by date (most recent first)
        usort($backups, function($a, $b) {
            return strcmp($b['date'], $a['date']);
        });
        
        return array_slice($backups, 0, 5); // Return last 5 backups
    }
    
    private function getLastBackupAge(): float
    {
        $backups = $this->getRecentBackups();
        
        if (empty($backups)) {
            return 999; // Very old if no backups found
        }
        
        $lastBackup = $backups[0];
        $lastBackupTime = Carbon::parse($lastBackup['date']);
        
        return $lastBackupTime->diffInHours(now());
    }
    
    private function checkStorageSpace(): array
    {
        $totalSpace = disk_total_space(storage_path());
        $freeSpace = disk_free_space(storage_path());
        $usedSpace = $totalSpace - $freeSpace;
        $usagePercent = round(($usedSpace / $totalSpace) * 100, 2);
        
        return [
            'total' => $totalSpace,
            'free' => $freeSpace,
            'used' => $usedSpace,
            'usage_percent' => $usagePercent
        ];
    }
    
    private function sendHealthNotification(array $issues): void
    {
        // This would integrate with your notification system
        $this->info('📧 Health notification would be sent here');
        // You can implement email/Slack/Discord notifications here
    }
}