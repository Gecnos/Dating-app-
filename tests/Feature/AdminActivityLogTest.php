<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use App\Models\UserPhoto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminActivityLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_view_the_activity_log(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        Sanctum::actingAs($user);

        $this->getJson('/api/admin/activity-log')->assertStatus(403);
    }

    public function test_verify_approve_and_reject_are_logged(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $approved = User::factory()->create(['verification_selfie' => 'a.jpg', 'is_verified' => false]);
        $rejected = User::factory()->create(['verification_selfie' => 'b.jpg', 'is_verified' => false]);
        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/verify/{$approved->id}/approve")->assertStatus(200);
        $this->postJson("/api/admin/verify/{$rejected->id}/reject")->assertStatus(200);

        $this->assertDatabaseHas('admin_activity_logs', [
            'admin_id' => $admin->id, 'action' => 'verify.approve', 'target_type' => 'user', 'target_id' => $approved->id,
        ]);
        $this->assertDatabaseHas('admin_activity_logs', [
            'admin_id' => $admin->id, 'action' => 'verify.reject', 'target_type' => 'user', 'target_id' => $rejected->id,
        ]);
    }

    public function test_resolve_report_is_logged(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $reporter = User::factory()->create();
        $target = User::factory()->create();
        $report = Report::create(['reporter_id' => $reporter->id, 'reported_id' => $target->id, 'reason' => 'Spam']);
        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/reports/{$report->id}/resolve")->assertStatus(200);

        $this->assertDatabaseHas('admin_activity_logs', [
            'admin_id' => $admin->id, 'action' => 'report.resolve', 'target_type' => 'report', 'target_id' => $report->id,
        ]);
    }

    public function test_ban_and_unban_are_logged(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $target = User::factory()->create();
        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/users/{$target->id}/ban")->assertStatus(200);
        $this->postJson("/api/admin/users/{$target->id}/unban")->assertStatus(200);

        $this->assertDatabaseHas('admin_activity_logs', [
            'admin_id' => $admin->id, 'action' => 'user.ban', 'target_type' => 'user', 'target_id' => $target->id,
        ]);
        $this->assertDatabaseHas('admin_activity_logs', [
            'admin_id' => $admin->id, 'action' => 'user.unban', 'target_type' => 'user', 'target_id' => $target->id,
        ]);
    }

    public function test_photo_delete_is_logged_with_details(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $target = User::factory()->create();
        $photo = UserPhoto::create(['user_id' => $target->id, 'url' => '/uploads/media/x.png', 'order' => 0]);
        Sanctum::actingAs($admin);

        $this->deleteJson("/api/admin/users/{$target->id}/photos/{$photo->id}")->assertStatus(200);

        $log = \App\Models\AdminActivityLog::where('action', 'photo.delete')->first();
        $this->assertNotNull($log);
        $this->assertSame($target->id, $log->target_id);
        $this->assertSame($photo->id, $log->details['photo_id']);
    }

    public function test_broadcast_is_logged_with_details(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        User::factory()->count(2)->create();
        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/broadcast', [
            'title' => 'Alerte sécurité',
            'content' => 'Contenu du message',
        ])->assertStatus(200);

        $log = \App\Models\AdminActivityLog::where('action', 'broadcast.send')->first();
        $this->assertNotNull($log);
        $this->assertNull($log->target_type);
        $this->assertSame('Alerte sécurité', $log->details['title']);
        $this->assertSame(3, $log->details['notified_count']); // admin + 2 others
    }

    public function test_activity_log_lists_newest_first_with_admin_loaded(): void
    {
        $admin = User::factory()->create(['is_admin' => true, 'name' => 'Admin Test']);
        $target = User::factory()->create();
        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/users/{$target->id}/ban");
        $this->postJson("/api/admin/users/{$target->id}/unban");

        $response = $this->getJson('/api/admin/activity-log');

        $response->assertStatus(200);
        $entries = $response->json('data');
        $this->assertCount(2, $entries);
        $this->assertSame('user.unban', $entries[0]['action']); // most recent first
        $this->assertSame('Admin Test', $entries[0]['admin']['name']);
    }
}
