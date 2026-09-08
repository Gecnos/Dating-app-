<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\MatchModel;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    /**
     * Affiche un profil spécifique.
     */
    public function show($id)
    {
        $userId = ($id === 'me') ? Auth::id() : $id;

        // If it's me, return isMe flag
        if ($userId == Auth::id()) {
             $user = User::with(['intention', 'photos'])->findOrFail($userId);
             return response()->json([
                'profile' => $user,
                'isMutual' => false,
                'isMe' => true
             ]);
        }

        $user = User::with(['intention', 'photos'])->findOrFail($userId);
        $me = Auth::user();

        // Vérifier s'il y a un match mutuel
        $isMutual = MatchModel::where(function($q) use ($userId, $me) {
            $q->where('user_id', $me->id)->where('target_id', $userId);
        })->where('is_mutual', true)->exists();

        // Ghost Mode Protection : Invisibilité totale sauf si déjà matché ou si c'est soi-même
        if ($user->is_ghost_mode && !$isMutual && $user->id !== $me->id) {
            abort(404); // On fait semblant que le profil n'existe pas
        }

        // Ne pas enregistrer la vue si le visiteur est lui-même en mode
        // fantôme : il a choisi d'être invisible, ça inclut son activité.
        if (!$me->is_ghost_mode) {
            \App\Models\ProfileView::updateOrCreate(
                ['viewer_id' => $me->id, 'viewed_id' => $user->id],
                ['viewed_at' => now()]
            );
        }

        return response()->json([
            'profile' => $user,
            'isMutual' => $isMutual
        ]);
    }

    /**
     * Soumet (ou resoumet) un selfie de vérification de profil.
     * Laisse is_verified à false : un admin doit approuver.
     */
    public function submitVerificationSelfie(Request $request)
    {
        $request->validate(['selfie' => 'required|string']);

        $user = Auth::user();
        $url = $this->cloudinary->uploadBase64($request->selfie);

        $user->update([
            'verification_selfie' => $url,
            'is_verified' => false,
        ]);

        return response()->json([
            'message' => 'Selfie envoyé, en attente de vérification.',
            'verification_selfie' => $url,
        ]);
    }

    /**
     * Qui a consulté mon profil, plus récent en premier.
     */
    public function profileViews()
    {
        $views = \App\Models\ProfileView::where('viewed_id', Auth::id())
            ->with('viewer')
            ->orderByDesc('viewed_at')
            ->get()
            ->map(function ($view) {
                return [
                    'id' => $view->id,
                    'user' => $view->viewer,
                    'viewed_at' => $view->viewed_at,
                ];
            });

        return response()->json(['views' => $views]);
    }

    /**
     * Page de gestion des photos.
     */
    public function photoManagement()
    {
        return response()->json([
            'photos' => Auth::user()->photos()->orderBy('order')->get()
        ]);
    }

    /**
     * Ajoute une photo à la galerie.
     */
    public function addPhoto(Request $request)
    {
        $request->validate(['photo' => 'required|string']);
        $user = Auth::user();
        
        $url = $this->cloudinary->uploadBase64($request->photo);
        
        $user->photos()->create([
            'url' => $url,
            'order' => $user->photos()->count(),
            'is_primary' => $user->photos()->count() === 0
        ]);

        // Si c'est la première photo, on met à jour l'avatar
        if (!$user->avatar) {
            $user->update(['avatar' => $url]);
        }

        return response()->json(['message' => 'Photo ajoutée !', 'photo' => $user->photos()->latest()->first()]);
    }

    /**
     * Supprime une photo de la galerie.
     */
    public function deletePhoto($id)
    {
        $user = Auth::user();
        $photo = $user->photos()->findOrFail($id);
        
        $this->cloudinary->deleteImage($photo->url);
        $photo->delete();

        // Si on a supprimé l'avatar, on prend la suivante ou on vide
        if ($user->avatar === $photo->url) {
            $next = $user->photos()->orderBy('order')->first();
            $user->update(['avatar' => $next ? $next->url : null]);
        }

        return response()->json(['message' => 'Photo supprimée.']);
    }

    /**
     * Réorganise les photos.
     */
    public function reorderPhotos(Request $request)
    {
        $request->validate(['photo_ids' => 'required|array']);
        $user = Auth::user();
        
        foreach ($request->photo_ids as $index => $id) {
            $user->photos()->where('id', $id)->update(['order' => $index]);
        }

        // Mettre à jour l'avatar avec la première photo
        $first = $user->photos()->orderBy('order')->first();
        if ($first) {
            $user->update(['avatar' => $first->url]);
        }

        return response()->json(['message' => 'Ordre mis à jour.']);
    }


    public function discovery()
    {
        $me = Auth::user();
        
        $initialProfiles = Cache::remember("discovery_user_{$me->id}", 600, function() use ($me) {
            // IDs à exclure : déjà swipé, soi-même, bloqués, signalés
            $swipedIds = MatchModel::where('user_id', $me->id)->pluck('target_id')->toArray();
            $blockedByMe = \App\Models\Block::where('blocker_id', $me->id)->pluck('blocked_id')->toArray();
            $blockedMe = \App\Models\Block::where('blocked_id', $me->id)->pluck('blocker_id')->toArray();
            $reportedByMe = \App\Models\Report::where('reporter_id', $me->id)->pluck('reported_id')->toArray();
    
            $excludeIds = array_unique(array_merge($swipedIds, $blockedByMe, $blockedMe, $reportedByMe, [$me->id]));
    
            // GILI Algorithm: Gender → Intention → Location → Interests
            // Cap the candidate pool before scoring in PHP: without this, every
            // eligible user in the whole database gets loaded into memory and
            // scored/sorted on every cache miss, which gets slower as the user
            // base grows. A random sample of 300 is plenty to pick a top-20 from.
            $query = User::whereNotIn('id', $excludeIds)
                ->where('is_ghost_mode', false)
                ->with(['intention', 'photos'])
                // 1. Gender Filter: Same or specific preference
                ->where('gender', $me->gender === 'Homme' ? 'Femme' : 'Homme');

            // Age preference, portable across drivers (see explorer() for
            // why EXTRACT(YEAR FROM AGE(...)) isn't used — Postgres-only,
            // crashes on sqlite).
            if ($me->pref_age_min) {
                $query->whereDate('date_of_birth', '<=', now()->subYears($me->pref_age_min)->toDateString());
            }
            if ($me->pref_age_max) {
                $query->whereDate('date_of_birth', '>', now()->subYears($me->pref_age_max + 1)->toDateString());
            }

            $candidates = $query
                ->inRandomOrder()
                ->limit(300)
                ->get()
                ->map(function($user) use ($me) {
                    // Calculate score
                    $score = 0;
                    
                    // Intention Match (Weight: 100)
                    if ($user->intention_id === $me->intention_id) {
                        $score += 100;
                    }
    
                    // Distance (Haversine)
                    $distance = $this->calculateDistance($me->latitude, $me->longitude, $user->latitude, $user->longitude);
                    $user->distance_km = round($distance, 1);
                    
                    // Proximity Score (Weight: inverse of distance, max 100)
                    $score += max(0, 100 - ($distance * 2)); 
    
                    // Interests Intersection (Weight: 20 per matching interest,
                    // capped at 5 so a long shared interest list can't drown
                    // out the intention/distance signal)
                    $common = array_intersect($user->interests ?? [], $me->interests ?? []);
                    $score += min(count($common), 5) * 20;

                    // Small recency bonus: active-in-the-last-week profiles
                    // rank slightly above stale ones, all else equal.
                    if ($user->updated_at && $user->updated_at->gt(now()->subWeek())) {
                        $score += 10;
                    }

                    $user->matching_score = $score;
                    return $user;
                });

            // Distance preference: same reasoning as explorer() — the
            // haversine trig functions aren't portable in raw SQL, so filter
            // in PHP using the distance_km already computed above.
            if ($me->pref_max_distance_km) {
                $candidates = $candidates->filter(fn($user) => $user->distance_km <= $me->pref_max_distance_km)->values();
            }

            return $candidates
                ->sortByDesc('matching_score')
                ->values()
                ->take(20);
        });

        return response()->json([
            'initialProfiles' => $initialProfiles
        ]);
    }


    public function explorer(Request $request)
    {
        $me = Auth::user();
        
        $excludeIds = array_unique(array_merge(
            \App\Models\Block::where('blocker_id', $me->id)->pluck('blocked_id')->toArray(),
            \App\Models\Block::where('blocked_id', $me->id)->pluck('blocker_id')->toArray(),
            \App\Models\Report::where('reporter_id', $me->id)->pluck('reported_id')->toArray(),
            [$me->id]
        ));

        $query = User::with(['intention', 'photos'])
            ->whereNotIn('id', $excludeIds)
            ->where('is_ghost_mode', false);

        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }

        // Age range via date_of_birth directly, portable across drivers
        // (EXTRACT(YEAR FROM AGE(...)) is Postgres-only and crashes on
        // SQLite/MySQL).
        if ($request->filled('age_min')) {
            $query->whereDate('date_of_birth', '<=', now()->subYears((int) $request->age_min)->toDateString());
        }
        if ($request->filled('age_max')) {
            $query->whereDate('date_of_birth', '>', now()->subYears((int) $request->age_max + 1)->toDateString());
        }

        if ($request->filled('intention_id')) {
            $query->where('intention_id', $request->intention_id);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            // ilike + ::text cast are Postgres-only; plain "like" is
            // case-insensitive on SQLite/MySQL by default and portable.
            $likeOp = DB::connection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function($q) use ($s, $likeOp) {
                $q->where('name', $likeOp, "%$s%")
                  ->orWhere('bio', $likeOp, "%$s%")
                  ->orWhere('city', $likeOp, "%$s%")
                  ->orWhere('interests', $likeOp, "%$s%");
            });
        }

        $filterByDistance = $request->filled('distance') && $me->latitude && $me->longitude;

        // The haversine trig functions (acos/radians/sin/cos) used to be run
        // in raw SQL, which only exists on Postgres — SQLite doesn't ship
        // them, so this crashed there. Filter/limit in PHP instead, reusing
        // the same calculateDistance() already used for display below.
        $profiles = $query->limit($filterByDistance ? 300 : 40)->get()->map(function($user) use ($me) {
            $user->age = $user->date_of_birth ? \Carbon\Carbon::parse($user->date_of_birth)->age : null;
            $user->distance_km = round($this->calculateDistance($me->latitude, $me->longitude, $user->latitude, $user->longitude), 1);
            return $user;
        });

        if ($filterByDistance) {
            $profiles = $profiles->filter(fn($user) => $user->distance_km <= $request->distance)
                ->values()
                ->take(40);
        }

        return response()->json([
            'profiles' => $profiles,
            'filters' => $request->all(),
            'intentions' => \App\Models\Intention::all()
        ]);
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2) {
        if (!$lat1 || !$lon1 || !$lat2 || !$lon2) return 999;
        $theta = $lon1 - $lon2;
        $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
        $dist = acos($dist);
        $dist = rad2deg($dist);
        $miles = $dist * 60 * 1.1515;
        return $miles * 1.609344;
    }

    public function edit()
    {
        $interests = \Illuminate\Support\Facades\Cache::remember('interests_list', 86400, function() {
            return \App\Models\Interest::where('is_approved', true)->get();
        });

        return response()->json([
            'user' => Auth::user()->load(['photos' => fn($q) => $q->orderBy('order')]),
            'interests' => $interests
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'job' => 'nullable|string|max:255',
            'education' => 'nullable|string|max:255',
            'height' => 'nullable|numeric|min:100|max:250',
            'city' => 'nullable|string|max:255',
            'interests' => 'nullable|array',
            'languages' => 'nullable|array',
            'avatar_data' => 'nullable|string',
        ]);

        if ($request->filled('avatar_data')) {
            $url = $this->cloudinary->uploadBase64($request->avatar_data);
            $user->avatar = $url;
            
            $user->photos()->create([
                'url' => $url,
                'order' => $user->photos()->count(),
                'is_primary' => true
            ]);
        }

        $user->update($validated);

        return response()->json(['message' => 'Profil mis à jour !', 'user' => $user]);
    }

    public function storeBasicInfo(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string|in:Homme,Femme',
            'job' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        return response()->json(['message' => 'Infos de base enregistrées', 'next_step' => 'intentions']);
    }

    public function storeIntentions(Request $request)
    {
        $user = Auth::user();
        
        $intentionMap = [
            'mariage' => 1,
            'decouverte' => 2,
            'fun' => 3,
            'business' => 4,
        ];

        $intentionId = $intentionMap[$request->intention] ?? 1;

        $user->update(['intention_id' => $intentionId]);

        return response()->json(['message' => 'Intentions enregistrées', 'next_step' => 'interests']);
    }

    public function storeInterests(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'interests' => 'required|array|min:3|max:10',
        ]);

        $user->update(['interests' => $validated['interests']]);

        return response()->json(['message' => 'Intérêts enregistrés', 'next_step' => 'photos']);
    }

    public function storePhotos(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'photos' => 'required|array|min:1',
        ]);

        foreach ($request->photos as $index => $base64) {
            if ($base64) {
                $url = $this->cloudinary->uploadBase64($base64);
                
                if ($index === 0 && !$user->avatar) {
                    $user->update(['avatar' => $url]);
                }

                $user->photos()->create([
                    'url' => $url,
                    'order' => $index,
                    'is_primary' => $index === 0
                ]);
            }
        }

        return response()->json(['message' => 'Photos enregistrées', 'next_step' => 'discovery']);
    }

    public function getInterests()
    {
        $interests = Cache::remember('interests_list', 86400, function() {
            return \App\Models\Interest::where('is_approved', true)->get();
        });

        return response()->json($interests);
    }

    public function suggestInterest(Request $request)
    {
        $request->validate(['label' => 'required|string|max:50|unique:interests,label']);

        \App\Models\Interest::create([
            'label' => $request->label,
            'slug' => str()->slug($request->label),
            'is_approved' => false
        ]);

        return response()->json(['message' => 'Suggestion envoyée pour validation admin !']);
    }

    public function updateLocation(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        Auth::user()->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return response()->json(['message' => 'Position mise à jour.']);
    }

    /**
     * Enregistre les préférences de recherche (âge, distance) utilisées par
     * discovery(). Chaque champ est optionnel : l'omettre/le vider retire
     * le filtre correspondant plutôt que de le remettre à une valeur par défaut.
     */
    public function updateSearchPreferences(Request $request)
    {
        $validated = $request->validate([
            'pref_age_min' => 'nullable|integer|min:18|max:99',
            'pref_age_max' => 'nullable|integer|min:18|max:99',
            'pref_max_distance_km' => 'nullable|integer|min:1',
        ]);

        if (
            array_key_exists('pref_age_min', $validated) && $validated['pref_age_min'] !== null &&
            array_key_exists('pref_age_max', $validated) && $validated['pref_age_max'] !== null &&
            $validated['pref_age_min'] > $validated['pref_age_max']
        ) {
            return response()->json([
                'message' => "L'âge minimum ne peut pas dépasser l'âge maximum.",
                'errors' => ['pref_age_min' => ["L'âge minimum ne peut pas dépasser l'âge maximum."]],
            ], 422);
        }

        $user = Auth::user();
        $user->update($validated);

        // Preferences changed — the 10-minute discovery cache would
        // otherwise keep serving the old, unfiltered/differently-filtered
        // list until it naturally expires.
        Cache::forget("discovery_user_{$user->id}");

        return response()->json([
            'message' => 'Préférences enregistrées.',
            'preferences' => [
                'pref_age_min' => $user->pref_age_min,
                'pref_age_max' => $user->pref_age_max,
                'pref_max_distance_km' => $user->pref_max_distance_km,
            ],
        ]);
    }

     public function toggleGhostMode(Request $request)
    {
        $user = Auth::user();
        $user->is_ghost_mode = !$user->is_ghost_mode;
        $user->save();

        return response()->json([
            'is_ghost_mode' => $user->is_ghost_mode
        ]);
    }

    /**
     * Met à jour les préférences de notifications push de l'utilisateur.
     * Ne touche jamais aux notifications in-app (toujours créées), juste
     * à l'envoi FCM.
     */
    public function updateNotificationPreferences(Request $request)
    {
        $validated = $request->validate([
            'notify_push_messages' => 'sometimes|boolean',
            'notify_push_matches' => 'sometimes|boolean',
            'notify_push_likes' => 'sometimes|boolean',
            'notify_push_announcements' => 'sometimes|boolean',
        ]);

        $user = Auth::user();
        $user->update($validated);

        return response()->json([
            'notify_push_messages' => $user->notify_push_messages,
            'notify_push_matches' => $user->notify_push_matches,
            'notify_push_likes' => $user->notify_push_likes,
            'notify_push_announcements' => $user->notify_push_announcements,
        ]);
    }

    public function updateFcmToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'device_type' => 'nullable|string'
        ]);

        $user = Auth::user();
        
        $user->fcmTokens()->firstOrCreate(
            ['token' => $request->token],
            ['device_type' => $request->device_type ?? 'web']
        );

        return response()->json(['message' => 'Token updated']);
    }

    public function counts()
    {
        $user = Auth::user();
        
        return response()->json([
            'unread_messages_count' => $user->unread_messages_count,
            'unread_notifications_count' => $user->unread_notifications_count
        ]);
    }

    public function destroy()
    {
        $user = Auth::user();
        Auth::guard('web')->logout();
        $user->delete();
        return response()->json(['message' => 'Compte supprimé']);
    }
}
