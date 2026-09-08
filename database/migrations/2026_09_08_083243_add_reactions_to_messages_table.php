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
        Schema::table('messages', function (Blueprint $table) {
            // Maps user_id (string key, since JSON object keys are strings)
            // to the single emoji that user reacted with, e.g. {"1": "❤️"}.
            // Only two participants per message, so one reaction per user
            // per message is enough — no need for a separate table.
            $table->json('reactions')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('reactions');
        });
    }
};
