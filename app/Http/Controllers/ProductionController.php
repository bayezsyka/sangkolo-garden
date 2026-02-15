<?php

namespace App\Http\Controllers;

use App\Models\BatchTanam;
use App\Models\MasterLokasi;
use App\Models\RiwayatAktivitas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductionController extends Controller
{
    public function index()
    {
        // Get all production locations
        // Eager load active batches (phase = 'produksi')
        $locations = MasterLokasi::where('tipe_lokasi', 'produksi_hidroponik')
            ->with(['batchTanams' => function ($query) {
                $query->where('fase_saat_ini', 'produksi')
                    ->with('masterVarietas'); // Load variety info for display
            }])
            ->get();

        return Inertia::render('Production/Index', [
            'locations' => $locations,
        ]);
    }

    public function storePindahTanam(Request $request)
    {
        $validated = $request->validate([
            'batch_id' => 'required|exists:batch_tanams,id',
            'lokasi_tujuan_id' => 'required|exists:master_lokasis,id',
            'jumlah_tanaman_hidup' => 'required|integer|min:1',
        ]);

        $batch = BatchTanam::findOrFail($validated['batch_id']);
        $targetLocation = MasterLokasi::findOrFail($validated['lokasi_tujuan_id']);

        // Check if target location is valid type
        if ($targetLocation->tipe_lokasi !== 'produksi_hidroponik') {
            return back()->withErrors(['lokasi_tujuan_id' => 'Lokasi tujuan harus tipe Produksi Hidroponik.']);
        }

        DB::transaction(function () use ($batch, $targetLocation, $validated, $request) {
            $oldLocationName = $batch->lokasiSaatIni ? $batch->lokasiSaatIni->nama_lokasi : 'Tidak Diketahui';

            // Update Batch
            $batch->update([
                'lokasi_saat_ini_id' => $targetLocation->id,
                'jumlah_tanaman' => $validated['jumlah_tanaman_hidup'],
                'fase_saat_ini' => 'produksi',
                // Assuming 'tanggal_pindah_tanam' might be useful, but not in current schema.
                // Keeping it simple as per request.
            ]);

            // Create Activity History
            RiwayatAktivitas::create([
                'batch_tanam_id' => $batch->id,
                'user_id' => $request->user()?->id,
                'deskripsi' => "Pindah Tanam dari {$oldLocationName} ke {$targetLocation->nama_lokasi}. Jumlah: {$validated['jumlah_tanaman_hidup']} tanaman.",
            ]);
        });

        return redirect()->route('production.index')->with('success', 'Berhasil pindah tanam ke produksi.');
    }
}
