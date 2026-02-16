<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    /**
     * Liste des signalements effectués par l'utilisateur.
     */
    public function index()
    {
        $reports = Report::with('reported')
            ->where('reporter_id', Auth::id())
            ->latest()
            ->get();

        return response()->json($reports);
    }

    /**
     * Signaler un utilisateur.
     */
    public function store(Request $request)
    {
        $request->validate([
            'reported_id' => 'required|exists:users,id',
            'reason' => 'required|string',
            'description' => 'nullable|string',
        ]);

        if ($request->reported_id == Auth::id()) {
            return response()->json(['message' => 'Vous ne pouvez pas vous signaler vous-même.'], 422);
        }

        $report = Report::create([
            'reporter_id' => Auth::id(),
            'reported_id' => $request->reported_id,
            'reason' => $request->reason,
            'description' => $request->description,
        ]);

        return response()->json($report, 201);
    }
}
