<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestFcm extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-fcm {user_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test FCM notification to a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');
        $user = \App\Models\User::find($userId);

        if (!$user) {
            $this->error("User not found.");
            return;
        }

        $tokens = $user->fcmTokens()->pluck('token')->toArray();

        if (empty($tokens)) {
            $this->error("User has no FCM tokens registered.");
            return;
        }

        $messaging = app('firebase.messaging');

        $message = \Kreait\Firebase\Messaging\CloudMessage::new()
            ->withNotification(\Kreait\Firebase\Messaging\Notification::create('Lumi Test', 'Ceci est une notification de test !'))
            ->withData(['test' => 'true']);

        $report = $messaging->sendMulticast($message, $tokens);

        $this->info("Sent " . $report->successes()->count() . " successful notifications.");
        $this->error("Failed to send " . $report->failures()->count() . " notifications.");

        foreach ($report->failures()->getItems() as $failure) {
            $this->error($failure->error()->getMessage());
        }
    }
}
