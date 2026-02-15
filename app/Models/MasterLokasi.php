<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterLokasi extends Model
{
    protected $guarded = [];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function batchTanams()
    {
        return $this->hasMany(BatchTanam::class, 'lokasi_saat_ini_id');
    }
}
