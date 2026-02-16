<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Exception;

class GoogleController extends Controller
{
    /**
     * Redirige l'utilisateur vers la page d'authentification Google.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->redirectUrl(config('services.google.redirect'))
            ->stateless()
            ->redirect();
    }

    /**
     * Gère le retour de l'authentification Google.
     */
    public function handleGoogleCallback()
    {
        try {
            $driver = Socialite::driver('google')->stateless();
            
            // Bypass SSL verification on local dev to avoid cURL error 60
            if (config('app.env') === 'local') {
                $driver->setHttpClient(new \GuzzleHttp\Client(['verify' => false]));
            }

            $googleUser = $driver->user();
            
            $user = User::updateOrCreate([
                'email' => $googleUser->email,
            ], [
                'name' => $googleUser->name,
                'google_id' => $googleUser->id,
                'avatar' => $googleUser->avatar, // On peut ajouter ce champ plus tard ou l'utiliser tel quel
                'password' => encrypt('lumi-dummy-password') // Mot de passe bidon car OAuth
            ]);

            Auth::login($user);
            
            \Log::info('Google Auth Success for User: ' . $user->email);

            // Vérifier si le profil est complet
            $isProfileComplete = $user->intention_id && $user->interests && $user->bio;
            
            if ($isProfileComplete) {
                // Utilisateur existant avec profil complet → Discovery
                \Log::info('Profile complete, redirecting to: ' . route('discovery'));
                return redirect()->route('discovery');
            } else {
                // Nouvel utilisateur ou profil incomplet → Onboarding
                \Log::info('Profile incomplete, redirecting to: ' . route('onboarding.basic'));
                return redirect()->route('onboarding.basic');
            }
            
        } catch (Exception $e) {
            \Log::error('Google Auth Error: ' . $e->getMessage());
            return redirect('/login')->with('error', 'Erreur lors de la connexion avec Google: ' . $e->getMessage());
        }
    }
}
