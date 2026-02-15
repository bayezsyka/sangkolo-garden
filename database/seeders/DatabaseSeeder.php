<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\BatchTanam;
use App\Models\MasterVarietas;
use App\Models\MasterLokasi;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\Models\RiwayatFaseTanam;


class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User
        User::firstOrCreate(
            ['email' => 'a@a.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        // ── Varieties ──
        $varieties = [
            ['nama_varietas' => 'Kangkung',         'jenis_tanaman' => 'sayur_daun',  'estimasi_hari_panen' => 25],
            ['nama_varietas' => 'Bayam Merah',      'jenis_tanaman' => 'sayur_daun',  'estimasi_hari_panen' => 30],
            ['nama_varietas' => 'Pakcoy',           'jenis_tanaman' => 'sayur_daun',  'estimasi_hari_panen' => 35],
            ['nama_varietas' => 'Selada Keriting',  'jenis_tanaman' => 'sayur_daun',  'estimasi_hari_panen' => 40],
            ['nama_varietas' => 'Sawi Hijau',       'jenis_tanaman' => 'sayur_daun',  'estimasi_hari_panen' => 28],
        ];
        foreach ($varieties as $v) {
            MasterVarietas::firstOrCreate(
                ['nama_varietas' => $v['nama_varietas']],
                ['jenis_tanaman' => $v['jenis_tanaman'], 'estimasi_hari_panen' => $v['estimasi_hari_panen']]
            );
        }

        // ── Nursery Locations ──
        $nurseryLocations = [
            ['nama_lokasi' => 'Bak Rendam A', 'tipe_lokasi' => 'semai', 'kapasitas' => 200],
            ['nama_lokasi' => 'Rak Peram 1', 'tipe_lokasi' => 'pemeraman', 'kapasitas' => 150],
            ['nama_lokasi' => 'Tray Semai B', 'tipe_lokasi' => 'semai_tray', 'kapasitas' => 100],
        ];
        foreach ($nurseryLocations as $loc) {
            MasterLokasi::firstOrCreate(
                ['nama_lokasi' => $loc['nama_lokasi'], 'tipe_lokasi' => $loc['tipe_lokasi']],
                ['kapasitas' => $loc['kapasitas']]
            );
        }

        // ── Production Locations ──
        $prodLocations = [];
        for ($i = 1; $i <= 6; $i++) {
            $prodLocations[] = MasterLokasi::firstOrCreate(
                ['nama_lokasi' => "Modul A{$i}", 'tipe_lokasi' => 'produksi_hidroponik'],
                ['kapasitas' => 200]
            );
        }

        // ── Nursery Batches (different phases, randomized times) ──
        $nurseryPhases = [
            ['fase' => 'persiapan_benih', 'lokasi_tipe' => 'semai'],
            ['fase' => 'peram',           'lokasi_tipe' => 'pemeraman'],
            ['fase' => 'semai_tray',      'lokasi_tipe' => 'semai_tray'],
        ];

        $allVarieties = MasterVarietas::all();
        $batchIndex = 1;

        foreach ($nurseryPhases as $phase) {
            // 2 batches per nursery phase
            for ($j = 0; $j < 2; $j++) {
                $variety = $allVarieties->random();
                $lokasi = MasterLokasi::where('tipe_lokasi', $phase['lokasi_tipe'])->first();

                // Randomize: planted 3-15 days ago, phase changed 1-100 hours ago
                $tanggalMulai = Carbon::now()->subDays(rand(3, 15))->subHours(rand(0, 12));
                $tanggalUbahFase = Carbon::now()->subHours(rand(1, 100))->subMinutes(rand(0, 59))->subSeconds(rand(0, 59));

                $batch = BatchTanam::create([
                    'kode_batch'         => 'BATCH-' . date('Ymd') . '-' . str_pad($batchIndex, 3, '0', STR_PAD_LEFT),
                    'master_varietas_id' => $variety->id,
                    'nama_custom'        => $variety->nama_varietas,
                    'lokasi_saat_ini_id' => $lokasi?->id,
                    'jumlah_tanaman'     => rand(50, 200),
                    'fase_saat_ini'      => $phase['fase'],
                    'tanggal_mulai'      => $tanggalMulai,
                    'tanggal_ubah_fase'  => $tanggalUbahFase,
                    'metode_tanam'       => 'hidroponik',
                ]);

                // Seed fake history trail
                if ($phase['fase'] === 'peram') {
                    RiwayatFaseTanam::create([
                        'batch_tanam_id' => $batch->id,
                        'fase' => 'persiapan_benih',
                        'tanggal_mulai' => $tanggalMulai,
                        'tanggal_selesai' => $tanggalUbahFase,
                        'nama_lokasi' => 'Bak Rendam A',
                    ]);
                } else if ($phase['fase'] === 'semai_tray') {
                    $t1 = $tanggalMulai;
                    $t2 = $tanggalMulai->copy()->addHours(24);
                    RiwayatFaseTanam::create([
                        'batch_tanam_id' => $batch->id,
                        'fase' => 'persiapan_benih',
                        'tanggal_mulai' => $t1,
                        'tanggal_selesai' => $t2,
                        'nama_lokasi' => 'Bak Rendam A',
                    ]);
                    RiwayatFaseTanam::create([
                        'batch_tanam_id' => $batch->id,
                        'fase' => 'peram',
                        'tanggal_mulai' => $t2,
                        'tanggal_selesai' => $tanggalUbahFase,
                        'nama_lokasi' => 'Rak Peram 1',
                    ]);
                }

                // Current active phase
                RiwayatFaseTanam::create([
                    'batch_tanam_id' => $batch->id,
                    'fase' => $phase['fase'],
                    'tanggal_mulai' => $tanggalUbahFase,
                    'nama_lokasi' => $lokasi?->nama_lokasi,
                ]);

                $batchIndex++;
            }
        }

        // ── Production Batches (occupy some modules, randomized times) ──
        $prodVarieties = $allVarieties->shuffle()->take(3);
        foreach ($prodVarieties as $idx => $variety) {
            if (!isset($prodLocations[$idx])) break;

            $tanggalMulai = Carbon::now()->subDays(rand(10, 30))->subHours(rand(0, 23));
            $tanggalUbahFase = Carbon::now()->subHours(rand(2, 200))->subMinutes(rand(0, 59))->subSeconds(rand(0, 59));

            $batch = BatchTanam::create([
                'kode_batch'         => 'BATCH-' . date('Ymd') . '-' . str_pad($batchIndex, 3, '0', STR_PAD_LEFT),
                'master_varietas_id' => $variety->id,
                'nama_custom'        => $variety->nama_varietas,
                'lokasi_saat_ini_id' => $prodLocations[$idx]->id,
                'jumlah_tanaman'     => rand(100, 200),
                'fase_saat_ini'      => 'produksi',
                'tanggal_mulai'      => $tanggalMulai,
                'tanggal_ubah_fase'  => $tanggalUbahFase,
                'metode_tanam'       => 'hidroponik',
            ]);

            // Fake history for production
            RiwayatFaseTanam::create([
                'batch_tanam_id' => $batch->id,
                'fase' => 'semai_tray',
                'tanggal_mulai' => $tanggalMulai,
                'tanggal_selesai' => $tanggalUbahFase,
                'nama_lokasi' => 'Tray Semai B',
            ]);

            RiwayatFaseTanam::create([
                'batch_tanam_id' => $batch->id,
                'fase' => 'produksi',
                'tanggal_mulai' => $tanggalUbahFase,
                'nama_lokasi' => $prodLocations[$idx]->nama_lokasi,
            ]);

            $batchIndex++;
        }
    }
}
