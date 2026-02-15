<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\MasterVarietas;
use App\Models\MasterLokasi;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'a@a.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Seed Varietas
        $varieties = [
            ['nama_varietas' => 'Selada Kriting', 'jenis_tanaman' => 'sayur_daun', 'estimasi_hari_panen' => 45],
            ['nama_varietas' => 'Pakcoy Green', 'jenis_tanaman' => 'sayur_daun', 'estimasi_hari_panen' => 30],
            ['nama_varietas' => 'Bayam Merah', 'jenis_tanaman' => 'sayur_daun', 'estimasi_hari_panen' => 25],
            ['nama_varietas' => 'Tomat Cherry', 'jenis_tanaman' => 'sayur_buah', 'estimasi_hari_panen' => 90],
        ];

        foreach ($varieties as $v) {
            MasterVarietas::firstOrCreate(['nama_varietas' => $v['nama_varietas']], $v);
        }

        // Seed Lokasi
        $locations = [
            ['nama_lokasi' => 'Rak Semai A', 'tipe_lokasi' => 'semai', 'kapasitas' => 500],
            ['nama_lokasi' => 'Rak Semai B', 'tipe_lokasi' => 'semai', 'kapasitas' => 500],
            ['nama_lokasi' => 'Modul DFT 1', 'tipe_lokasi' => 'produksi_hidroponik', 'kapasitas' => 200],
            ['nama_lokasi' => 'Gudang Utama', 'tipe_lokasi' => 'gudang', 'kapasitas' => 10000],
        ];

        foreach ($locations as $l) {
            MasterLokasi::firstOrCreate(['nama_lokasi' => $l['nama_lokasi']], $l);
        }
    }
}
