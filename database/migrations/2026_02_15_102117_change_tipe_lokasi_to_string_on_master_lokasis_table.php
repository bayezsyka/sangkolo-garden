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
        Schema::table('master_lokasis', function (Blueprint $table) {
            $table->string('tipe_lokasi')->change();
        });
    }

    public function down(): void
    {
        Schema::table('master_lokasis', function (Blueprint $table) {
            $table->enum('tipe_lokasi', ['semai', 'produksi_hidroponik', 'gudang'])->change();
        });
    }
};
