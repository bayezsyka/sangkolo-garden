<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiwayatFaseTanam extends Model
{
    protected $guarded = [];

    protected $casts = [
        'tanggal_mulai' => 'datetime',
        'tanggal_selesai' => 'datetime',
    ];

    public function batchTanam()
    {
        return $this->belongsTo(BatchTanam::class);
    }
}
