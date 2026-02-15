<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterVarietas extends Model
{
    protected $table = 'master_varietas';
    protected $guarded = [];

    public function batchTanams()
    {
        return $this->hasMany(BatchTanam::class);
    }
}
