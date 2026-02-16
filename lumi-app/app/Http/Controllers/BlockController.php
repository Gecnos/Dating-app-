<?php

namespace App\Http\Controllers;

use App\Models\Block;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BlockController extends Controller
{
    /**
     * Liste des utilisateurs bloqués par l'utilisateur.
     */
    public function index()
    {
        $blocks = Block::with('blocked')
            ->where('blocker_id', Auth::id())
            ->latest()
            ->get();

        return response()->json($blocks);
    }

    /**
     * Bloquer un utilisateur.
     */
    public function store(Request $request)
    {
        $request->validate([
            'blocked_id' => 'required|exists:users,id',
        ]);

        if ($request->blocked_id == Auth::id()) {
            return response()->json(['message' => 'Vous ne pouvez pas vous bloquer vous-même.'], 422);
        }

        $block = Block::firstOrCreate([
            'blocker_id' => Auth::id(),
            'blocked_id' => $request->blocked_id,
        ]);

        return response()->json($block, 201);
    }

    /**
     * Débloquer un utilisateur.
     */
    public function destroy(User $user)
    {
        Block::where('blocker_id', Auth::id())
            ->where('blocked_id', $user.id)
            ->delete();

        return response()->json(null, 204);
    }
}
