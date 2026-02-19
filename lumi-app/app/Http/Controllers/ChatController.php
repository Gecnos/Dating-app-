<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\MatchModel;
use App\Models\User;
use App\Events\MessageSent;
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

        // 3. Fetch Last Messages for these conversations Efficiently
        // We get the IDs of the latest message for each conversation
        // Note: Grouping by conversation tuple (min_id, max_id) ensures unique conversation per pair
        $lastMessages = Message::where(function($q) use ($me, $matchIds) {
                $q->where('from_id', $me->id)->whereIn('to_id', $matchIds);
            })
            ->orWhere(function($q) use ($me, $matchIds) {
                $q->whereIn('from_id', $matchIds)->where('to_id', $me->id);
            })
            ->orderBy('id', 'desc')
            ->get()
            ->unique(function ($item) use ($me) {
                // Unique key for conversation: sorted IDs
                $p1 = $item->from_id;
                $p2 = $item->to_id;
                return min($p1, $p2) . '-' . max($p1, $p2);
            });

        // 4. Fetch Unread Counts Efficiently
        // SELECT from_id, COUNT(*) FROM messages WHERE to_id = me AND is_read = 0 AND from_id IN (...) GROUP BY from_id
        $unreadCounts = Message::where('to_id', $me->id)
            ->whereIn('from_id', $matchIds)
            ->whereIn('from_id', $matchIds)
            ->where('is_read', false)
            // In step 1863 I used whereNull('read_at') because User model uses accessors.
            // But ChatController::list (lines 51-54) previously used 'is_read', false.
            // I should check Message model again. Step 1862 showed Message model has 'is_read' in fillable.
            // But UserController::counts uses `whereNull('read_at')`. 
            // This suggests INCONSISTENCY in the database or model.
            // Let's check the migration or assume 'is_read' based on previous ChatController code.
            // Wait, Step 1863 fix in UserController used `$user->unread_messages_count`.
            // User model (Step 1858) `getUnreadMessagesCountAttribute`: `return $this->receivedMessages()->where('is_read', false)->count();`
            // So 'is_read' is the correct column based on User model.
            // UserController::counts ORIGINAL (Step 1846) used `read_at`. That was what I REPLACED.
            // So `is_read` is correct.
            ->where('is_read', false)
            ->selectRaw('from_id, count(*) as count')
            ->groupBy('from_id')
            ->pluck('count', 'from_id');

        
        // 5. Enhance Users
        $enhancedUsers = $users->map(function($user) use ($me, $lastMessages, $unreadCounts) {
            // Find last message for this user
            $lastMessage = $lastMessages->first(function($msg) use ($me, $user) {
                return ($msg->from_id == $me->id && $msg->to_id == $user->id) ||
                       ($msg->from_id == $user->id && $msg->to_id == $me->id);
            });

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
                ->select(['id', 'name', 'avatar', 'updated_at', 'is_ghost_mode'])
                ->firstOrFail(),
            'messages' => $messages
        ]);
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

        // Send notification to recipient
        $recipient = User::find($request->to_id);
        if ($recipient) {
            $sender = Auth::user();
            
            // 1. Persistent DB Notification
            $recipient->notify(new \App\Notifications\AppNotification(
                'message',
                'Nouveau Message',
                "{$sender->name} vous a envoyé un message.",
                '/chat/' . $sender->id,
                'chat_bubble',
                '#0f2cbd'
            ));

            // 2. Real-time Push Notification (FCM)
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
                    'from_id' => (string)$sender->id,
                    'url' => '/chat/' . $sender->id
                ]
            );
        }

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message);
    }
}
