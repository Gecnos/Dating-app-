<?php

namespace App\Http\Controllers;

use App\Models\MatchModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MatchController extends Controller
{
    /**
     * Gère l'action de swipe (like ou nope).
     */
    public function swipe(Request $request)
    {
        $request->validate([
            'target_id' => 'required|exists:users,id',
            'status' => 'required|in:liked,passed',
        ]);

        $match = MatchModel::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'target_id' => $request->target_id,
            ],
            [
                'status' => $request->status,
            ]
        );

        // Vérifier si c'est un match mutuel
        $isMutual = false;
        if ($request->status === 'liked') {
            $reciprocal = MatchModel::where('user_id', $request->target_id)
                ->where('target_id', Auth::id())
                ->where('status', 'liked')
                ->first();

            if ($reciprocal) {
                $isMutual = true;
                $match->update(['is_mutual' => true]);
                $reciprocal->update(['is_mutual' => true]);
                
                $targetUser = User::find($request->target_id);
                $currentUser = Auth::user();
                
                broadcast(new \App\Events\MatchNotification($match, $targetUser))->toOthers();
                broadcast(new \App\Events\MatchNotification($reciprocal, $currentUser))->toOthers();

                $targetUser->notify(new \App\Notifications\AppNotification(
                    'match',
                    'Nouveau Match !',
                    "Vous avez matché avec {$currentUser->name}.",
                    'favorite',
                    '#D4AF37'
                ));

                $currentUser->notify(new \App\Notifications\AppNotification(
                    'match',
                    'Nouveau Match !',
                    "Vous avez matché avec {$targetUser->name}.",
                    'favorite',
                    '#D4AF37'
                ));

                // Real-time Push (FCM)
                $pushService = app(\App\Services\PushNotificationService::class);
                $pushService->sendToUser($targetUser, 'Lumi', "Nouveau Match ! Vous avez matché avec {$currentUser->name}.", ['type' => 'match']);
                $pushService->sendToUser($currentUser, 'Lumi', "Nouveau Match ! Vous avez matché avec {$targetUser->name}.", ['type' => 'match']);
            } else {
                broadcast(new \App\Events\LikeNotification(Auth::user(), $request->target_id))->toOthers();
            }
        }

        return response()->json([
            'status' => 'success',
            'is_mutual' => $isMutual
        ]);
    }

    /**
     * Affiche la page des Likes (reçus et envoyés).
     */
    public function index()
    {
        $me = Auth::user();

        // Likes reçus (ceux qui m'ont liké mais pas encore de match mutuel)
        $receivedLikes = Inertia::defer(fn() => MatchModel::where('target_id', $me->id)
            ->where('status', 'liked')
            ->where('is_mutual', false)
            ->whereHas('user') // Sécurité: seulement si le user existe
            ->with(['user.intention'])
            ->get()
            ->map(function($match) {
                return [
                    'id' => $match->id,
                    'user' => $match->user,
                    'created_at' => $match->created_at,
                ];
            }));

        // Likes envoyés
        $sentLikes = Inertia::defer(fn() => MatchModel::where('user_id', $me->id)
            ->where('status', 'liked')
            ->whereHas('target') // Sécurité
            ->with(['target.intention'])
            ->get()
            ->map(function($match) {
                return [
                    'id' => $match->id,
                    'user' => $match->target,
                    'created_at' => $match->created_at,
                ];
            }));

        return Inertia::render('Likes', [
            'receivedLikes' => $receivedLikes,
            'sentLikes' => $sentLikes,
            'isPremium' => $me->credits > 0
        ]);
    }
}
