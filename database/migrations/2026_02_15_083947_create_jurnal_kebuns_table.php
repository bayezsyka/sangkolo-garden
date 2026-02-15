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
        Schema::create('jurnal_kebuns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_tanam_id')->constrained('batch_tanams')->cascadeOnDelete();
            $table->date('tanggal');
            $table->integer('ppm_nutrisi')->nullable();
            $table->decimal('ph_air', 3, 1)->nullable();
            $table->integer('suhu_air')->nullable();
            $table->text('catatan')->nullable();
            $table->string('foto_kondisi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jurnal_kebuns');
    }
};
