<?php

namespace Tests\Feature;

use App\Events\MessageReacted;
use App\Events\UserTyping;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChatEnhancementsTest extends TestCase
{
    use RefreshDatabase;

    public function test_typing_broadcasts_to_the_recipient(): void
    {
        Event::fake([UserTyping::class]);

        $me = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($me);

        $this->postJson('/api/typing', ['to_id' => $other->id])->assertStatus(200);

        Event::assertDispatched(UserTyping::class, function ($event) use ($me, $other) {
            return $event->fromId === $me->id && $event->toId === $other->id;
        });
    }

    public function test_reacting_to_a_message_sets_the_emoji_and_broadcasts(): void
    {
        Event::fake([MessageReacted::class]);

        $me = User::factory()->create();
        $other = User::factory()->create();
        $message = Message::create(['from_id' => $other->id, 'to_id' => $me->id, 'content' => 'Salut']);

        Sanctum::actingAs($me);
        $response = $this->postJson("/api/messages/{$message->id}/react", ['emoji' => '❤️']);

        $response->assertStatus(200);
        $this->assertSame('❤️', $message->fresh()->reactions[(string) $me->id]);
        Event::assertDispatched(MessageReacted::class);
    }

    public function test_reacting_with_the_same_emoji_twice_removes_it(): void
    {
        $me = User::factory()->create();
        $other = User::factory()->create();
        $message = Message::create(['from_id' => $other->id, 'to_id' => $me->id, 'content' => 'Salut']);

        Sanctum::actingAs($me);
        $this->postJson("/api/messages/{$message->id}/react", ['emoji' => '❤️']);
        $this->postJson("/api/messages/{$message->id}/react", ['emoji' => '❤️']);

        $this->assertArrayNotHasKey((string) $me->id, $message->fresh()->reactions ?? []);
    }

    public function test_cannot_react_to_a_message_from_an_unrelated_conversation(): void
    {
        $me = User::factory()->create();
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $message = Message::create(['from_id' => $userA->id, 'to_id' => $userB->id, 'content' => 'Prive']);

        Sanctum::actingAs($me);
        $this->postJson("/api/messages/{$message->id}/react", ['emoji' => '❤️'])
            ->assertStatus(404);
    }
}
