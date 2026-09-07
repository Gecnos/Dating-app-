<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_with_correct_credentials_returns_token(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token', 'onboarding_step']);
    }

    public function test_login_with_wrong_password_is_rejected_with_generic_message(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_login_with_unknown_email_is_rejected(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nobody@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_login_reports_onboarding_step_for_incomplete_profile(): void
    {
        User::factory()->create([
            'email' => 'incomplete@example.com',
            'password' => Hash::make('password123'),
            'gender' => null,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'incomplete@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)->assertJsonPath('onboarding_step', 'basic');
    }
}
