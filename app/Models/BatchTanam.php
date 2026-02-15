<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchTanam extends Model
{
    protected $guarded = [];

    protected $casts = [
        'tanggal_mulai' => 'datetime',
        'tanggal_panen_aktual' => 'date',
    ];

    protected $appends = ['nama_tanaman'];

    public function getNamaTanamanAttribute()
    {
        return $this->masterVarietas ? $this->masterVarietas->nama_varietas : ($this->nama_custom ?? 'Tanpa Nama');
    }

    public function masterVarietas()
    {
        return $this->belongsTo(MasterVarietas::class);
    }

    public function lokasiSaatIni()
    {
        return $this->belongsTo(MasterLokasi::class, 'lokasi_saat_ini_id');
    }

    public function jurnalKebuns()
    {
        return $this->hasMany(JurnalKebun::class);
    }
}
