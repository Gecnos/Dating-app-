<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user', 'token', 'message', 'onboarding_step'])
            ->assertJsonPath('onboarding_step', 'basic')
            ->assertJsonPath('user.email', 'newuser@example.com');

        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
    }

    public function test_register_sends_email_verification_notification(): void
    {
        Notification::fake();

        $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(201);

        $user = User::where('email', 'newuser@example.com')->firstOrFail();
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_register_rejects_password_confirmation_mismatch(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'somethingelse',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('password');
    }
}
