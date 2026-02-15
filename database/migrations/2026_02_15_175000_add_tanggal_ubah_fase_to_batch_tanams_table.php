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
        Schema::table('batch_tanams', function (Blueprint $table) {
            $table->timestamp('tanggal_ubah_fase')->nullable()->after('fase_saat_ini');
        });

        // Backfill existing data: use tanggal_mulai (datetime) or fall back to created_at
        DB::statement('UPDATE batch_tanams SET tanggal_ubah_fase = COALESCE(tanggal_mulai, created_at)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batch_tanams', function (Blueprint $table) {
            $table->dropColumn('tanggal_ubah_fase');
        });
    }
};
