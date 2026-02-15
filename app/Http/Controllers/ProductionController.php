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

    public function storeLocation(Request $request)
    {
        $validated = $request->validate([
            'nama_lokasi' => 'required|string|max:255',
            'kapasitas' => 'required|integer|min:1',
            'foto_media' => 'nullable|image|max:2048',
        ]);

        $path = null;
        if ($request->hasFile('foto_media')) {
            $path = $request->file('foto_media')->store('uploads/locations', 'public');
        }

        MasterLokasi::create([
            'nama_lokasi' => $validated['nama_lokasi'],
            'tipe_lokasi' => 'produksi_hidroponik',
            'kapasitas' => $validated['kapasitas'],
            'foto_media' => $path,
        ]);

        return back()->with('success', 'Lokasi berhasil ditambahkan.');
    }

    public function updateLocation(Request $request, MasterLokasi $location)
    {
        $validated = $request->validate([
            'nama_lokasi' => 'required|string|max:255',
            'kapasitas' => 'required|integer|min:1',
            'foto_media' => 'nullable|image|max:2048',
        ]);

        $data = [
            'nama_lokasi' => $validated['nama_lokasi'],
            'kapasitas' => $validated['kapasitas'],
        ];

        if ($request->hasFile('foto_media')) {
            $data['foto_media'] = $request->file('foto_media')->store('uploads/locations', 'public');
        }

        $location->update($data);

        return back()->with('success', 'Lokasi berhasil diperbarui.');
    }

    public function destroyLocation(MasterLokasi $location)
    {
        try {
            // Note: Cascade delete is active in migrations for batch_tanams
            $location->delete();
            return back()->with('success', 'Media tanam berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Gagal menghapus media tanam: ' . $e->getMessage()]);
        }
    }
}
