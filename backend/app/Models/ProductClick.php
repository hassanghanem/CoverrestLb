<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductClick extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_session_id',
        'product_id',
        'count',
    ];

    public function clientSession()
    {
        return $this->belongsTo(ClientSession::class);
    }
    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
