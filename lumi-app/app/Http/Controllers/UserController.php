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
     * Page Explorer / Recherche.
     */
    public function explorer(Request $request)
    {
        $query = User::with(['intention', 'photos'])->where('id', '!=', Auth::id());

        // Filtre par recherche texte (Nom ou Bio ou Intérêt via JSON)
        if ($request->has('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                  ->orWhere('bio', 'like', "%$s%")
                  ->orWhere('city', 'like', "%$s%");
            });
        }

        // Filtre par ville
        if ($request->has('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        // Filtre par intention
        if ($request->has('intention_id')) {
            $query->where('intention_id', $request->intention_id);
        }

        $profiles = $query->limit(20)->get();

        return Inertia::render('Explorer', [
            'profiles' => $profiles,
            'filters' => $request->all()
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
}
