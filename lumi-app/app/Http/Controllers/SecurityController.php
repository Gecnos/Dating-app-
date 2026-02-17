<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Carbon\Carbon;

class SecurityController extends Controller
{
    /**
     * Met à jour le mot de passe de l'utilisateur.
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        // Règle des 90 jours
        if ($user->password_changed_at && $user->password_changed_at->gt(Carbon::now()->subDays(90))) {
            $daysLeft = 90 - $user->password_changed_at->diffInDays(Carbon::now());
            return back()->withErrors(['password' => "Vous avez déjà changé votre mot de passe récemment. Veuillez patienter encore {$daysLeft} jours."]);
        }

        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($request->password),
            'password_changed_at' => Carbon::now(),
        ]);

        return back()->with('success', 'Votre mot de passe a été mis à jour avec succès.');
    }

    /**
     * Retourne les informations de sécurité pour les réglages.
     */
    public function getSecurityInfo()
    {
        $user = Auth::user();
        return response()->json([
            'masked_email' => $user->masked_email,
            'password_last_changed' => $user->password_changed_at ? $user->password_changed_at->diffForHumans() : 'Jamais',
            'can_change_password' => !$user->password_changed_at || $user->password_changed_at->lt(Carbon::now()->subDays(90)),
        ]);
    }
}
