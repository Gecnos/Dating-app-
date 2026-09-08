<?php

namespace App\Http\Controllers;

use App\Models\MatchModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
                    '/match/success/' . $currentUser->id,
                    'favorite',
                    '#D4AF37',
                    $currentUser->id
                ));

                $currentUser->notify(new \App\Notifications\AppNotification(
                    'match',
                    'Nouveau Match !',
                    "Vous avez matché avec {$targetUser->name}.",
                    '/match/success/' . $targetUser->id,
                    'favorite',
                    '#D4AF37',
                    $targetUser->id
                ));

                // Real-time Push (FCM) — respects each recipient's preference;
                // the in-app notifications above are always created regardless.
                $pushService = app(\App\Services\PushNotificationService::class);
                if ($targetUser->notify_push_matches) {
                    $pushService->sendToUser($targetUser, 'Lumi', "✨ Nouveau Match ! Vous et {$currentUser->name} vous plaisez.", [
                        'type' => 'match',
                        'url' => '/match/success/' . $currentUser->id
                    ]);
                }
                if ($currentUser->notify_push_matches) {
                    $pushService->sendToUser($currentUser, 'Lumi', "✨ Nouveau Match ! Vous et {$targetUser->name} vous plaisez.", [
                        'type' => 'match',
                        'url' => '/match/success/' . $targetUser->id
                    ]);
                }
            } else {
                $currentUser = Auth::user();
                broadcast(new \App\Events\LikeNotification($currentUser, $request->target_id))->toOthers();

                // Persist the like as a real notification too, so it isn't
                // lost the moment the recipient isn't online to see the
                // live WebSocket badge bump.
                $targetUser = User::find($request->target_id);
                if ($targetUser) {
                    $targetUser->notify(new \App\Notifications\AppNotification(
                        'like',
                        'Nouveau Like !',
                        "{$currentUser->name} vous a liké.",
                        '/likes',
                        'favorite',
                        '#D4AF37',
                        $currentUser->id
                    ));

                    if ($targetUser->notify_push_likes) {
                        app(\App\Services\PushNotificationService::class)->sendToUser(
                            $targetUser,
                            'Lumi',
                            "💛 {$currentUser->name} vous a liké !",
                            ['type' => 'like', 'url' => '/likes']
                        );
                    }
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'is_mutual' => $isMutual
        ]);
    }

    /**
     * Annule le dernier swipe (like ou pass) de l'utilisateur, pour le
     * refaire apparaître dans la découverte. Un match déjà mutuel ne peut
     * pas être annulé ici : ça toucherait aussi la ligne de l'autre
     * utilisateur, ses notifications et d'éventuels messages déjà échangés.
     */
    public function undoLastSwipe(Request $request)
    {
        $last = MatchModel::where('user_id', Auth::id())->latest('id')->first();

        if (!$last) {
            return response()->json(['message' => 'Rien à annuler.'], 404);
        }

        if ($last->is_mutual) {
            return response()->json(['message' => 'Impossible d\'annuler un match.'], 422);
        }

        $target = User::with(['intention', 'photos'])->find($last->target_id);
        $last->delete();

        return response()->json([
            'status' => 'success',
            'profile' => $target,
        ]);
    }

    /**
     * Affiche la page des Likes (reçus et envoyés).
     */
    public function index()
    {
        $me = Auth::user();

        // Likes reçus (ceux qui m'ont liké mais pas encore de match mutuel)
        $receivedLikes = MatchModel::where('target_id', $me->id)
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
            });

        // Likes envoyés
        $sentLikes = MatchModel::where('user_id', $me->id)
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
            });

        return response()->json([
            'receivedLikes' => $receivedLikes,
            'sentLikes' => $sentLikes,
        ]);
    }
}
