<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL; // Import indispensable !
use Illuminate\Auth\Notifications\ResetPassword;

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

        // Le lien de réinitialisation doit pointer vers la page SPA React
        // (resources/js/Pages/Auth/ResetPassword.jsx), pas une vue Blade.
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            return config('app.url') . '/reset-password?token=' . $token
                . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}