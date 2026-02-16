<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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
                'description' => "Pour ceux qui cherchent l'engagement, la construction d'un foyer et le long terme.",
                'icon' => '❤️',
                'color_badge' => 'bg-yellow-500'
            ],
            [
                'label' => 'Découverte & Sorties',
                'slug' => 'decouverte',
                'description' => "Rencontres amicales, sorties culturelles à Cotonou et networking enrichissant.",
                'icon' => '🧭',
                'color_badge' => 'bg-blue-500'
            ],
            [
                'label' => 'Fun & Sans prise de tête',
                'slug' => 'fun',
                'description' => "Profiter du moment présent, sans pression, pour des rencontres légères.",
                'icon' => '⚡',
                'color_badge' => 'bg-purple-500'
            ],
            [
                'label' => 'Réseautage / Business',
                'slug' => 'business',
                'description' => "Élargissez votre cercle professionnel et trouvez des opportunités.",
                'icon' => '💼',
                'color_badge' => 'bg-indigo-500'
            ]
        ];

        foreach ($intentions as $intent) {
            \App\Models\Intention::create($intent);
        }
    }
}
