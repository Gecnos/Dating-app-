<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Intention;

class IntentionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $intentions = [
            [
                'label' => 'Relation Sérieuse',
                'slug' => 'mariage',
                'color_badge' => 'yellow',
                'icon' => 'favorite',
                'description' => "Pour ceux qui cherchent l'engagement, la construction d'un foyer et le long terme.",
            ],
            [
                'label' => 'Découverte & Sorties',
                'slug' => 'decouverte',
                'color_badge' => 'blue',
                'icon' => 'explore',
                'description' => "Rencontres amicales, sorties culturelles à Cotonou et networking enrichissant.",
            ],
            [
                'label' => 'Fun & Sans prise de tête',
                'slug' => 'fun',
                'color_badge' => 'purple',
                'icon' => 'bolt',
                'description' => "Profiter du moment présent, sans pression, pour des rencontres légères.",
            ],
            [
                'label' => 'Réseautage / Business',
                'slug' => 'business',
                'color_badge' => 'indigo',
                'icon' => 'work',
                'description' => "Élargissez votre cercle professionnel et trouvez des opportunités.",
            ],
        ];

        foreach ($intentions as $intention) {
            Intention::updateOrCreate(['slug' => $intention['slug']], $intention);
        }
    }
}
