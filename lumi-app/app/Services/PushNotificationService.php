<?php

namespace App\Services;

use App\Models\User;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class PushNotificationService
{
    /**
     * Send a notification to a specific user on all their registered devices.
     */
    public function sendToUser(User $user, string $title, string $body, array $data = [])
    {
        $tokens = $user->fcmTokens()->pluck('token')->toArray();

        if (empty($tokens)) {
            return;
        }

        $messaging = app('firebase.messaging');

        $message = CloudMessage::new()
            ->withNotification(Notification::create($title, $body))
            ->withData(array_merge($data, [
                'click_action' => config('app.url'),
            ]));

        try {
            return $messaging->sendMulticast($message, $tokens);
        } catch (\Exception $e) {
            \Log::error("FCM Error: " . $e->getMessage());
            return null;
        }
    }
}
