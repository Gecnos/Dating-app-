<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExplorerTest extends TestCase
{
    use RefreshDatabase;

    // Regression tests: these filters used raw Postgres-only SQL
    // (ilike/::text, EXTRACT(YEAR FROM AGE(...)), acos/radians/sin/cos) and
    // crashed with a 500 on any other driver — including the sqlite default
    // a fresh checkout of this project actually runs on.

    public function test_search_filter_does_not_crash_on_sqlite(): void
    {
        $me = User::factory()->create();
        User::factory()->create(['name' => 'Findable Person']);
        Sanctum::actingAs($me);

        $this->getJson('/api/explorer?search=Findable')
            ->assertStatus(200)
            ->assertJsonPath('profiles.0.name', 'Findable Person');
    }

    public function test_age_filters_do_not_crash_on_sqlite(): void
    {
        $me = User::factory()->create();
        User::factory()->create(['date_of_birth' => now()->subYears(25)->toDateString()]);
        Sanctum::actingAs($me);

        $this->getJson('/api/explorer?age_min=20&age_max=30')->assertStatus(200);
    }

    public function test_distance_filter_does_not_crash_on_sqlite(): void
    {
        $me = User::factory()->create(['latitude' => 6.35, 'longitude' => 2.42]);
        User::factory()->create(['latitude' => 6.36, 'longitude' => 2.43]);
        Sanctum::actingAs($me);

        $this->getJson('/api/explorer?distance=50')->assertStatus(200);
    }
}
