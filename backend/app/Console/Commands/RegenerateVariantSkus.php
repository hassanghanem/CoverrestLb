<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\Variant;

class RegenerateVariantSkus extends Command
{
    protected $signature = 'variants:regenerate-skus {product_id? : Regenerate SKUs only for this product ID}';

    protected $description = 'Regenerate variant SKUs based on product name, color, and size using Variant::generateSku()';

    public function handle(): int
    {
        $productId = $this->argument('product_id');

        $query = Product::query()->with(['variants']);

        if ($productId) {
            $query->where('id', $productId);
        }

        $count = 0;

        $query->chunkById(50, function ($products) use (&$count) {
            foreach ($products as $product) {
                foreach ($product->variants as $variant) {
                    $oldSku = $variant->sku;
                    $newSku = Variant::generateSku($product, $variant->color_id, $variant->size_id);

                    // Skip if unchanged (very unlikely with random suffix but safe)
                    if ($newSku === $oldSku) {
                        continue;
                    }

                    $variant->sku = $newSku;
                    $variant->saveQuietly();
                    $count++;

                    $this->line("Updated variant #{$variant->id} SKU: {$oldSku} -> {$newSku}");
                }
            }
        });

        $this->info("Regenerated SKUs for {$count} variants.");

        return Command::SUCCESS;
    }
}
