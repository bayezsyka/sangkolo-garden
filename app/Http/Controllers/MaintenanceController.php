<?php

namespace App\Http\Controllers;

use App\Models\BatchTanam;
use App\Models\JurnalKebun;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class MaintenanceController extends Controller
{
    public function show($batchId)
    {
        $batch = BatchTanam::with(['masterVarietas', 'lokasiSaatIni', 'jurnalKebuns' => function ($query) {
            $query->latest('tanggal')->latest('created_at');
        }])->findOrFail($batchId);

        return Inertia::render('Production/Show', [
            'batch' => $batch,
            'server_time' => \Carbon\Carbon::now()->toIso8601String(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'batch_tanam_id' => 'required|exists:batch_tanams,id',
            'tanggal' => 'required|date',
            'ppm_nutrisi' => 'nullable|integer',
            'ph_air' => 'nullable|numeric|between:0,14',
            'suhu_air' => 'nullable|integer',
            'catatan' => 'nullable|string',
            'foto_kondisi' => 'nullable|image|max:2048', // Max 2MB
        ]);

        $data = $validated;

        if ($request->hasFile('foto_kondisi')) {
            $path = $request->file('foto_kondisi')->store('jurnal-kebun', 'public');
            $data['foto_kondisi'] = $path;
        }

        JurnalKebun::create($data);

        return back()->with('success', 'Data jurnal berhasil disimpan.');
    }
}
