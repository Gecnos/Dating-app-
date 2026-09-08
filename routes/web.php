<?php

use Illuminate\Support\Facades\Route;

// Social Auth Callback (Must be before catch-all)
Route::get('auth/google/callback', [App\Http\Controllers\Auth\GoogleController::class, 'handleGoogleCallback']);

// Route la racine vers l'application SPA
Route::get('/', function () {
    return view('app');
});

// Catch-all pour toutes les autres routes (SPA)
Route::fallback(function () {
    return view('app');
});
