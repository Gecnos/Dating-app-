<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

        return Inertia::render('Admin/Verify', [
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
            // TODO: Envoyer notif succès
        } else {
            $user->update(['verification_selfie' => null]);
            // TODO: Envoyer notif échec/demande de refaire
        }

        return redirect()->back();
    }

    /**
     * Statistiques globales.
     */
    public function stats()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_users' => User::count(),
                'verified_users' => User::where('is_verified', true)->count(),
                'pending_verifications' => User::whereNotNull('verification_selfie')->where('is_verified', false)->count(),
            ]
        ]);
    }
}
