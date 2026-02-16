<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\MatchModel;
use App\Models\User;
use App\Events\MessageSent;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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
    public function list()
    {
        $me = Auth::user();
        
        // Récupérer les IDs des utilisateurs avec qui il y a un match mutuel
        $matchIds = MatchModel::where('is_mutual', true)
            ->where(function($q) use ($me) {
                $q->where('user_id', $me->id)->orWhere('target_id', $me->id);
            })
            ->get()
            ->map(function($match) use ($me) {
                return $match->user_id === $me->id ? $match->target_id : $match->user_id;
            });

        $users = User::whereIn('id', $matchIds)->with('intention')->get();

        return Inertia::render('ChatList', [
            'matches' => $users
        ]);
    }

    /**
     * Récupère l'historique des messages entre deux utilisateurs.
     */
    public function index($user_id)
    {
        $messages = Message::where(function($q) use ($user_id) {
            $q->where('from_id', Auth::id())->where('to_id', $user_id);
        })->orWhere(function($q) use ($user_id) {
            $q->where('from_id', $user_id)->where('to_id', Auth::id());
        })->orderBy('created_at', 'asc')->get();

        return Inertia::render('Chat', [
            'chatWith' => User::findOrFail($user_id),
            'messages' => $messages
        ]);
    }

    /**
     * Envoie un nouveau message.
     */
    public function store(Request $request)
    {
        $mediaPath = null;
        
        if ($request->has('media')) {
            // Handle base64 media (voice notes, images)
            $mediaData = $request->media;
            
            // Check if it's base64
            if (strpos($mediaData, 'data:') === 0) {
                // Extract base64 content
                $mediaPath = $this->cloudinary->uploadBase64($mediaData);
            } else {
                // Regular file upload
                $mediaPath = $this->cloudinary->uploadImage($request->media);
            }
        }

        $message = Message::create([
            'from_id' => Auth::id(),
            'to_id' => $request->to_id,
            'content' => $request->content ?? '',
            'type' => $request->type ?? 'text',
            'media_path' => $mediaPath,
            'is_read' => false
        ]);

        // Send notification to recipient
        $recipient = User::find($request->to_id);
        if ($recipient) {
            $sender = Auth::user();
            $recipient->notify(new \App\Notifications\AppNotification(
                'message',
                'Nouveau Message',
                "{$sender->name} vous a envoyé un message.",
                'mail',
                '#0f2cbd'
            ));
        }

        // TODO: Uncomment when Reverb is configured
        // broadcast(new MessageSent($message))->toOthers();

        return response()->json($message);
    }
}
