<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Liste des utilisateurs en attente de vérification.
     */
    public function index()
    {
        $users = User::whereNotNull('verification_selfie')
            ->where('is_verified', false)
            ->get();

        return response()->json([
            'users' => $users
        ]);
    }

    /**
     * Approuve ou rejette la vérification d'un utilisateur.
     */
    public function verify(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        if ($request->action === 'approve') {
            $user->update(['is_verified' => true]);
            $user->notify(new \App\Notifications\AppNotification(
                'verification',
                'Compte Vérifié !',
                "Votre demande de vérification a été approuvée.",
                '',
                'verified',
                '#4CAF50'
            ));
        } else {
            $user->update(['verification_selfie' => null]);
            $user->notify(new \App\Notifications\AppNotification(
                'verification',
                'Vérification Refusée',
                "Votre photo de vérification n'était pas conforme. Veuillez réessayer.",
                '',
                'error',
                '#F44336'
            ));
        }

        return response()->json(['message' => 'Action effectuée']);
    }

    /**
     * Statistiques globales.
     */
    public function stats()
    {
        return response()->json([
            'stats' => [
                'total_users' => User::count(),
                'verified_users' => User::where('is_verified', true)->count(),
                'pending_verifications' => User::whereNotNull('verification_selfie')->where('is_verified', false)->count(),
            ]
        ]);
    }
}
