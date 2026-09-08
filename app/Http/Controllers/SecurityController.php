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
            return response()->json([
                'message' => "Vous avez déjà changé votre mot de passe récemment. Veuillez patienter encore {$daysLeft} jours.",
                'errors' => ['password' => ["Vous avez déjà changé votre mot de passe récemment."]]
            ], 422);
        }

        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($request->password),
            'password_changed_at' => Carbon::now(),
        ]);

        return response()->json(['message' => 'Votre mot de passe a été mis à jour avec succès.']);
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

    /**
     * Liste les sessions actives (tokens Sanctum) de l'utilisateur.
     */
    public function listSessions(Request $request)
    {
        $currentId = $request->user()->currentAccessToken()->id;

        $sessions = $request->user()->tokens()
            ->orderByDesc('last_used_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($token) use ($currentId) {
                return [
                    'id' => $token->id,
                    'created_at' => $token->created_at,
                    'last_used_at' => $token->last_used_at,
                    'is_current' => $token->id === $currentId,
                ];
            });

        return response()->json(['sessions' => $sessions]);
    }

    /**
     * Revoque une session precise (doit appartenir a l'utilisateur).
     */
    public function revokeSession(Request $request, $id)
    {
        $token = $request->user()->tokens()->where('id', $id)->firstOrFail();
        $token->delete();

        return response()->json(['message' => 'Session déconnectée.']);
    }

    /**
     * Revoque toutes les sessions sauf celle en cours.
     */
    public function revokeOtherSessions(Request $request)
    {
        $currentId = $request->user()->currentAccessToken()->id;

        $request->user()->tokens()->where('id', '!=', $currentId)->delete();

        return response()->json(['message' => 'Tous les autres appareils ont été déconnectés.']);
    }
}
