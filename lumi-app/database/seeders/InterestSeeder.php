<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Interest;

class InterestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $interests = [
            ['label' => '🏃‍♂️ Sport', 'slug' => 'sport'],
            ['label' => '🎨 Art', 'slug' => 'art'],
            ['label' => '🍕 Cuisine', 'slug' => 'cuisine'],
            ['label' => '✈️ Voyage', 'slug' => 'voyage'],
            ['label' => '🎸 Musique', 'slug' => 'musique'],
            ['label' => '🎮 Gaming', 'slug' => 'gaming'],
            ['label' => '🎬 Cinéma', 'slug' => 'cinema'],
            ['label' => '📚 Lecture', 'slug' => 'lecture'],
            ['label' => '💼 Entrepreneur', 'id' => 'entrepreneur'], // Changed to slug below
            ['label' => '💃 Danse', 'slug' => 'danse'],
            ['label' => '🍸 Nightlife', 'slug' => 'nightlife'],
            ['label' => '🐶 Animaux', 'slug' => 'animaux'],
            ['label' => '📸 Photo', 'slug' => 'photo'],
            ['label' => '🧘 Bien-être', 'slug' => 'bien-etre'],
            ['label' => '🍷 Vin / Cocktails', 'slug' => 'vin'],
        ];

        // Correction for the entrepreneur slug
        foreach ($interests as $item) {
            $slug = $item['slug'] ?? 'entrepreneur';
            Interest::updateOrCreate(
                ['slug' => $slug],
                ['label' => $item['label'], 'is_approved' => true]
            );
        }
    }
}
