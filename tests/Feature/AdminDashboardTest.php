<?php

namespace Tests\Feature;

use App\Models\MatchModel;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_stats(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        Sanctum::actingAs($user);

        $this->getJson('/api/admin/stats')->assertStatus(403);
    }

    public function test_admin_gets_dashboard_stats_with_expected_keys(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200)->assertJsonStructure(['stats' => [
            'total_users',
            'verified_users',
            'pending_verifications',
            'total_matches',
            'messages_last_24h',
            'new_users_this_week',
        ]]);
    }

    public function test_stats_counts_are_correct(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        // Mutual match: one row per direction, should count as 1 pair.
        MatchModel::create(['user_id' => $userA->id, 'target_id' => $userB->id, 'status' => 'liked', 'is_mutual' => true]);
        MatchModel::create(['user_id' => $userB->id, 'target_id' => $userA->id, 'status' => 'liked', 'is_mutual' => true]);

        Message::create(['from_id' => $userA->id, 'to_id' => $userB->id, 'content' => 'Salut']);

        Sanctum::actingAs($admin);
        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJsonPath('stats.total_matches', 1)
            ->assertJsonPath('stats.messages_last_24h', 1);
    }
}
