<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_sending_a_message_persists_it_and_returns_it(): void
    {
        $me = User::factory()->create();
        $recipient = User::factory()->create();
        Sanctum::actingAs($me);

        $response = $this->postJson('/api/messages', [
            'to_id' => $recipient->id,
            'content' => 'Salut !',
            'type' => 'text',
        ]);

        $response->assertStatus(200)->assertJsonPath('content', 'Salut !');
        $this->assertDatabaseHas('messages', [
            'from_id' => $me->id,
            'to_id' => $recipient->id,
            'content' => 'Salut !',
        ]);
    }

    public function test_chat_list_shows_latest_message_and_unread_count(): void
    {
        // Regression test: ChatController::list() used to load every message
        // ever exchanged with every match into memory just to find the
        // latest one per conversation. This exercises the rewritten,
        // indexed-per-conversation version end to end.
        $me = User::factory()->create();
        $match = User::factory()->create();

        \App\Models\MatchModel::create(['user_id' => $me->id, 'target_id' => $match->id, 'status' => 'liked', 'is_mutual' => true]);
        \App\Models\MatchModel::create(['user_id' => $match->id, 'target_id' => $me->id, 'status' => 'liked', 'is_mutual' => true]);

        Message::create(['from_id' => $match->id, 'to_id' => $me->id, 'content' => 'Premier message', 'is_read' => true]);
        Message::create(['from_id' => $match->id, 'to_id' => $me->id, 'content' => 'Dernier message', 'is_read' => false]);

        Sanctum::actingAs($me);
        $response = $this->getJson('/api/chat');

        $response->assertStatus(200);
        $conversation = collect($response->json())->firstWhere('id', $match->id);
        $this->assertSame('Dernier message', $conversation['last_message']);
        $this->assertSame(1, $conversation['unread_count']);
    }

    public function test_viewing_a_conversation_marks_received_messages_as_read(): void
    {
        $me = User::factory()->create();
        $other = User::factory()->create();

        Message::create(['from_id' => $other->id, 'to_id' => $me->id, 'content' => 'Hey', 'is_read' => false]);

        Sanctum::actingAs($me);
        $this->getJson("/api/chat/{$other->id}")->assertStatus(200);

        $this->assertDatabaseHas('messages', [
            'from_id' => $other->id,
            'to_id' => $me->id,
            'is_read' => true,
        ]);
    }

    public function test_cannot_send_message_without_authentication(): void
    {
        $recipient = User::factory()->create();

        $this->postJson('/api/messages', [
            'to_id' => $recipient->id,
            'content' => 'Salut !',
        ])->assertStatus(401);
    }
}
