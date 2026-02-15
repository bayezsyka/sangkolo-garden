<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JurnalKebun extends Model
{
    protected $guarded = [];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function batchTanam()
    {
        return $this->belongsTo(BatchTanam::class);
    }
}
