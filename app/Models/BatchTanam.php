<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchTanam extends Model
{
    protected $guarded = [];

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
