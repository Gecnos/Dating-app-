<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_signed_link_marks_email_as_verified(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())]
        );

        $response = $this->get($url);

        $response->assertRedirect('/email-verified?status=success');
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_invalid_hash_does_not_verify_email(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1('wrong-email')]
        );

        $response = $this->get($url);

        $response->assertRedirect('/email-verified?status=invalid');
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_unverified_user_can_request_resend(): void
    {
        $user = User::factory()->unverified()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/email/resend');

        $response->assertStatus(200);
    }

    public function test_already_verified_user_resend_is_a_no_op(): void
    {
        $user = User::factory()->create(); // factory default is verified
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/email/resend');

        $response->assertStatus(200)->assertJsonPath('message', 'Email déjà vérifié.');
    }

    public function test_no_route_is_gated_behind_email_verification(): void
    {
        // Explicit regression guard for the "never lock users out" requirement:
        // an unverified user must still reach fully protected endpoints.
        $user = User::factory()->unverified()->create([
            'gender' => 'Homme',
            'date_of_birth' => '1995-01-01',
            'intention_id' => null,
        ]);
        Sanctum::actingAs($user);

        $this->getJson('/api/bootstrap')->assertStatus(200);
    }
}
