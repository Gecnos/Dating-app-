<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use App\Models\UserPhoto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminReportsModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_moderation_routes(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $target = User::factory()->create();
        $report = Report::create(['reporter_id' => $user->id, 'reported_id' => $target->id, 'reason' => 'Spam']);
        $photo = UserPhoto::create(['user_id' => $target->id, 'url' => '/uploads/media/x.png', 'order' => 0]);

        Sanctum::actingAs($user);

        $this->postJson("/api/admin/reports/{$report->id}/resolve")->assertStatus(403);
        $this->postJson("/api/admin/users/{$target->id}/ban")->assertStatus(403);
        $this->postJson("/api/admin/users/{$target->id}/unban")->assertStatus(403);
        $this->deleteJson("/api/admin/users/{$target->id}/photos/{$photo->id}")->assertStatus(403);
    }

    public function test_admin_can_resolve_a_report(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $reporter = User::factory()->create();
        $target = User::factory()->create();
        $report = Report::create(['reporter_id' => $reporter->id, 'reported_id' => $target->id, 'reason' => 'Spam']);

        Sanctum::actingAs($admin);
        $this->postJson("/api/admin/reports/{$report->id}/resolve")->assertStatus(200);

        $this->assertSame('reviewed', $report->fresh()->status);
    }

    public function test_admin_can_ban_a_user_and_it_revokes_their_tokens(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $target = User::factory()->create();
        $target->createToken('device-1');
        $target->createToken('device-2');
        $this->assertSame(2, $target->tokens()->count());

        Sanctum::actingAs($admin);
        $this->postJson("/api/admin/users/{$target->id}/ban")->assertStatus(200);

        $fresh = $target->fresh();
        $this->assertTrue((bool) $fresh->is_banned);
        $this->assertNotNull($fresh->banned_at);
        $this->assertSame(0, $fresh->tokens()->count());
    }

    public function test_banned_user_cannot_log_in(): void
    {
        // Ban directly at the model level rather than via the admin
        // endpoint: Sanctum::actingAs swaps in a token-based guard for the
        // rest of the test, and LoginController's Auth::attempt() needs
        // the normal session guard — mixing the two is unrelated breakage
        // for what this test actually verifies (the banned-login check).
        $target = User::factory()->create(['email' => 'banned@example.com', 'password' => bcrypt('password123')]);
        $target->forceFill(['is_banned' => true, 'banned_at' => now()])->save();

        $response = $this->postJson('/api/login', [
            'email' => 'banned@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_unban_a_user(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $target = User::factory()->create();

        Sanctum::actingAs($admin);
        $this->postJson("/api/admin/users/{$target->id}/ban")->assertStatus(200);
        $this->postJson("/api/admin/users/{$target->id}/unban")->assertStatus(200);

        $fresh = $target->fresh();
        $this->assertFalse((bool) $fresh->is_banned);
        $this->assertNull($fresh->banned_at);
    }

    public function test_admin_can_delete_a_users_photo(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $target = User::factory()->create();
        $photo = UserPhoto::create(['user_id' => $target->id, 'url' => '/uploads/media/x.png', 'order' => 0]);

        Sanctum::actingAs($admin);
        $this->deleteJson("/api/admin/users/{$target->id}/photos/{$photo->id}")->assertStatus(200);

        $this->assertDatabaseMissing('user_photos', ['id' => $photo->id]);
    }

    public function test_reports_list_includes_reported_users_photos(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $reporter = User::factory()->create();
        $target = User::factory()->create();
        UserPhoto::create(['user_id' => $target->id, 'url' => '/uploads/media/x.png', 'order' => 0]);
        Report::create(['reporter_id' => $reporter->id, 'reported_id' => $target->id, 'reason' => 'Spam']);

        Sanctum::actingAs($admin);
        $response = $this->getJson('/api/admin/reports');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('reports.0.reported.photos'));
    }
}
