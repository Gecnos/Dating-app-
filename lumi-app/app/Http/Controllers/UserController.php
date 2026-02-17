<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\MatchModel;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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

        // Si l'utilisateur essaie de voir son propre profil "public", on le redirige vers son dashboard
        if ($userId == Auth::id()) {
            return redirect()->route('my.profile');
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

        return Inertia::render('ProfileDetails', [
            'profile' => $user,
            'isMutual' => $isMutual
        ]);
    }

    /**
     * Page de gestion des photos.
     */
    public function photoManagement()
    {
        return Inertia::render('PhotoManagement', [
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

        return redirect()->back()->with('success', 'Photo ajoutée !');
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

        return redirect()->back()->with('success', 'Photo supprimée.');
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
        
        // IDs à exclure : déjà swipé, soi-même, bloqués, signalés
        $swipedIds = MatchModel::where('user_id', $me->id)->pluck('target_id')->toArray();
        $blockedByMe = \App\Models\Block::where('blocker_id', $me->id)->pluck('blocked_id')->toArray();
        $blockedMe = \App\Models\Block::where('blocked_id', $me->id)->pluck('blocker_id')->toArray();
        $reportedByMe = \App\Models\Report::where('reporter_id', $me->id)->pluck('reported_id')->toArray();

        $excludeIds = array_unique(array_merge($swipedIds, $blockedByMe, $blockedMe, $reportedByMe, [$me->id]));

        // GILI Algorithm: Gender → Intention → Location → Interests
        $profiles = Inertia::defer(fn() => User::whereNotIn('id', $excludeIds)
            ->where('is_ghost_mode', false)
            ->with(['intention', 'photos'])
            // 1. Gender Filter: Same or specific preference
            ->where('gender', $me->gender === 'Homme' ? 'Femme' : 'Homme') 
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

                // Interests Intersection (Weight: 20 per matching interest)
                $common = array_intersect($user->interests ?? [], $me->interests ?? []);
                $score += count($common) * 20;

                $user->matching_score = $score;
                return $user;
            })
            ->sortByDesc('matching_score')
            ->values()
            ->take(20));

        return Inertia::render('Discovery', [
            'initialProfiles' => $profiles
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

        if ($request->filled('age_min')) {
            $query->whereRaw('EXTRACT(YEAR FROM AGE(date_of_birth)) >= ?', [$request->age_min]);
        }
        if ($request->filled('age_max')) {
            $query->whereRaw('EXTRACT(YEAR FROM AGE(date_of_birth)) <= ?', [$request->age_max]);
        }

        if ($request->filled('intention_id')) {
            $query->where('intention_id', $request->intention_id);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('name', 'ilike', "%$s%")
                  ->orWhere('bio', 'ilike', "%$s%")
                  ->orWhere('city', 'ilike', "%$s%")
                  ->orWhereRaw('interests::text ilike ?', ["%$s%"]);
            });
        }

        if ($request->filled('distance') && $me->latitude && $me->longitude) {
            $lat = $me->latitude;
            $lon = $me->longitude;
            $dist = $request->distance;
            
            $query->whereRaw("(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) <= ?", [
                $lat, $lon, $lat, $dist
            ]);
        }

        $profiles = Inertia::defer(fn() => $query->limit(40)->get()->map(function($user) use ($me) {
            $user->age = $user->date_of_birth ? \Carbon\Carbon::parse($user->date_of_birth)->age : null;
            $user->distance_km = round($this->calculateDistance($me->latitude, $me->longitude, $user->latitude, $user->longitude), 1);
            return $user;
        }));

        return Inertia::render('Explorer', [
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
        return Inertia::render('EditProfile', [
            'user' => Auth::user()->load(['photos' => fn($q) => $q->orderBy('order')])
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

        return redirect()->route('my.profile')->with('success', 'Profil mis à jour !');
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

        return redirect()->route('onboarding.intentions');
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

        return redirect()->route('onboarding.interests');
    }

    public function storeInterests(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'interests' => 'required|array|min:3|max:10',
        ]);

        $user->update(['interests' => $validated['interests']]);

        return redirect()->route('onboarding.photos');
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

        return redirect()->route('discovery');
    }

    public function getInterests()
    {
        return response()->json(\App\Models\Interest::where('is_approved', true)->get());
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

    public function toggleGhostMode(Request $request)
    {
        $user = Auth::user();
        $user->is_ghost_mode = !$user->is_ghost_mode;
        $user->save();

        return response()->json([
            'is_ghost_mode' => $user->is_ghost_mode,
            'message' => $user->is_ghost_mode ? 'Mode fantôme activé.' : 'Mode fantôme désactivé.'
        ]);
    }

    public function destroy()
    {
        $user = Auth::user();
        Auth::guard('web')->logout();
        $user->delete();
        return redirect('/');
    }
}
