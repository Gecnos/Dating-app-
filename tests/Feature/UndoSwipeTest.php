<?php

namespace Tests\Feature;

use App\Models\MatchModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UndoSwipeTest extends TestCase
{
    use RefreshDatabase;

    public function test_undoing_a_non_mutual_swipe_deletes_it_and_returns_the_profile(): void
    {
        $me = User::factory()->create();
        $target = User::factory()->create();
        MatchModel::create(['user_id' => $me->id, 'target_id' => $target->id, 'status' => 'passed']);

        Sanctum::actingAs($me);
        $response = $this->postJson('/api/swipe/undo');

        $response->assertStatus(200)->assertJsonPath('profile.id', $target->id);
        $this->assertDatabaseMissing('matches', ['user_id' => $me->id, 'target_id' => $target->id]);
    }

    public function test_undoing_a_mutual_match_is_rejected_and_leaves_it_intact(): void
    {
        $me = User::factory()->create();
        $target = User::factory()->create();
        MatchModel::create(['user_id' => $me->id, 'target_id' => $target->id, 'status' => 'liked', 'is_mutual' => true]);

        Sanctum::actingAs($me);
        $response = $this->postJson('/api/swipe/undo');

        $response->assertStatus(422);
        $this->assertDatabaseHas('matches', ['user_id' => $me->id, 'target_id' => $target->id, 'is_mutual' => true]);
    }

    public function test_undoing_with_no_prior_swipes_returns_404(): void
    {
        $me = User::factory()->create();
        Sanctum::actingAs($me);

        $this->postJson('/api/swipe/undo')->assertStatus(404);
    }
}
