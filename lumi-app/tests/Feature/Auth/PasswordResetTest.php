<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_returns_generic_message_for_existing_email(): void
    {
        User::factory()->create(['email' => 'user@example.com']);

        $response = $this->postJson('/api/password/forgot', ['email' => 'user@example.com']);

        $response->assertStatus(200)->assertJsonStructure(['message']);
    }

    public function test_forgot_password_returns_same_generic_message_for_unknown_email(): void
    {
        // Must not leak whether an email is registered.
        $known = $this->postJson('/api/password/forgot', ['email' => 'nobody@example.com']);

        $known->assertStatus(200)->assertJsonStructure(['message']);
    }

    public function test_reset_password_with_valid_token_allows_login_with_new_password(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('old-password'),
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/password/reset', [
            'token' => $token,
            'email' => 'user@example.com',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertStatus(200);

        $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'new-password-123',
        ])->assertStatus(200);
    }

    public function test_reset_password_with_invalid_token_is_rejected(): void
    {
        User::factory()->create(['email' => 'user@example.com']);

        $response = $this->postJson('/api/password/reset', [
            'token' => 'not-a-real-token',
            'email' => 'user@example.com',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertStatus(422);
    }
}
