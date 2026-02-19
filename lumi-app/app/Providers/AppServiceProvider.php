<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL; // Import indispensable !

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // On vérifie si l'URL dans le .env contient 'ngrok'
        if (str_contains(config('app.url'), 'ngrok-free.app')) {
            URL::forceScheme('https');
        }
    }
}