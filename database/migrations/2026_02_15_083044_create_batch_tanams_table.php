<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('batch_tanams', function (Blueprint $table) {
            $table->id();
            $table->string('kode_batch')->unique();
            $table->foreignId('master_varietas_id')->constrained('master_varietas')->cascadeOnDelete();
            $table->foreignId('lokasi_saat_ini_id')->constrained('master_lokasis')->cascadeOnDelete();
            $table->integer('jumlah_tanaman');
            $table->enum('metode_tanam', ['hidroponik', 'konvensional'])->default('hidroponik');
            $table->enum('fase_saat_ini', ['persiapan_benih', 'peram', 'semai_tray', 'pindah_tanam', 'panen', 'gagal']);
            $table->date('tanggal_mulai');
            $table->date('tanggal_panen_aktual')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_tanams');
    }
};
