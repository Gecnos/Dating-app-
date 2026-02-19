<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Interest;

class BootstrapController extends Controller
{
    /**
     * Single entry point to load all initial app data.
     */
    public function __invoke(Request $request)
    {
        $user = Auth::user();

        // Load necessary relationships if user exists
        if ($user) {
            // We might want to construct a lightweight user object or use the standard one
            // $user->load('...'); 
        }

        return response()->json([
            'user' => $user,
            'settings' => [
                'theme' => 'system', // ou récupéré depuis la DB
                'version' => '1.0.0',
            ],
            'notifications' => $user ? [
                'unread_messages' => $user->unread_messages_count,
                'unread_likes' => $user->unread_notifications_count, // Adapter si "unread_likes" est différent
            ] : null,
            'app_config' => [
                'pusher_key' => config('broadcasting.connections.pusher.key'),
                'reverb_host' => env('VITE_REVERB_HOST'),
                'reverb_port' => env('VITE_REVERB_PORT'),
                'features' => [
                    'premium_enabled' => true,
                    'ghost_mode_enabled' => true,
                ]
            ]
        ]);
    }
}
