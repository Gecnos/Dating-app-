<?php

namespace Tests\Feature;

use App\Models\Block;
use App\Models\Intention;
use App\Models\MatchModel;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DiscoveryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // The array cache driver persists for the whole PHPUnit process, but
        // RefreshDatabase resets auto-increment ids back to 1 every test —
        // without flushing, a stale "discovery_user_1" entry from an earlier
        // test would silently leak into this one.
        Cache::flush();
    }

    private function actingAsMale(): User
    {
        $me = User::factory()->create(['gender' => 'Homme']);
        Sanctum::actingAs($me);

        return $me;
    }

    public function test_discovery_only_shows_opposite_gender(): void
    {
        $me = $this->actingAsMale();
        $woman = User::factory()->create(['gender' => 'Femme', 'is_ghost_mode' => false]);
        $man = User::factory()->create(['gender' => 'Homme', 'is_ghost_mode' => false]);

        $response = $this->getJson('/api/discovery');

        $ids = collect($response->json('initialProfiles'))->pluck('id');
        $this->assertTrue($ids->contains($woman->id));
        $this->assertFalse($ids->contains($man->id));
    }

    public function test_discovery_excludes_ghost_mode_users(): void
    {
        $this->actingAsMale();
        $ghost = User::factory()->create(['gender' => 'Femme', 'is_ghost_mode' => true]);

        $response = $this->getJson('/api/discovery');

        $ids = collect($response->json('initialProfiles'))->pluck('id');
        $this->assertFalse($ids->contains($ghost->id));
    }

    public function test_discovery_excludes_already_swiped_users(): void
    {
        $me = $this->actingAsMale();
        $target = User::factory()->create(['gender' => 'Femme']);
        MatchModel::create(['user_id' => $me->id, 'target_id' => $target->id, 'status' => 'passed']);

        $response = $this->getJson('/api/discovery');

        $ids = collect($response->json('initialProfiles'))->pluck('id');
        $this->assertFalse($ids->contains($target->id));
    }

    public function test_discovery_excludes_blocked_users_both_directions(): void
    {
        $me = $this->actingAsMale();
        $blockedByMe = User::factory()->create(['gender' => 'Femme']);
        $blockedMe = User::factory()->create(['gender' => 'Femme']);
        Block::create(['blocker_id' => $me->id, 'blocked_id' => $blockedByMe->id]);
        Block::create(['blocker_id' => $blockedMe->id, 'blocked_id' => $me->id]);

        $response = $this->getJson('/api/discovery');

        $ids = collect($response->json('initialProfiles'))->pluck('id');
        $this->assertFalse($ids->contains($blockedByMe->id));
        $this->assertFalse($ids->contains($blockedMe->id));
    }

    public function test_discovery_excludes_reported_users(): void
    {
        $me = $this->actingAsMale();
        $reported = User::factory()->create(['gender' => 'Femme']);
        Report::create([
            'reporter_id' => $me->id,
            'reported_id' => $reported->id,
            'reason' => 'Spam',
        ]);

        $response = $this->getJson('/api/discovery');

        $ids = collect($response->json('initialProfiles'))->pluck('id');
        $this->assertFalse($ids->contains($reported->id));
    }

    public function test_discovery_ranks_matching_intention_above_no_intention_match(): void
    {
        $intentionA = Intention::create(['label' => 'A', 'slug' => 'a', 'color_badge' => 'blue']);
        $intentionB = Intention::create(['label' => 'B', 'slug' => 'b', 'color_badge' => 'green']);

        $me = User::factory()->create(['gender' => 'Homme', 'intention_id' => $intentionA->id]);
        Sanctum::actingAs($me);

        $matching = User::factory()->create(['gender' => 'Femme', 'intention_id' => $intentionA->id]);
        $nonMatching = User::factory()->create(['gender' => 'Femme', 'intention_id' => $intentionB->id]);

        $response = $this->getJson('/api/discovery');
        $profiles = collect($response->json('initialProfiles'))->keyBy('id');

        $this->assertGreaterThan(
            $profiles[$nonMatching->id]['matching_score'],
            $profiles[$matching->id]['matching_score']
        );
    }

    public function test_discovery_caps_shared_interest_score_contribution(): void
    {
        $me = User::factory()->create([
            'gender' => 'Homme',
            'interests' => ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        ]);
        Sanctum::actingAs($me);

        // 7 shared interests should score the same as 5, since the
        // contribution is capped at 5 * 20 = 100 points.
        $sevenShared = User::factory()->create([
            'gender' => 'Femme',
            'interests' => ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        ]);
        $fiveShared = User::factory()->create([
            'gender' => 'Femme',
            'interests' => ['a', 'b', 'c', 'd', 'e'],
        ]);

        $response = $this->getJson('/api/discovery');
        $profiles = collect($response->json('initialProfiles'))->keyBy('id');

        $this->assertEquals(
            $profiles[$fiveShared->id]['matching_score'],
            $profiles[$sevenShared->id]['matching_score']
        );
    }
}
