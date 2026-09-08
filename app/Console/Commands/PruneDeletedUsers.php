<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Carbon\Carbon;

class PruneDeletedUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:prune-deleted';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Supprime définitivement les utilisateurs supprimés il y a plus de 90 jours.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $cutoffDate = Carbon::now()->subDays(90);

        $count = User::onlyTrashed()
            ->where('deleted_at', '<=', $cutoffDate)
            ->count();

        if ($count > 0) {
            $this->info("Suppression de {$count} utilisateurs...");
            
            User::onlyTrashed()
                ->where('deleted_at', '<=', $cutoffDate)
                ->forceDelete();

            $this->info('Terminé.');
        } else {
            $this->info('Aucun utilisateur à supprimer.');
        }
    }
}
