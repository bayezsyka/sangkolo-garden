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
        Schema::table('batch_tanams', function (Blueprint $table) {
            if (!Schema::hasColumn('batch_tanams', 'total_berat_panen')) {
                $table->decimal('total_berat_panen', 8, 2)->nullable();
            }
            if (!Schema::hasColumn('batch_tanams', 'jumlah_panen_layak')) {
                $table->integer('jumlah_panen_layak')->nullable();
            }
            if (!Schema::hasColumn('batch_tanams', 'jumlah_afkir')) {
                $table->integer('jumlah_afkir')->nullable()->default(0);
            }
            if (!Schema::hasColumn('batch_tanams', 'catatan_panen')) {
                $table->text('catatan_panen')->nullable();
            }
            // Skip tanggal_panen_aktual as it was already created in the base migration
            // and we don't want to conflict or change type without necessity here.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batch_tanams', function (Blueprint $table) {
            $table->dropColumn(['total_berat_panen', 'jumlah_panen_layak', 'jumlah_afkir', 'catatan_panen', 'tanggal_panen_aktual']);
        });
    }
};
