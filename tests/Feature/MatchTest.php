<?php

namespace Tests\Feature;

use App\Models\MatchModel;
use App\Models\User;
use App\Notifications\AppNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_one_way_like_creates_a_persisted_notification_for_the_target(): void
    {
        // Regression test: before this session, a one-way like produced no
        // database notification at all — only a live WebSocket badge bump
        // the recipient would miss if they weren't online at that instant.
        Notification::fake();

        $me = User::factory()->create();
        $target = User::factory()->create();
        Sanctum::actingAs($me);

        $response = $this->postJson('/api/swipe', [
            'target_id' => $target->id,
            'status' => 'liked',
        ]);

        $response->assertStatus(200)->assertJsonPath('is_mutual', false);

        Notification::assertSentTo($target, AppNotification::class, function ($notification) use ($me) {
            $data = $notification->toArray($notification);
            return $data['type'] === 'like' && $data['subject_id'] === $me->id;
        });
    }

    public function test_mutual_like_creates_a_match_and_notifies_both_users(): void
    {
        Notification::fake();

        $userA = User::factory()->create();
        $userB = User::factory()->create();

        Sanctum::actingAs($userB);
        $this->postJson('/api/swipe', ['target_id' => $userA->id, 'status' => 'liked'])
            ->assertJsonPath('is_mutual', false);

        Sanctum::actingAs($userA);
        $response = $this->postJson('/api/swipe', ['target_id' => $userB->id, 'status' => 'liked']);
        $response->assertStatus(200)->assertJsonPath('is_mutual', true);

        $this->assertDatabaseHas('matches', [
            'user_id' => $userA->id,
            'target_id' => $userB->id,
            'is_mutual' => true,
        ]);
        $this->assertDatabaseHas('matches', [
            'user_id' => $userB->id,
            'target_id' => $userA->id,
            'is_mutual' => true,
        ]);

        Notification::assertSentTo($userA, AppNotification::class, fn ($n) => $n->toArray($n)['type'] === 'match');
        Notification::assertSentTo($userB, AppNotification::class, fn ($n) => $n->toArray($n)['type'] === 'match');
    }

    public function test_passing_does_not_create_a_match_or_notification(): void
    {
        Notification::fake();

        $me = User::factory()->create();
        $target = User::factory()->create();
        Sanctum::actingAs($me);

        $this->postJson('/api/swipe', ['target_id' => $target->id, 'status' => 'passed'])
            ->assertJsonPath('is_mutual', false);

        Notification::assertNothingSent();
    }
}
