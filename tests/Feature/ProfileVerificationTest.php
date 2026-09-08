<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        Sanctum::actingAs($user);

        $this->getJson('/api/admin/verify')->assertStatus(403);
        $this->getJson('/api/admin/reports')->assertStatus(403);
        $this->getJson('/api/admin/stats')->assertStatus(403);
    }

    public function test_admin_can_list_pending_verifications(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        User::factory()->create(['verification_selfie' => 'selfie.jpg', 'is_verified' => false]);
        User::factory()->create(['verification_selfie' => null]); // not submitted, shouldn't show
        User::factory()->create(['verification_selfie' => 'other.jpg', 'is_verified' => true]); // already verified, shouldn't show

        Sanctum::actingAs($admin);
        $response = $this->getJson('/api/admin/verify');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('users'));
    }

    public function test_admin_can_approve_a_verification(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $pending = User::factory()->create(['verification_selfie' => 'selfie.jpg', 'is_verified' => false]);

        Sanctum::actingAs($admin);
        $this->postJson("/api/admin/verify/{$pending->id}/approve")->assertStatus(200);

        $this->assertEquals(true, $pending->fresh()->is_verified);
    }

    public function test_admin_can_reject_a_verification(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $pending = User::factory()->create(['verification_selfie' => 'selfie.jpg', 'is_verified' => false]);

        Sanctum::actingAs($admin);
        $this->postJson("/api/admin/verify/{$pending->id}/reject")->assertStatus(200);

        $fresh = $pending->fresh();
        $this->assertNull($fresh->verification_selfie);
        $this->assertEquals(false, $fresh->is_verified);
    }

    public function test_user_can_submit_a_verification_selfie(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create(['verification_selfie' => null]);
        $tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

        Sanctum::actingAs($user);
        $response = $this->postJson('/api/verification/selfie', ['selfie' => $tinyPng]);
        $response->assertStatus(200);

        $this->assertNotNull($user->fresh()->verification_selfie);
        $this->assertEquals(false, $user->fresh()->is_verified);

        Sanctum::actingAs($admin);
        $this->assertCount(1, $this->getJson('/api/admin/verify')->json('users'));
    }

    public function test_urgent_report_reason_sets_priority(): void
    {
        $reporter = User::factory()->create();
        $reported = User::factory()->create();
        Sanctum::actingAs($reporter);

        $this->postJson('/api/reports', [
            'reported_id' => $reported->id,
            'reason' => 'Urgence / Danger immédiat',
        ])->assertStatus(201);

        $this->assertSame('urgent', Report::first()->priority);
    }

    public function test_normal_report_reason_keeps_default_priority(): void
    {
        $reporter = User::factory()->create();
        $reported = User::factory()->create();
        Sanctum::actingAs($reporter);

        $this->postJson('/api/reports', [
            'reported_id' => $reported->id,
            'reason' => 'Spam',
        ])->assertStatus(201);

        $this->assertSame('normal', Report::first()->priority);
    }

    public function test_admin_reports_list_shows_urgent_first(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $reporter = User::factory()->create();
        $reported = User::factory()->create();

        Report::create(['reporter_id' => $reporter->id, 'reported_id' => $reported->id, 'reason' => 'Spam', 'priority' => 'normal']);
        Report::create(['reporter_id' => $reporter->id, 'reported_id' => $reported->id, 'reason' => 'Urgence / Danger immédiat', 'priority' => 'urgent']);

        Sanctum::actingAs($admin);
        $response = $this->getJson('/api/admin/reports');

        $response->assertStatus(200);
        $this->assertSame('urgent', $response->json('reports.0.priority'));
    }
}
