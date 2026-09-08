<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SearchPreferencesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // See DiscoveryTest: the array cache driver persists across tests in
        // the same PHPUnit process, so a stale "discovery_user_1" entry from
        // an earlier test could leak into this one.
        Cache::flush();
    }

    private function actingAsMale(array $attributes = []): User
    {
        $me = User::factory()->create(array_merge(['gender' => 'Homme'], $attributes));
        Sanctum::actingAs($me);

        return $me;
    }

    public function test_saving_preferences_persists_them(): void
    {
        $this->actingAsMale();

        $response = $this->postJson('/api/preferences/search', [
            'pref_age_min' => 25,
            'pref_age_max' => 35,
            'pref_max_distance_km' => 20,
        ]);

        $response->assertStatus(200)->assertJsonPath('preferences.pref_age_min', 25)
            ->assertJsonPath('preferences.pref_age_max', 35)
            ->assertJsonPath('preferences.pref_max_distance_km', 20);

        $this->assertDatabaseHas('users', [
            'pref_age_min' => 25,
            'pref_age_max' => 35,
            'pref_max_distance_km' => 20,
        ]);
    }

    public function test_age_min_cannot_exceed_age_max(): void
    {
        $this->actingAsMale();

        $response = $this->postJson('/api/preferences/search', [
            'pref_age_min' => 40,
            'pref_age_max' => 25,
        ]);

        $response->assertStatus(422);
    }

    public function test_age_below_eighteen_is_rejected(): void
    {
        $this->actingAsMale();

        $response = $this->postJson('/api/preferences/search', [
            'pref_age_min' => 15,
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('pref_age_min');
    }

    public function test_preferences_can_be_cleared(): void
    {
        $me = $this->actingAsMale(['pref_age_min' => 25, 'pref_age_max' => 35]);

        $response = $this->postJson('/api/preferences/search', [
            'pref_age_min' => null,
            'pref_age_max' => null,
        ]);

        $response->assertStatus(200);
        $this->assertNull($me->fresh()->pref_age_min);
        $this->assertNull($me->fresh()->pref_age_max);
    }

    public function test_discovery_excludes_candidates_outside_age_preference(): void
    {
        $me = $this->actingAsMale(['pref_age_min' => 25, 'pref_age_max' => 35]);

        $inRange = User::factory()->create([
            'gender' => 'Femme',
            'date_of_birth' => now()->subYears(30)->toDateString(),
        ]);
        $tooYoung = User::factory()->create([
            'gender' => 'Femme',
            'date_of_birth' => now()->subYears(20)->toDateString(),
        ]);
        $tooOld = User::factory()->create([
            'gender' => 'Femme',
            'date_of_birth' => now()->subYears(45)->toDateString(),
        ]);

        $response = $this->getJson('/api/discovery');
        $ids = collect($response->json('initialProfiles'))->pluck('id');

        $this->assertTrue($ids->contains($inRange->id));
        $this->assertFalse($ids->contains($tooYoung->id));
        $this->assertFalse($ids->contains($tooOld->id));
    }

    public function test_discovery_excludes_candidates_outside_distance_preference(): void
    {
        $me = $this->actingAsMale([
            'pref_max_distance_km' => 50,
            'latitude' => 6.35,
            'longitude' => 2.42, // Cotonou
        ]);

        $nearby = User::factory()->create([
            'gender' => 'Femme',
            'latitude' => 6.36,
            'longitude' => 2.43,
        ]);
        $farAway = User::factory()->create([
            'gender' => 'Femme',
            'latitude' => 12.36, // Niamey-ish, hundreds of km away
            'longitude' => 1.43,
        ]);

        $response = $this->getJson('/api/discovery');
        $ids = collect($response->json('initialProfiles'))->pluck('id');

        $this->assertTrue($ids->contains($nearby->id));
        $this->assertFalse($ids->contains($farAway->id));
    }

    public function test_discovery_is_unfiltered_when_no_preference_is_set(): void
    {
        $this->actingAsMale();

        $anyAge = User::factory()->create([
            'gender' => 'Femme',
            'date_of_birth' => now()->subYears(60)->toDateString(),
        ]);

        $response = $this->getJson('/api/discovery');
        $ids = collect($response->json('initialProfiles'))->pluck('id');

        $this->assertTrue($ids->contains($anyAge->id));
    }
}
