<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ActiveSessionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_listing_sessions_only_returns_the_authenticated_users_own_tokens(): void
    {
        $me = User::factory()->create();
        $other = User::factory()->create();
        $other->createToken('auth-token');

        Sanctum::actingAs($me, ['*'], 'sanctum');

        $response = $this->getJson('/api/security/sessions');

        $response->assertStatus(200);
        $ids = collect($response->json('sessions'))->pluck('id');
        $otherTokenIds = $other->tokens()->pluck('id');
        $this->assertEmpty($ids->intersect($otherTokenIds));
    }

    public function test_current_session_is_flagged(): void
    {
        $me = User::factory()->create();
        $token = $me->createToken('auth-token');

        Sanctum::actingAs($me, ['*'], 'sanctum');
        // Sanctum::actingAs doesn't set a real currentAccessToken by default in
        // some setups; explicitly attach one so the "is_current" comparison in
        // the controller has something real to compare against.
        $me->withAccessToken($token->accessToken);

        $response = $this->getJson('/api/security/sessions');

        $response->assertStatus(200);
        $current = collect($response->json('sessions'))->firstWhere('id', $token->accessToken->id);
        $this->assertNotNull($current);
        $this->assertTrue($current['is_current']);
    }

    public function test_user_cannot_revoke_another_users_token(): void
    {
        $me = User::factory()->create();
        $other = User::factory()->create();
        $otherToken = $other->createToken('auth-token');

        Sanctum::actingAs($me, ['*'], 'sanctum');

        $this->deleteJson("/api/security/sessions/{$otherToken->accessToken->id}")
            ->assertStatus(404);

        $this->assertDatabaseHas('personal_access_tokens', ['id' => $otherToken->accessToken->id]);
    }

    public function test_revoking_a_session_deletes_the_token(): void
    {
        $me = User::factory()->create();
        $token = $me->createToken('auth-token');
        $extra = $me->createToken('auth-token');

        Sanctum::actingAs($me, ['*'], 'sanctum');
        $me->withAccessToken($token->accessToken);

        $this->deleteJson("/api/security/sessions/{$extra->accessToken->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $extra->accessToken->id]);
        $this->assertDatabaseHas('personal_access_tokens', ['id' => $token->accessToken->id]);
    }

    public function test_revoking_other_sessions_keeps_only_the_current_one(): void
    {
        $me = User::factory()->create();
        $current = $me->createToken('auth-token');
        $me->createToken('auth-token');
        $me->createToken('auth-token');

        Sanctum::actingAs($me, ['*'], 'sanctum');
        $me->withAccessToken($current->accessToken);

        $this->deleteJson('/api/security/sessions')->assertStatus(200);

        $remaining = $me->fresh()->tokens;
        $this->assertCount(1, $remaining);
        $this->assertSame($current->accessToken->id, $remaining->first()->id);
    }
}
