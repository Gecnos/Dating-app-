<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class LoginController extends Controller
{
    /**
     * Gère la connexion par email via API.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Connexion réussie',
                'onboarding_step' => $this->getOnboardingStep($user)
            ]);
        }

        return response()->json([
            'message' => 'Les identifiants ne correspondent pas à nos enregistrements.',
            'errors' => ['email' => ['Identifiants incorrects']]
        ], 422);
    }

    private function getOnboardingStep($user) {
        if (!$user->gender || !$user->date_of_birth) return 'basic';
        if (!$user->intention_id) return 'intentions';
        if (empty($user->interests) || count($user->interests) < 3) return 'interests';
        if (!$user->avatar) return 'photos';
        return 'completed';
    }

    /**
     * Gère l'inscription via API.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Direct call rather than firing the Registered event: this app has
        // no EventServiceProvider/listener wiring it up (Laravel 11 style
        // bootstrap/app.php), so the event would silently do nothing.
        $user->sendEmailVerificationNotification();

        Auth::login($user);
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Inscription réussie',
            'onboarding_step' => 'basic'
        ], 201);
    }

    /**
     * Renvoie l'email de vérification (throttled côté route).
     */
    public function resendVerificationEmail(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email de vérification envoyé.']);
    }

    /**
     * Lien de vérification signé cliqué depuis l'email — ne bloque jamais
     * l'accès à l'app, marque juste email_verified_at si valide.
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return redirect('/email-verified?status=invalid');
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return redirect('/email-verified?status=success');
    }

    /**
     * Envoie un lien de réinitialisation de mot de passe par email.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        Password::sendResetLink($request->only('email'));

        // Réponse générique dans tous les cas, pour ne pas révéler
        // quels emails sont enregistrés.
        return response()->json([
            'message' => 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
        ]);
    }

    /**
     * Réinitialise le mot de passe à partir du token reçu par email.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
        }

        return response()->json([
            'message' => 'Ce lien de réinitialisation est invalide ou a expiré.',
            'errors' => ['email' => ['Lien invalide ou expiré.']]
        ], 422);
    }

    /**
     * Déconnexion API.
     */
    public function logout(Request $request)
    {
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }
}
