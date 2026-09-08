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
            // Null = no preference set, don't filter on it. Not defaulted to
            // fixed numbers so existing/new users aren't suddenly filtered
            // until they explicitly set a preference.
            $table->unsignedTinyInteger('pref_age_min')->nullable();
            $table->unsignedTinyInteger('pref_age_max')->nullable();
            $table->unsignedInteger('pref_max_distance_km')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['pref_age_min', 'pref_age_max', 'pref_max_distance_km']);
        });
    }
};
