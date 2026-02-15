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

        // Locations for each phase
        $locations = [
            'semai' => MasterLokasi::where('tipe_lokasi', 'semai')->get(),
            'pemeraman' => MasterLokasi::where('tipe_lokasi', 'pemeraman')->get(),
            'semai_tray' => MasterLokasi::where('tipe_lokasi', 'semai_tray')->get(),
            'produksi' => MasterLokasi::where('tipe_lokasi', 'produksi_hidroponik')
                ->whereDoesntHave('batchTanams', function ($query) {
                    $query->where('fase_saat_ini', 'produksi');
                })->get(),
        ];

        return Inertia::render('Nursery/Index', [
            'batches' => $groupedBatches,
            'varieties' => MasterVarietas::select('id', 'nama_varietas')->get(),
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_tanaman' => 'required|string|max:255',
            'jumlah_tanaman' => 'required|integer|min:1',
            'tanggal_tanam' => 'required|date',
            'nama_lokasi' => 'required|string|max:255',
            'foto_media' => 'nullable|image|max:2048',
        ]);

        $code = 'BATCH-' . date('Ymd') . '-' . rand(100, 999);
        // Ensure uniqueness
        while (BatchTanam::where('kode_batch', $code)->exists()) {
            $code = 'BATCH-' . date('Ymd') . '-' . rand(100, 999);
        }

        $photoPath = null;
        if ($request->hasFile('foto_media')) {
            $photoPath = $request->file('foto_media')->store('uploads/media', 'public');
        }

        $location = MasterLokasi::firstOrCreate(
            ['nama_lokasi' => $validated['nama_lokasi'], 'tipe_lokasi' => 'semai'],
            ['kapasitas' => 100]
        );

        BatchTanam::create([
            'kode_batch' => $code,
            'master_varietas_id' => null,
            'nama_custom' => $validated['nama_tanaman'],
            'lokasi_saat_ini_id' => $location->id,
            'jumlah_tanaman' => $validated['jumlah_tanaman'],
            'fase_saat_ini' => 'persiapan_benih',
            'tanggal_mulai' => $validated['tanggal_tanam'],
            'metode_tanam' => 'hidroponik',
            'foto_media' => $photoPath,
        ]);

        return redirect()->route('nursery.index')->with('success', 'Batch baru berhasil dibuat.');
    }

    public function update(Request $request, BatchTanam $batch)
    {
        $validated = $request->validate([
            'nama_custom' => 'required|string|max:255',
            'jumlah_tanaman' => 'required|integer|min:1',
        ]);

        $batch->update($validated);

        return back()->with('success', 'Batch berhasil diperbarui.');
    }

    public function destroy(BatchTanam $batch)
    {
        $batch->delete();
        return back()->with('success', 'Batch berhasil dihapus.');
    }

    public function updatePhase(Request $request, BatchTanam $batch)
    {
        $validated = $request->validate([
            'next_phase' => 'required|in:persiapan_benih,peram,semai_tray,pindah_tanam',
            'nama_lokasi' => 'required_unless:next_phase,pindah_tanam|string|max:255',
        ]);

        $updateData = [
            'fase_saat_ini' => $validated['next_phase'],
        ];

        if ($request->has('nama_lokasi')) {
            $tipe = match ($validated['next_phase']) {
                'persiapan_benih' => 'semai',
                'peram' => 'pemeraman',
                'semai_tray' => 'semai_tray',
                default => 'semai'
            };

            $location = MasterLokasi::firstOrCreate(
                ['nama_lokasi' => $validated['nama_lokasi'], 'tipe_lokasi' => $tipe],
                ['kapasitas' => 100]
            );

            $updateData['lokasi_saat_ini_id'] = $location->id;
        }

        $batch->update($updateData);

        return redirect()->route('nursery.index')->with('success', 'Fase batch diperbarui.');
    }
}
