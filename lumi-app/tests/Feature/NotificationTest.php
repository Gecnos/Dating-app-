<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\AppNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_mark_as_read_with_type_and_from_id_only_affects_matching_notifications(): void
    {
        // Regression test: markAsRead() used to ignore its filters entirely
        // and mark every notification as read regardless of which
        // conversation the client said it was viewing.
        $me = User::factory()->create();
        $sender = User::factory()->create();

        $me->notify(new AppNotification('message', 'Nouveau Message', 'Salut', '/chat/' . $sender->id, 'chat_bubble', '#000', $sender->id));
        $me->notify(new AppNotification('match', 'Nouveau Match', 'Match !', '/match/success/1', 'favorite', '#000'));

        Sanctum::actingAs($me);
        $this->postJson('/api/notifications/read', [
            'type' => 'message',
            'from_id' => $sender->id,
        ])->assertStatus(200);

        $me->refresh();
        $byType = $me->notifications->groupBy(fn ($n) => $n->data['type']);
        $this->assertNotNull($byType['message']->first()->read_at);
        $this->assertNull($byType['match']->first()->read_at);
    }

    public function test_mark_as_read_without_filters_marks_everything(): void
    {
        $me = User::factory()->create();

        $me->notify(new AppNotification('message', 'Nouveau Message', 'Salut', '/chat/1', 'chat_bubble', '#000', 1));
        $me->notify(new AppNotification('match', 'Nouveau Match', 'Match !', '/match/success/1', 'favorite', '#000'));

        Sanctum::actingAs($me);
        $this->postJson('/api/notifications/read')->assertStatus(200);

        $this->assertSame(0, $me->fresh()->unreadNotifications()->count());
    }

    public function test_verification_notification_links_to_profile(): void
    {
        $user = User::factory()->create(['verification_selfie' => 'selfie.jpg', 'is_verified' => false]);
        // AdminController has no registered route at all (no admin/role
        // concept exists yet in this app — separate gap, out of scope here).
        // Call the method directly to cover the notification-url fix made
        // this session (it used to pass '' instead of '/profile').
        (new \App\Http\Controllers\AdminController())->verify(
            new \Illuminate\Http\Request(['action' => 'approve']),
            $user->id
        );

        $notification = $user->fresh()->notifications->first();
        $this->assertSame('/profile', $notification->data['url']);
    }
}
