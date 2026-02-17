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
            if (!Schema::hasColumn('users', 'job')) {
                $table->string('job')->nullable();
            }
            if (!Schema::hasColumn('users', 'height')) {
                $table->integer('height')->nullable();
            }
            if (!Schema::hasColumn('users', 'password_updated_at')) {
                $table->timestamp('password_updated_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['job', 'height', 'password_updated_at']);
        });
    }
};
