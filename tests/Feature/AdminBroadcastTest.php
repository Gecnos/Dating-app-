<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\AppNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminBroadcastTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_broadcast(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        Sanctum::actingAs($user);

        $this->postJson('/api/admin/broadcast', [
            'title' => 'Alerte',
            'content' => 'Contenu du message',
        ])->assertStatus(403);
    }

    public function test_admin_broadcast_notifies_every_user(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['is_admin' => true]);
        $others = User::factory()->count(5)->create();

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/broadcast', [
            'title' => 'Maintenance ce soir',
            'content' => 'Le service sera indisponible entre 22h et 23h.',
        ]);

        $response->assertStatus(200)->assertJsonPath('notified_count', 6); // admin + 5 others

        foreach ($others->push($admin) as $user) {
            Notification::assertSentTo($user, AppNotification::class, function ($notification) {
                $data = $notification->toArray($notification);
                return $data['type'] === 'announcement'
                    && $data['title'] === 'Maintenance ce soir';
            });
        }
    }

    public function test_broadcast_requires_title_and_content(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/broadcast', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'content']);
    }
}
