<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\IntentionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_onboarding_flow_progresses_through_every_step(): void
    {
        // Regression test for a real bug found by manually running the app:
        // DatabaseSeeder never called IntentionSeeder/InterestSeeder, so the
        // intentions table was empty on any fresh install and this exact step
        // crashed with a foreign key violation for every new user.
        $this->seed(IntentionSeeder::class);

        $user = User::factory()->create([
            'gender' => null,
            'date_of_birth' => null,
            'intention_id' => null,
            'interests' => null,
            'avatar' => null,
        ]);
        Sanctum::actingAs($user);

        $this->postJson('/api/onboarding/basic', [
            'name' => 'Test User',
            'date_of_birth' => '1995-05-05',
            'gender' => 'Homme',
        ])->assertStatus(200)->assertJsonPath('next_step', 'intentions');

        $this->postJson('/api/onboarding/intentions', [
            'intention' => 'decouverte',
        ])->assertStatus(200)->assertJsonPath('next_step', 'interests');

        $this->postJson('/api/onboarding/interests', [
            'interests' => ['Musique', 'Cinema', 'Voyage'],
        ])->assertStatus(200)->assertJsonPath('next_step', 'photos');

        $tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        $this->postJson('/api/onboarding/photos', [
            'photos' => [$tinyPng],
        ])->assertStatus(200)->assertJsonPath('next_step', 'discovery');

        $user->refresh();
        $this->assertSame('Homme', $user->gender);
        $this->assertNotNull($user->intention_id);
        $this->assertCount(3, $user->interests);
        $this->assertNotNull($user->avatar);
    }

    public function test_gender_only_accepts_homme_or_femme(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/onboarding/basic', [
            'name' => 'Test User',
            'date_of_birth' => '1995-05-05',
            'gender' => 'Autre',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('gender');
    }

    public function test_interests_step_requires_at_least_three(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/onboarding/interests', [
            'interests' => ['Musique'],
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('interests');
    }
}
