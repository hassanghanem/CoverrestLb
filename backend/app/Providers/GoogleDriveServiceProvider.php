<?php

namespace App\Providers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use Google\Client;
use Google\Service\Drive;
use Masbug\Flysystem\GoogleDriveAdapter;
use League\Flysystem\Filesystem;
use Illuminate\Filesystem\FilesystemAdapter;
use Exception;
use Illuminate\Support\Facades\Log;

class GoogleDriveServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        try {
            Storage::extend('google', function ($app, $config) {
                $options = [];

                // Standard options check
                if (!empty($config['teamDriveId'] ?? null)) {
                    $options['teamDriveId'] = $config['teamDriveId'];
                }

                if (!empty($config['sharedFolderId'] ?? null)) {
                    $options['sharedFolderId'] = $config['sharedFolderId'];
                }
                
                // 1. Initialize Google Client
                $client = new Client();
                $client->setClientId($config['clientId']);
                $client->setClientSecret($config['clientSecret']);
                $client->refreshToken($config['refreshToken']); // This handles token refresh automatically

                // 2. Initialize Google Drive Service
                $service = new Drive($client);

                // 3. Create the Masbug Adapter
                // Note: using $config['folder'] here is fine, but 'folderId' is more common.
                $adapter = new GoogleDriveAdapter($service, $config['folder'] ?? '/', $options);
                
                // 4. Wrap the Adapter in a Flysystem V3 Filesystem
                $driver = new Filesystem($adapter);

                // 5. Return the Laravel FilesystemAdapter
                return new FilesystemAdapter($driver, $adapter);
            });
        } catch (Exception $e) {
            // Log the error message for debugging purposes
            Log::error('Google Drive Storage Extension Failed: ' . $e->getMessage());
        }
    }
}