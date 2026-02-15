<?php

namespace App\Http\Controllers;

use App\Models\BatchTanam;
use App\Models\RiwayatAktivitas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HarvestController extends Controller
{
    public function index()
    {
        $harvests = BatchTanam::where('fase_saat_ini', 'panen')
            ->with(['masterVarietas', 'lokasiSaatIni'])
            ->orderByDesc('tanggal_panen_aktual')
            ->get();

        return Inertia::render('Harvest/Index', [
            'harvests' => $harvests,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'batch_id' => 'required|exists:batch_tanams,id',
            'total_berat_panen' => 'required|numeric|min:0',
            'jumlah_panen_layak' => 'required|integer|min:0',
            'jumlah_afkir' => 'nullable|integer|min:0',
            'catatan_panen' => 'nullable|string',
        ]);

        $batch = BatchTanam::findOrFail($validated['batch_id']);

        DB::transaction(function () use ($batch, $validated, $request) {
            $batch->update([
                'fase_saat_ini' => 'panen',
                'total_berat_panen' => $validated['total_berat_panen'],
                'jumlah_panen_layak' => $validated['jumlah_panen_layak'],
                'jumlah_afkir' => $validated['jumlah_afkir'] ?? 0,
                'catatan_panen' => $validated['catatan_panen'],
                'tanggal_panen_aktual' => now(),
            ]);

            RiwayatAktivitas::create([
                'batch_tanam_id' => $batch->id,
                'user_id' => $request->user()?->id,
                'deskripsi' => "Panen Selesai. Total: {$validated['total_berat_panen']} Kg. Layak: {$validated['jumlah_panen_layak']}, Afkir: " . ($validated['jumlah_afkir'] ?? 0),
            ]);
        });

        return redirect()->route('harvest.index')->with('success', 'Panen berhasil dicatat.');
    }
}
