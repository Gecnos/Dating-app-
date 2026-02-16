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
     * Affiche un profil spécifique avec logique de flou.
     */
    public function show($id)
    {
        $userId = ($id === 'me') ? Auth::id() : $id;
        $user = User::with(['intention', 'photos'])->findOrFail($userId);
        $me = Auth::user();

        // Vérifier s'il y a un match mutuel
        $isMutual = MatchModel::where(function($q) use ($userId, $me) {
            $q->where('user_id', $me->id)->where('target_id', $userId);
        })->where('is_mutual', true)->exists();

        // Appliquer le flou si activé et pas de match mutuel
        if ($user->blur_enabled && !$isMutual && $user->id !== $me->id) {
            if ($user->avatar) {
                $user->avatar = $this->cloudinary->getBlurredUrl($user->avatar);
            }
            // Flouter toutes les photos de la galerie
            foreach ($user->photos as $photo) {
                $photo->url = $this->cloudinary->getBlurredUrl($photo->url);
            }
        }

        return Inertia::render('ProfileDetails', [
            'profile' => $user,
            'isMutual' => $isMutual
        ]);
    }

    /**
     * Récupère les profils pour le Discovery Deck.
     */
    public function discovery()
    {
        $me = Auth::user();
        
        // Algorithme de base : Pas encore liké/ignoré, pas soi-même
        $excludeIds = MatchModel::where('user_id', $me->id)->pluck('target_id')->toArray();
        $excludeIds[] = $me->id;

        $profiles = User::whereNotIn('id', $excludeIds)
            ->with(['intention', 'photos'])
            ->limit(10)
            ->get()
            ->map(function($user) {
                // Toujours flouter dans le discovery si blur_enabled
                if ($user->blur_enabled && $user->avatar) {
                    $user->avatar = $this->cloudinary->getBlurredUrl($user->avatar);
                }
                return $user;
            });

        return Inertia::render('Discovery', [
            'initialProfiles' => $profiles
        ]);
    }

    /**
     * Page Explorer / Recherche avec filtres avancés.
     */
    public function explorer(Request $request)
    {
        $me = Auth::user();
        $query = User::with(['intention', 'photos'])->where('id', '!=', $me->id);

        // Filtre par genre
        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }

        // Filtre par tranche d'âge
        if ($request->filled('age_min')) {
            $query->whereRaw('EXTRACT(YEAR FROM AGE(date_of_birth)) >= ?', [$request->age_min]);
        }
        if ($request->filled('age_max')) {
            $query->whereRaw('EXTRACT(YEAR FROM AGE(date_of_birth)) <= ?', [$request->age_max]);
        }

        // Filtre par intention
        if ($request->filled('intention_id')) {
            $query->where('intention_id', $request->intention_id);
        }

        // Recherche textuelle (Nom, Bio, Ville, Intérêts)
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('name', 'ilike', "%$s%")
                  ->orWhere('bio', 'ilike', "%$s%")
                  ->orWhere('city', 'ilike', "%$s%")
                  ->orWhereRaw('interests::text ilike ?', ["%$s%"]);
            });
        }

        // Filtre de proximité (Distance en KM)
        if ($request->filled('distance') && $me->latitude && $me->longitude) {
            $distanceKm = $request->distance;
            $query->whereRaw("ST_DistanceSphere(ST_MakePoint(longitude, latitude), ST_MakePoint(?, ?)) <= ?", [
                $me->longitude, $me->latitude, $distanceKm * 1000
            ]);
        }

        // Calcul de la distance si les coordonnées sont dispos
        if ($me->latitude && $me->longitude) {
            $query->select('*')
                  ->selectRaw("round((ST_DistanceSphere(ST_MakePoint(longitude, latitude), ST_MakePoint(?, ?)) / 1000)::numeric, 1) as distance_km", [
                      $me->longitude, $me->latitude
                  ]);
        }

        $profiles = $query->limit(40)->get()->map(function($user) {
            // Calcul de l'âge réel
            $user->age = $user->date_of_birth ? \Carbon\Carbon::parse($user->date_of_birth)->age : null;
            
            // Flou si activé
            if ($user->blur_enabled && $user->avatar) {
                $user->avatar = $this->cloudinary->getBlurredUrl($user->avatar);
            }
            return $user;
        });

        return Inertia::render('Explorer', [
            'profiles' => $profiles,
            'filters' => $request->all(),
            'intentions' => \App\Models\Intention::all()
        ]);
    }

    /**
     * Page de modification de profil.
     */
    public function edit()
    {
        return Inertia::render('EditProfile', [
            'user' => Auth::user()->load('photos')
        ]);
    }

    /**
     * Enregistre les modifications du profil.
     */
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
        ]);

        $user->update($validated);

        return redirect()->route('profile', 'me')->with('success', 'Profil mis à jour !');
    }

    /**
     * Enregistre les informations de base de l'onboarding.
     */
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

    /**
     * Enregistre l'intention de match.
     */
    public function storeIntentions(Request $request)
    {
        $user = Auth::user();
        
        // On récupère l'ID correspondant au label ou on utilise une map.
        // Ici on suppose que le front envoie des slugs 'mariage', 'decouverte', etc.
        // Il faudrait idéalement une table intentions ou un enum.
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

    /**
     * Enregistre les centres d'intérêt.
     */
    public function storeInterests(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'interests' => 'required|array|min:3|max:5',
        ]);

        $user->update(['interests' => $validated['interests']]);

        return redirect()->route('onboarding.photos');
    }

    /**
     * Enregistre les photos (base64).
     */
    public function storePhotos(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'photos' => 'required|array|min:1',
        ]);

        foreach ($request->photos as $index => $base64) {
            if ($base64) {
                $url = $this->cloudinary->uploadBase64($base64);
                
                // Si c'est la première photo, on l'utilise comme avatar
                if ($index === 0 && !$user->avatar) {
                    $user->update(['avatar' => $url]);
                }

                $user->photos()->create([
                    'url' => $url,
                    'order' => $index
                ]);
            }
        }

        return redirect()->route('discovery');
    }

    /**
     * Récupère la liste des intérêts approuvés.
     */
    public function getInterests()
    {
        return response()->json(\App\Models\Interest::where('is_approved', true)->get());
    }

    /**
     * Propose un nouvel intérêt.
     */
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

    /**
     * Met à jour la position GPS de l'utilisateur.
     */
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
}
