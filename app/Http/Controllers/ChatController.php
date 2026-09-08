<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\MatchModel;
use App\Models\User;
use App\Events\MessageSent;
use App\Events\MessageReacted;
use App\Events\UserTyping;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    /**
     * Liste tous les matches mutuels (Conversations).
     */
    /**
     * Liste tous les matches mutuels (Conversations) - API.
     */
    public function list()
    {
        $me = Auth::user();
        
        // 1. Get Match IDs (Mutual)
        $matchIds = MatchModel::where('is_mutual', true)
            ->where(function($q) use ($me) {
                $q->where('user_id', $me->id)->orWhere('target_id', $me->id);
            })
            ->get()
            ->map(function($match) use ($me) {
                return $match->user_id === $me->id ? $match->target_id : $match->user_id;
            })
            ->toArray();

        // 2. Fetch Users
        $users = User::whereIn('id', $matchIds)->with('intention')->get()->keyBy('id');

        // 3. Fetch only the latest message per conversation, one small indexed
        // lookup per match, instead of loading every message ever exchanged
        // with every match into memory just to find the newest one.
        $lastMessages = collect($matchIds)->mapWithKeys(function ($otherId) use ($me) {
            $msg = Message::where(function ($q) use ($me, $otherId) {
                    $q->where('from_id', $me->id)->where('to_id', $otherId);
                })
                ->orWhere(function ($q) use ($me, $otherId) {
                    $q->where('from_id', $otherId)->where('to_id', $me->id);
                })
                ->latest('id')
                ->first();

            return [$otherId => $msg];
        });

        // 4. Fetch Unread Counts Efficiently
        // SELECT from_id, COUNT(*) FROM messages WHERE to_id = me AND is_read = 0 AND from_id IN (...) GROUP BY from_id
        $unreadCounts = Message::where('to_id', $me->id)
            ->whereIn('from_id', $matchIds)
            ->where('is_read', false)
            ->selectRaw('from_id, count(*) as count')
            ->groupBy('from_id')
            ->pluck('count', 'from_id');


        // 5. Enhance Users
        $enhancedUsers = $users->map(function($user) use ($me, $lastMessages, $unreadCounts) {
            $lastMessage = $lastMessages[$user->id] ?? null;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar_url,
                'last_message' => $lastMessage ? $lastMessage->content : ($user->gender === 'Femme' ? 'Elle vous attend...' : 'Il vous attend...'),
                'last_message_time' => $lastMessage ? $lastMessage->created_at->diffForHumans() : null,
                'last_message_timestamp' => $lastMessage ? $lastMessage->created_at->timestamp : 0,
                'unread_count' => $unreadCounts[$user->id] ?? 0,
                'is_online' => $user->isOnline(),
                'type' => $lastMessage ? $lastMessage->type : 'text',
                'duration' => $lastMessage ? $lastMessage->duration : null,
            ];
        })->sortByDesc('last_message_timestamp')->values();

        return response()->json($enhancedUsers);
    }

    /**
     * Récupère l'historique des messages entre deux utilisateurs - API.
     */
    public function show($user_id)
    {
        $messages = Message::where(function($q) use ($user_id) {
            $q->where('from_id', Auth::id())->where('to_id', $user_id);
        })->orWhere(function($q) use ($user_id) {
            $q->where('from_id', $user_id)->where('to_id', Auth::id());
        })
        ->orderBy('created_at', 'desc') // Get latest first
        ->limit(20)
        ->get()
        ->reverse() // Reorder for display (oldest to newest)
        ->values();

        // Mark received messages as read
        Message::where('to_id', Auth::id())
            ->where('from_id', $user_id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'chatWith' => User::where('id', $user_id)
                ->select(['id', 'name', 'avatar', 'updated_at', 'is_ghost_mode', 'interests'])
                ->firstOrFail(),
            'messages' => $messages
        ]);
    }

    /**
     * Notifie l'autre participant qu'on est en train d'écrire. Aucune
     * persistance : juste un broadcast ephemere sur son canal, comme pour
     * les messages.
     */
    public function typing(Request $request)
    {
        $request->validate(['to_id' => 'required|exists:users,id']);

        broadcast(new UserTyping(Auth::id(), $request->to_id))->toOthers();

        return response()->json(['status' => 'ok']);
    }

    /**
     * Ajoute/retire une reaction emoji sur un message (une seule reaction
     * par utilisateur par message ; retaper le meme emoji la retire).
     */
    public function react(Request $request, $id)
    {
        $request->validate(['emoji' => 'required|string|max:8']);

        $message = Message::where(function ($q) {
            $q->where('from_id', Auth::id())->orWhere('to_id', Auth::id());
        })->findOrFail($id);

        $reactions = $message->reactions ?? [];
        $userId = (string) Auth::id();

        if (($reactions[$userId] ?? null) === $request->emoji) {
            unset($reactions[$userId]);
        } else {
            $reactions[$userId] = $request->emoji;
        }

        $message->reactions = $reactions;
        $message->save();

        $otherId = $message->from_id === Auth::id() ? $message->to_id : $message->from_id;
        broadcast(new MessageReacted($message, $otherId))->toOthers();

        return response()->json(['reactions' => $reactions ?: (object) []]);
    }

    /**
     * API pour charger les anciens messages (pagination).
     */
    public function fetchMessages($user_id, Request $request)
    {
        $offset = $request->input('offset', 0);
        $limit = 20;

        $messages = Message::where(function($q) use ($user_id) {
            $q->where('from_id', Auth::id())->where('to_id', $user_id);
        })->orWhere(function($q) use ($user_id) {
            $q->where('from_id', $user_id)->where('to_id', Auth::id());
        })
        ->orderBy('created_at', 'desc')
        ->skip($offset)
        ->take($limit)
        ->get()
        ->reverse()
        ->values();

        return response()->json($messages);
    }

    /**
     * Envoie un nouveau message.
     */
    public function store(Request $request)
    {
        $mediaPath = null;
        
        if ($request->hasFile('media')) {
            // Regular file upload (FormData)
            $mediaPath = $this->cloudinary->uploadImage($request->file('media'));
        } elseif ($request->filled('media')) {
            // Base64 string (Voice notes)
            $mediaData = $request->input('media');
            if (is_string($mediaData) && strpos($mediaData, 'data:') === 0) {
                $mediaPath = $this->cloudinary->uploadBase64($mediaData);
            }
        }

        $message = Message::create([
            'from_id' => Auth::id(),
            'to_id' => $request->to_id,
            'content' => $request->content ?? '',
            'type' => $request->type ?? 'text',
            'media_path' => $mediaPath,
            'duration' => $request->duration,
            'is_read' => false
        ]);

        // Broadcast immediately so the recipient's WebSocket listener fires
        // without waiting on the notification/push work below.
        broadcast(new MessageSent($message))->toOthers();

        // Notification + push (Firebase network call) don't affect the response
        // the sender is waiting on, so defer them until after it's sent.
        $recipient = User::find($request->to_id);
        $sender = Auth::user();
        if ($recipient) {
            dispatch(function () use ($recipient, $sender, $message) {
                // 1. Persistent DB Notification
                $recipient->notify(new \App\Notifications\AppNotification(
                    'message',
                    'Nouveau Message',
                    "{$sender->name} vous a envoyé un message.",
                    '/chat/' . $sender->id,
                    'chat_bubble',
                    '#0f2cbd',
                    $sender->id
                ));

                // 2. Real-time Push Notification (FCM) — respects the
                // recipient's preference; the in-app notification above is
                // always created regardless.
                if (!$recipient->notify_push_messages) {
                    return;
                }

                $fcmBody = "Nouveau message de {$sender->name}";
                if ($message->type === 'image') {
                    $fcmBody = "📷 {$sender->name} vous a envoyé une photo";
                } elseif ($message->type === 'voice') {
                    $fcmBody = "🎤 {$sender->name} vous a envoyé un message vocal";
                } elseif ($message->type === 'text') {
                    $fcmBody = "{$sender->name} : " . \Illuminate\Support\Str::limit($message->content, 50);
                }

                app(\App\Services\PushNotificationService::class)->sendToUser(
                    $recipient,
                    'Lumi',
                    $fcmBody,
                    [
                        'type' => 'message',
                        'from_id' => (string) $sender->id,
                        'url' => '/chat/' . $sender->id
                    ]
                );
            })->afterResponse();
        }

        return response()->json($message);
    }
}
