<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // These gate the FCM push send only — the in-app notification
            // (bell icon / notification list) is always created regardless,
            // so a user's history stays complete even with push muted.
            $table->boolean('notify_push_messages')->default(true);
            $table->boolean('notify_push_matches')->default(true);
            $table->boolean('notify_push_likes')->default(true);
            $table->boolean('notify_push_announcements')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'notify_push_messages',
                'notify_push_matches',
                'notify_push_likes',
                'notify_push_announcements',
            ]);
        });
    }
};
