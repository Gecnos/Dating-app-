<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Récupère les notifications de l'utilisateur.
     */
    public function index()
    {
        $user = Auth::user();
        $notifications = $user->notifications()->limit(50)->get()->map(function($n) {
            return [
                'id' => $n->id,
                'type' => $n->data['type'] ?? 'system',
                'title' => $n->data['title'] ?? 'Notification',
                'content' => $n->data['content'] ?? '',
                'time' => $n->created_at->diffForHumans(),
                'is_unread' => $n->unread(),
                'icon' => $n->data['icon'] ?? 'notifications',
                'color' => $n->data['color'] ?? '#D4AF37',
                'url' => $n->data['url'] ?? '/'
            ];
        });

        return response()->json($notifications);
    }

    /**
     * Marque les notifications comme lues. Avec `type`/`from_id`, ne marque
     * que celles de cette conversation (ex: en ouvrant un chat) ; sans
     * filtre, marque tout (bouton "Tout marquer comme lu").
     */
    public function markAsRead(Request $request)
    {
        $query = Auth::user()->unreadNotifications();

        if ($request->filled('type')) {
            $query->where('data->type', $request->type);
        }
        if ($request->filled('from_id')) {
            $query->where('data->subject_id', (int) $request->from_id);
        }

        $query->update(['read_at' => now()]);

        return response()->json(['message' => 'Marquées comme lues']);
    }

    /**
     * Supprime une notification.
     */
    public function destroy($id)
    {
        Auth::user()->notifications()->findOrFail($id)->delete();
        return response()->json(['message' => 'Supprimée']);
    }
}
