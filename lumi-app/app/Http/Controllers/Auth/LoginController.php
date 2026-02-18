<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    /**
     * Gère la connexion par email via API.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Connexion réussie',
                'onboarding_step' => $this->getOnboardingStep($user)
            ]);
        }

        return response()->json([
            'message' => 'Les identifiants ne correspondent pas à nos enregistrements.',
            'errors' => ['email' => ['Identifiants incorrects']]
        ], 422);
    }

    private function getOnboardingStep($user) {
        if (!$user->gender || !$user->date_of_birth) return 'basic';
        if (!$user->intention_id) return 'intentions';
        if (empty($user->interests) || count($user->interests) < 3) return 'interests';
        if (!$user->avatar) return 'photos';
        return 'completed';
    }

    /**
     * Gère l'inscription via API.
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
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Inscription réussie',
            'onboarding_step' => 'basic'
        ], 201);
    }

    /**
     * Déconnexion API.
     */
    public function logout(Request $request)
    {
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }
}
