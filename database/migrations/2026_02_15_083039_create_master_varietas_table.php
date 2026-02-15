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
        Schema::create('master_varietas', function (Blueprint $table) {
            $table->id();
            $table->string('nama_varietas');
            $table->enum('jenis_tanaman', ['sayur_daun', 'sayur_buah']);
            $table->integer('estimasi_hari_panen');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_varietas');
    }
};
