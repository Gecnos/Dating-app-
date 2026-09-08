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
            $table->index('gender');
            $table->index('intention_id');
            $table->index('is_ghost_mode');
            $table->index(['latitude', 'longitude']);
            $table->index('date_of_birth');
        });

        Schema::table('matches', function (Blueprint $table) {
            $table->index(['user_id', 'target_id']);
            $table->index(['target_id', 'user_id']); // For reverse lookup
            $table->index(['is_mutual', 'user_id']); // For fetching matches
            $table->index(['is_mutual', 'target_id']);
            $table->index('status');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->index(['from_id', 'to_id']);
            $table->index(['to_id', 'from_id']);
            $table->index('created_at');
            $table->index('is_read');
        });
        
        Schema::table('blocks', function (Blueprint $table) {
             $table->index('blocker_id');
             $table->index('blocked_id');
        });

        Schema::table('reports', function (Blueprint $table) {
             $table->index('reporter_id');
             $table->index('reported_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['gender']);
            $table->dropIndex(['intention_id']);
            $table->dropIndex(['is_ghost_mode']);
            $table->dropIndex(['latitude', 'longitude']);
            $table->dropIndex(['date_of_birth']);
        });

        Schema::table('matches', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'target_id']);
            $table->dropIndex(['target_id', 'user_id']);
            $table->dropIndex(['is_mutual', 'user_id']);
            $table->dropIndex(['is_mutual', 'target_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['from_id', 'to_id']);
            $table->dropIndex(['to_id', 'from_id']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['is_read']);
        });
        
        Schema::table('blocks', function (Blueprint $table) {
             $table->dropIndex(['blocker_id']);
             $table->dropIndex(['blocked_id']);
        });

        Schema::table('reports', function (Blueprint $table) {
             $table->dropIndex(['reporter_id']);
             $table->dropIndex(['reported_id']);
        });
    }
};
