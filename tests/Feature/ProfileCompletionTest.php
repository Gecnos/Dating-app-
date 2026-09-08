<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileCompletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_minimal_freshly_onboarded_profile_has_a_low_score(): void
    {
        $user = User::factory()->create([
            'bio' => null, 'job' => null, 'education' => null, 'height' => null,
            'city' => null, 'interests' => ['Musique', 'Cinema', 'Voyage'],
        ]);

        // Only the interests criterion is met -> 14%.
        $this->assertSame(14, $user->profile_completion['percentage']);
        $this->assertContains('bio', $user->profile_completion['missing']);
        $this->assertContains('photos', $user->profile_completion['missing']);
        $this->assertNotContains('interests', $user->profile_completion['missing']);
    }

    public function test_fully_filled_profile_scores_100_percent(): void
    {
        $user = User::factory()->create([
            'bio' => 'Salut, je suis sympa.',
            'job' => 'Développeuse',
            'education' => 'Université d\'Abomey-Calavi',
            'height' => 170,
            'city' => 'Cotonou',
            'interests' => ['Musique', 'Cinema', 'Voyage'],
        ]);
        $user->photos()->create(['url' => '/uploads/a.jpg', 'order' => 0, 'is_primary' => true]);
        $user->photos()->create(['url' => '/uploads/b.jpg', 'order' => 1, 'is_primary' => false]);

        $this->assertSame(100, $user->fresh()->profile_completion['percentage']);
        $this->assertSame([], $user->fresh()->profile_completion['missing']);
    }

    public function test_profile_completion_is_present_in_the_edit_endpoint_response(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/profile/edit')
            ->assertStatus(200)
            ->assertJsonStructure(['user' => ['profile_completion' => ['percentage', 'missing']]]);
    }
}
