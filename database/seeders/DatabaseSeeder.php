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
    }
}
