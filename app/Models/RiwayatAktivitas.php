<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiwayatAktivitas extends Model
{
    protected $table = 'riwayat_aktivitas';
    protected $guarded = [];

    public function batchTanam()
    {
        return $this->belongsTo(BatchTanam::class);
    }
}
