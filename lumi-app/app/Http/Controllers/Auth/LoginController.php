<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class LoginController extends Controller
{
    /**
     * Affiche la page de connexion (déjà gérée par une route statique mais on peut centraliser).
     */
    public function showLink()
    {
        return Inertia::render('Login');
    }

    /**
     * Gère la connexion par email.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->remember)) {
            $request->session()->regenerate();

            $user = Auth::user();
            
            // Logique de redirection intelligente vers l'étape d'onboarding manquante
            if (!$user->gender || !$user->date_of_birth) {
                return redirect()->route('onboarding.basic');
            }
            
            if (!$user->intention_id) {
                return redirect()->route('onboarding.intentions');
            }

            if (empty($user->interests) || count($user->interests) < 3) {
                return redirect()->route('onboarding.interests');
            }

            if (!$user->avatar) {
                return redirect()->route('onboarding.photos');
            }

            // Tout est bon, on va au deck de découverte
            return redirect()->intended(route('discovery'));
        }

        return back()->withErrors([
            'email' => 'Les identifiants ne correspondent pas à nos enregistrements.',
        ])->onlyInput('email');
    }

    /**
     * Affiche la page d'inscription.
     */
    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Gère l'inscription.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Auth::login($user);

        return redirect()->route('onboarding.basic');
    }

    /**
     * Déconnexion.
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
