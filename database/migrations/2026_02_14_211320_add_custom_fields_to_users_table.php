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
            $table->text('bio')->nullable();
            $table->foreignId('intention_id')->nullable()->constrained('intentions');
            $table->string('gender')->nullable(); // M, F, O
            $table->date('date_of_birth')->nullable();
            $table->integer('credits')->default(0);
            $table->boolean('blur_enabled')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->json('interests')->nullable();
            
            // Fallback for location (PostGIS replacement)
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
