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
        $url = Socialite::driver('google')
            ->redirectUrl(config('services.google.redirect'))
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json(['url' => $url]);
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
                'avatar' => $googleUser->avatar,
                'password' => encrypt('lumi-dummy-password') // Mot de passe bidon car OAuth
            ]);

            Auth::login($user);
            $token = $user->createToken('auth-token')->plainTextToken;
            
            \Log::info('Google Auth Success for User: ' . $user->email);

            // Redirection vers le frontend avec le token
            $query = http_build_query([
                'token' => $token,
                'user_id' => $user->id,
                'new_user' => $user->wasRecentlyCreated ? '1' : '0'
            ]);

            return redirect('/auth/callback?' . $query);
            
        } catch (Exception $e) {
            \Log::error('Google Auth Error: ' . $e->getMessage());
            return redirect('/login?error=google_auth_failed');
        }
    }
}
