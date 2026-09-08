<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\PushNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationPreferencesTest extends TestCase
{
    use RefreshDatabase;

    public function test_saving_preferences_persists_them(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/preferences/notifications', [
            'notify_push_likes' => false,
        ]);

        $response->assertStatus(200)->assertJsonPath('notify_push_likes', false);
        $this->assertFalse($user->fresh()->notify_push_likes);
        // Untouched preferences keep their default.
        $this->assertTrue($user->fresh()->notify_push_messages);
    }

    public function test_message_push_is_skipped_when_recipient_disabled_it(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create(['notify_push_messages' => false]);
        Sanctum::actingAs($sender);

        $this->mock(PushNotificationService::class)
            ->shouldNotReceive('sendToUser');

        $this->postJson('/api/messages', [
            'to_id' => $recipient->id,
            'content' => 'Salut',
            'type' => 'text',
        ])->assertStatus(200);
    }

    public function test_message_push_is_sent_when_preference_enabled(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create(['notify_push_messages' => true]);
        Sanctum::actingAs($sender);

        $this->mock(PushNotificationService::class)
            ->shouldReceive('sendToUser')
            ->once();

        $this->postJson('/api/messages', [
            'to_id' => $recipient->id,
            'content' => 'Salut',
            'type' => 'text',
        ])->assertStatus(200);
    }

    public function test_like_push_is_skipped_when_recipient_disabled_it(): void
    {
        $me = User::factory()->create();
        $target = User::factory()->create(['notify_push_likes' => false]);
        Sanctum::actingAs($me);

        $this->mock(PushNotificationService::class)
            ->shouldNotReceive('sendToUser');

        $this->postJson('/api/swipe', [
            'target_id' => $target->id,
            'status' => 'liked',
        ])->assertStatus(200);
    }
}
