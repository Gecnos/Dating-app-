<?php

namespace App\Http\Controllers;

use App\Models\FcmToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FcmController extends Controller
{
    /**
     * Store or update FCM token for the authenticated user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'device_type' => 'nullable|string|in:web,ios,android',
        ]);

        FcmToken::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'token' => $request->token,
            ],
            [
                'device_type' => $request->device_type ?? 'web',
            ]
        );

        return response()->json(['message' => 'Token saved successfully']);
    }

    /**
     * Remove FCM token (logout/disconnect).
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        FcmToken::where('user_id', Auth::id())
            ->where('token', $request->token)
            ->delete();

        return response()->json(['message' => 'Token deleted successfully']);
    }
}
