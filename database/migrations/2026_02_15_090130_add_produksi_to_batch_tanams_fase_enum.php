<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE batch_tanams MODIFY COLUMN fase_saat_ini ENUM('persiapan_benih', 'peram', 'semai_tray', 'pindah_tanam', 'produksi', 'panen', 'gagal') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE batch_tanams MODIFY COLUMN fase_saat_ini ENUM('persiapan_benih', 'peram', 'semai_tray', 'pindah_tanam', 'panen', 'gagal') NOT NULL");
    }
};
