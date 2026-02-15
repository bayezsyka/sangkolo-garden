<?php

namespace App\Http\Controllers;

use App\Models\BatchTanam;
use App\Models\MasterLokasi;
use App\Models\MasterVarietas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class NurseryController extends Controller
{
    public function index()
    {
        $phases = ['persiapan_benih', 'peram', 'semai_tray'];

        $batches = BatchTanam::with(['masterVarietas', 'lokasiSaatIni'])
            ->whereIn('fase_saat_ini', $phases)
            ->latest()
            ->get();

        $groupedBatches = [
            'persiapan_benih' => [],
            'peram' => [],
            'semai_tray' => [],
        ];

        foreach ($batches as $batch) {
            $groupedBatches[$batch->fase_saat_ini][] = $batch;
        }

        // Get available production locations (not currently occupied by a production batch)
        $availableLocations = MasterLokasi::where('tipe_lokasi', 'produksi_hidroponik')
            ->whereDoesntHave('batchTanams', function ($query) {
                // Assuming a location is occupied if it has a batch in 'produksi' phase
                $query->where('fase_saat_ini', 'produksi');
            })
            ->get();

        return Inertia::render('Nursery/Index', [
            'batches' => $groupedBatches,
            'varieties' => MasterVarietas::select('id', 'nama_varietas')->get(),
            'availableLocations' => $availableLocations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'master_varietas_id' => 'required|exists:master_varietas,id',
            'jumlah_tanaman' => 'required|integer|min:1',
        ]);

        // Find a default location for 'semai'
        $location = MasterLokasi::where('tipe_lokasi', 'semai')->first();

        if (!$location) {
            // Fallback: create a default location if none exists just to keep the app working
            $location = MasterLokasi::create([
                'nama_lokasi' => 'Ruang Semai Umum',
                'tipe_lokasi' => 'semai',
                'kapasitas' => 1000
            ]);
        }

        $code = 'BATCH-' . date('Ymd') . '-' . rand(100, 999);
        // Ensure uniqueness
        while (BatchTanam::where('kode_batch', $code)->exists()) {
            $code = 'BATCH-' . date('Ymd') . '-' . rand(100, 999);
        }

        BatchTanam::create([
            'kode_batch' => $code,
            'master_varietas_id' => $validated['master_varietas_id'],
            'lokasi_saat_ini_id' => $location->id,
            'jumlah_tanaman' => $validated['jumlah_tanaman'],
            'fase_saat_ini' => 'persiapan_benih',
            'tanggal_mulai' => now(),
            'metode_tanam' => 'hidroponik', // Default as per requirements
        ]);

        return redirect()->route('nursery.index')->with('success', 'Batch baru berhasil dibuat.');
    }

    public function updatePhase(Request $request, BatchTanam $batch)
    {
        $validated = $request->validate([
            'next_phase' => 'required|in:peram,semai_tray,pindah_tanam',
        ]);

        // Logic validation (optional but good practice)
        $currentPhase = $batch->fase_saat_ini;
        $nextPhase = $validated['next_phase'];

        if ($currentPhase === 'persiapan_benih' && $nextPhase !== 'peram') {
            return back()->withErrors(['phase' => 'Fase selanjutnya harus Pemeraman.']);
        }
        if ($currentPhase === 'peram' && $nextPhase !== 'semai_tray') {
            return back()->withErrors(['phase' => 'Fase selanjutnya harus Semai Tray.']);
        }

        $batch->update([
            'fase_saat_ini' => $nextPhase,
        ]);

        return redirect()->route('nursery.index');
    }
}
