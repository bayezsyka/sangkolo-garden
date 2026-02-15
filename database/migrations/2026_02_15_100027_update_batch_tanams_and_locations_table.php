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
            $table->string('nama_custom')->nullable()->after('kode_batch');
            $table->string('foto_media')->nullable()->after('fase_saat_ini'); // Just in case
            // Change definition of master_varietas_id to nullable
            // We need to drop foreign key first if exists, then modify column
            // In SQLite/MySQL, modifying foreign key column can be tricky.
            // But let's try standard Laravel approach.
        });

        // To make master_varietas_id nullable, we need raw SQL or specific driver handling.
        // Or we can just add a new column and ignore the old one if null.
        // But the constraint prevents null.
        Schema::table('batch_tanams', function (Blueprint $table) {
            // Drop foreign key if it has a constraint. 
            // The constraint name is usually table_column_foreign.
            $table->dropForeign(['master_varietas_id']);
        });

        Schema::table('batch_tanams', function (Blueprint $table) {
            $table->unsignedBigInteger('master_varietas_id')->nullable()->change();
            // Re-add foreign key but nullable
            $table->foreign('master_varietas_id')->references('id')->on('master_varietas')->onDelete('set null');
        });

        // Change tanggal_mulai to datetime
        Schema::table('batch_tanams', function (Blueprint $table) {
            $table->dateTime('tanggal_mulai')->change();
        });

        Schema::table('master_lokasis', function (Blueprint $table) {
            $table->string('foto_media')->nullable(); // Photo for the media setup in the block
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batch_tanams', function (Blueprint $table) {
            $table->dropColumn('nama_custom');
            $table->dropColumn('foto_media');
            // Revert master_varietas_id to not null (requires valid data or truncated table)
            // Revert tanggal_mulai to date
            $table->date('tanggal_mulai')->change();
        });

        Schema::table('master_lokasis', function (Blueprint $table) {
            $table->dropColumn('foto_media');
        });
    }
};
