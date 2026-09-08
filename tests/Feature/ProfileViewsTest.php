<?php

namespace Tests\Feature;

use App\Models\ProfileView;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileViewsTest extends TestCase
{
    use RefreshDatabase;

    public function test_viewing_another_users_profile_records_a_view(): void
    {
        $me = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($me);

        $this->getJson("/api/user/{$other->id}")->assertStatus(200);

        $this->assertDatabaseHas('profile_views', [
            'viewer_id' => $me->id,
            'viewed_id' => $other->id,
        ]);
    }

    public function test_viewing_own_profile_does_not_record_a_view(): void
    {
        $me = User::factory()->create();
        Sanctum::actingAs($me);

        $this->getJson("/api/user/{$me->id}")->assertStatus(200);
        $this->getJson("/api/user/me")->assertStatus(200);

        $this->assertDatabaseCount('profile_views', 0);
    }

    public function test_ghost_mode_viewer_does_not_get_recorded(): void
    {
        $me = User::factory()->create(['is_ghost_mode' => true]);
        $other = User::factory()->create();
        Sanctum::actingAs($me);

        $this->getJson("/api/user/{$other->id}")->assertStatus(200);

        $this->assertDatabaseCount('profile_views', 0);
    }

    public function test_repeat_views_update_timestamp_instead_of_duplicating(): void
    {
        $me = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($me);

        $this->getJson("/api/user/{$other->id}")->assertStatus(200);
        $this->getJson("/api/user/{$other->id}")->assertStatus(200);
        $this->getJson("/api/user/{$other->id}")->assertStatus(200);

        $this->assertDatabaseCount('profile_views', 1);
    }

    public function test_profile_views_endpoint_returns_viewers_newest_first(): void
    {
        $me = User::factory()->create();
        $viewerA = User::factory()->create(['name' => 'Ancienne Vue']);
        $viewerB = User::factory()->create(['name' => 'Vue Recente']);

        ProfileView::create(['viewer_id' => $viewerA->id, 'viewed_id' => $me->id, 'viewed_at' => now()->subHour()]);
        ProfileView::create(['viewer_id' => $viewerB->id, 'viewed_id' => $me->id, 'viewed_at' => now()]);

        Sanctum::actingAs($me);
        $response = $this->getJson('/api/profile/views');

        $response->assertStatus(200);
        $names = collect($response->json('views'))->pluck('user.name');
        $this->assertSame(['Vue Recente', 'Ancienne Vue'], $names->toArray());
    }
}
