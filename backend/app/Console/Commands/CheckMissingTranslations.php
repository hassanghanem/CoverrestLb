<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use RecursiveIteratorIterator;
use RecursiveDirectoryIterator;

class CheckMissingTranslations extends Command
{
    protected $signature = 'translations:scan';
    protected $description = 'Scan codebase for missing translation keys';

    protected $translationFunctions = ['__', 'trans', '@lang'];

    public function handle()
    {
        $this->info("🔍 Scanning for translation keys...");

        $usedKeys = $this->extractTranslationKeys([
            base_path('app'),
            base_path('resources/views'),
            base_path('routes'),
        ]);

        $definedKeys = $this->loadDefinedKeys(resource_path('lang'));

        $missing = [];

        foreach ($usedKeys as $key => $locations) {
            foreach ($definedKeys as $locale => $keys) {
                if (!in_array($key, $keys)) {
                    $missing[$locale][$key] = $locations;
                }
            }
        }

        if (empty($missing)) {
            $this->info("✅ All translations are present!");
            return Command::SUCCESS;
        }

        foreach ($missing as $locale => $keys) {
            $this->warn("🚨 Missing in [$locale]:");
            foreach ($keys as $key => $locations) {
                $this->line(" - $key");
                foreach ($locations as $location) {
                    $this->line("    ➤ $location");
                }
            }
        }

        return Command::FAILURE;
    }

    protected function extractTranslationKeys(array $paths): array
    {
        $keys = [];

        foreach ($paths as $path) {
            $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path));
            foreach ($files as $file) {
                if (!$file->isFile() || !preg_match('/\.(php|blade\.php)$/', $file->getFilename())) {
                    continue;
                }

                $content = file($file->getPathname(), FILE_IGNORE_NEW_LINES);

                foreach ($content as $lineNumber => $lineContent) {
                    foreach ($this->translationFunctions as $func) {
                        preg_match_all("/{$func}\(\s*['\"](.*?)['\"]\s*[\),]/", $lineContent, $matches);
                        if (!empty($matches[1])) {
                            foreach ($matches[1] as $key) {
                                $keys[$key][] = $file->getPathname() . ' (line ' . ($lineNumber + 1) . ')';
                            }
                        }
                    }

                    // Dynamic keys via __($messageKey)
                    preg_match_all("/__\(\s*\$(\w+)\s*\)/", $lineContent, $dynamicMatches);
                    if (!empty($dynamicMatches[1])) {
                        foreach ($dynamicMatches[1] as $var) {
                            $this->line("⚠️  Warning: Detected dynamic key usage: __(\$$var) in {$file->getFilename()} (line " . ($lineNumber + 1) . ")");
                        }
                    }
                }
            }
        }

        return $keys;
    }

    protected function loadDefinedKeys(string $langPath): array
    {
        $locales = array_filter(scandir($langPath), fn($dir) => !Str::startsWith($dir, '.') && is_dir("$langPath/$dir"));
        
        // Include JSON files in the root lang folder
        $jsonFiles = glob("$langPath/*.json");
        foreach ($jsonFiles as $file) {
            $locale = basename($file, '.json');
            $locales[] = $locale;
        }

        $locales = array_unique($locales);

        $defined = [];

        foreach ($locales as $locale) {
            $defined[$locale] = [];

            // PHP files
            $phpPath = "$langPath/$locale";
            if (is_dir($phpPath)) {
                $defined[$locale] = $this->flattenTranslations($phpPath);
            }

            // JSON files
            $jsonFile = "$langPath/$locale.json";
            if (file_exists($jsonFile)) {
                $jsonArray = json_decode(file_get_contents($jsonFile), true) ?? [];
                $defined[$locale] = array_merge($defined[$locale], $this->flattenJson($jsonArray));
            }
        }

        return $defined;
    }

    protected function flattenTranslations(string $path): array
    {
        $keys = [];
        $files = glob("$path/*.php");
        foreach ($files as $file) {
            $array = include $file;
            $filename = basename($file, '.php');
            $keys = array_merge($keys, $this->dotArray($array, $filename));
        }
        return $keys;
    }

    protected function flattenJson(array $array, string $prefix = ''): array
    {
        $results = [];
        foreach ($array as $key => $value) {
            $fullKey = $prefix === '' ? $key : $prefix . '.' . $key;
            if (is_array($value)) {
                $results = array_merge($results, $this->flattenJson($value, $fullKey));
            } else {
                $results[] = $fullKey;
            }
        }
        return $results;
    }

    protected function dotArray(array $array, string $prefix): array
    {
        $results = [];
        foreach ($array as $key => $value) {
            $fullKey = $prefix . '.' . $key;
            if (is_array($value)) {
                $results = array_merge($results, $this->dotArray($value, $fullKey));
            } else {
                $results[] = $fullKey;
            }
        }
        return $results;
    }
}
// php artisan translations:scan
