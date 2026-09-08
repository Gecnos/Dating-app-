<?php

namespace App\Http\Controllers;

use App\Models\MatchModel;
use App\Models\Message;
use App\Models\Report;
use App\Models\User;
use App\Models\UserPhoto;
use App\Notifications\AppNotification;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

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
    public function verify($id, $action)
    {
        $user = User::findOrFail($id);

        if ($action === 'approve') {
            $user->update(['is_verified' => true]);
            $user->notify(new \App\Notifications\AppNotification(
                'verification',
                'Compte Vérifié !',
                "Votre demande de vérification a été approuvée.",
                '/profile',
                'verified',
                '#4CAF50'
            ));
        } else {
            $user->update(['verification_selfie' => null]);
            $user->notify(new \App\Notifications\AppNotification(
                'verification',
                'Vérification Refusée',
                "Votre photo de vérification n'était pas conforme. Veuillez réessayer.",
                '/profile',
                'error',
                '#F44336'
            ));
        }

        return response()->json(['message' => 'Action effectuée']);
    }

    /**
     * Liste des signalements, urgents en premier.
     */
    public function reports()
    {
        $reports = Report::with(['reporter', 'reported.photos'])
            ->orderByRaw("priority = 'urgent' desc")
            ->latest()
            ->get();

        return response()->json(['reports' => $reports]);
    }

    /**
     * Marque un signalement comme traite (sans forcement bannir personne -
     * garde une trace qu'un admin l'a regarde).
     */
    public function resolveReport($id)
    {
        $report = Report::findOrFail($id);
        $report->update(['status' => 'reviewed']);

        return response()->json(['message' => 'Signalement marque comme traite.']);
    }

    /**
     * Suspend un compte : coupe l'acces immediatement en revoquant tous ses
     * tokens Sanctum actifs, pas seulement les connexions futures.
     */
    public function banUser($id)
    {
        $user = User::findOrFail($id);
        $user->forceFill(['is_banned' => true, 'banned_at' => now()])->save();
        $user->tokens()->delete();

        return response()->json(['message' => 'Compte suspendu.']);
    }

    public function unbanUser($id)
    {
        $user = User::findOrFail($id);
        $user->forceFill(['is_banned' => false, 'banned_at' => null])->save();

        return response()->json(['message' => 'Compte reactive.']);
    }

    /**
     * Moderation : supprime une photo du profil d'un utilisateur signale.
     * Les signalements portent sur un utilisateur entier (pas de lien vers
     * une photo precise dans le modele actuel), donc l'admin choisit
     * laquelle retirer depuis la galerie complete.
     */
    public function deleteUserPhoto($userId, $photoId)
    {
        $photo = UserPhoto::where('user_id', $userId)->findOrFail($photoId);
        $user = $photo->user;

        $this->cloudinary->deleteImage($photo->url);
        $photo->delete();

        if ($user->avatar === $photo->url) {
            $next = $user->photos()->orderBy('order')->first();
            $user->update(['avatar' => $next ? $next->url : null]);
        }

        return response()->json(['message' => 'Photo supprimee.']);
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
                // Each mutual match is stored as two rows (one per direction),
                // so divide by 2 for the actual pair count.
                'total_matches' => intdiv(MatchModel::where('is_mutual', true)->count(), 2),
                'messages_last_24h' => Message::where('created_at', '>=', now()->subDay())->count(),
                'new_users_this_week' => User::where('created_at', '>=', now()->subWeek())->count(),
            ]
        ]);
    }

    /**
     * Envoie une notification in-app a tous les utilisateurs (alerte
     * securite, annonce...). Chunk pour ne jamais charger tous les
     * utilisateurs en memoire d'un coup.
     */
    public function broadcast(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'content' => 'required|string|max:500',
            'url' => 'nullable|string|max:255',
        ]);

        $url = $validated['url'] ?? '/';
        $count = 0;

        User::chunk(200, function ($users) use ($validated, $url, &$count) {
            foreach ($users as $user) {
                $user->notify(new AppNotification(
                    'announcement',
                    $validated['title'],
                    $validated['content'],
                    $url,
                    'campaign',
                    '#D4AF37'
                ));
                $count++;
            }
        });

        return response()->json(['message' => 'Diffuse.', 'notified_count' => $count]);
    }
}
