<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// PWA Dev Proxy Routes
if (file_exists(public_path('hot'))) {
    Route::get('/manifest.webmanifest', function () {
        $viteUrl = rtrim(file_get_contents(public_path('hot')));
        $response = Http::get($viteUrl . '/manifest.webmanifest');
        return response($response->body())
            ->header('Content-Type', 'application/manifest+json');
    });

    Route::get('/sw.js', function () {
        $viteUrl = rtrim(file_get_contents(public_path('hot')));
        $response = Http::get($viteUrl . '/sw.js');
        return response($response->body())
            ->header('Content-Type', 'application/javascript');
    });
}

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Nursery Routes
    Route::get('/nursery', [App\Http\Controllers\NurseryController::class, 'index'])->name('nursery.index');
    Route::post('/nursery', [App\Http\Controllers\NurseryController::class, 'store'])->name('nursery.store');
    Route::put('/nursery/{batch}/phase', [App\Http\Controllers\NurseryController::class, 'updatePhase'])->name('nursery.update_phase');

    // Production Routes
    Route::get('/production', [App\Http\Controllers\ProductionController::class, 'index'])->name('production.index');
    Route::post('/production/pindah-tanam', [App\Http\Controllers\ProductionController::class, 'storePindahTanam'])->name('production.store_pindah_tanam');
    Route::get('/production/{batch}', [App\Http\Controllers\MaintenanceController::class, 'show'])->name('production.show'); // Show Detail & Maintenance
    Route::post('/maintenance/jurnal', [App\Http\Controllers\MaintenanceController::class, 'store'])->name('maintenance.store');

    // Harvest Routes
    Route::get('/harvest', [App\Http\Controllers\HarvestController::class, 'index'])->name('harvest.index');
    Route::post('/harvest', [App\Http\Controllers\HarvestController::class, 'store'])->name('harvest.store');
});

require __DIR__ . '/auth.php';
