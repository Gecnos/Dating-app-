<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ChatController;

use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('SplashScreen');
});

Route::get('auth/google', [GoogleController::class, 'redirectToGoogle'])->name('google.login');
Route::get('auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

Route::get('/login', [LoginController::class, 'showLink'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::get('/register', [LoginController::class, 'showRegister'])->name('register');
Route::post('/register', [LoginController::class, 'register']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::get('/onboarding/basic', function () {
    return Inertia::render('Onboarding/BasicInformation');
})->name('onboarding.basic');
Route::post('/onboarding/basic', [UserController::class, 'storeBasicInfo']);
Route::post('/onboarding/intentions', [UserController::class, 'storeIntentions']);
Route::post('/onboarding/interests', [UserController::class, 'storeInterests']);
Route::post('/onboarding/photos', [UserController::class, 'storePhotos']);

Route::get('/onboarding/intentions', function () {
    return Inertia::render('Onboarding/MatchingIntentions');
})->name('onboarding.intentions');

Route::get('/onboarding/interests', function () {
    return Inertia::render('Onboarding/InterestsSelection');
})->name('onboarding.interests');

Route::get('/onboarding/photos', function () {
    return Inertia::render('Onboarding/PhotoGallery');
})->name('onboarding.photos');

Route::get('/discovery', [UserController::class, 'discovery'])->name('discovery');

Route::get('/my-profile', function () {
    return Inertia::render('Profile', [
        'user' => Auth::user()
    ]);
})->middleware(['auth'])->name('my.profile');

// IMPORTANT: profile/edit MUST be before profile/{id} to avoid route conflict
Route::get('/profile/edit', [UserController::class, 'edit'])->middleware(['auth'])->name('profile.edit');
Route::post('/profile/update', [UserController::class, 'update'])->middleware(['auth'])->name('profile.update');

Route::get('/profile/{id}', [UserController::class, 'show'])->name('profile');

Route::post('/api/swipe', [MatchController::class, 'swipe'])->name('swipe');

Route::get('/credits', function () {
    return Inertia::render('CreditsVIP');
})->name('credits');

Route::middleware(['auth'])->group(function () {
    Route::get('/chat', [ChatController::class, 'list'])->name('chat');
    Route::get('/chat/{user_id}', [ChatController::class, 'index'])->name('chat.show');
    
    Route::get('/likes', [MatchController::class, 'index'])->name('likes');
    Route::get('/explorer', [UserController::class, 'explorer'])->name('explorer');
    Route::get('/notifications', function () {
        return Inertia::render('Notifications');
    })->name('notifications');
    Route::get('/profile/edit', [UserController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/update', [UserController::class, 'update'])->name('profile.update');
    
    Route::get('/match-success/{user2}', function ($user2) {
        return Inertia::render('MatchSuccess', [
            'user1' => Auth::user(),
            'user2' => \App\Models\User::find($user2)
        ]);
    })->name('match.success');

    Route::get('/api/messages/{user_id}', [ChatController::class, 'index']);
    Route::post('/api/messages', [ChatController::class, 'store']);
});

Route::prefix('admin')->middleware(['auth'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'stats'])->name('admin.dashboard');
    Route::get('/verify', [AdminController::class, 'index'])->name('admin.verify');
    Route::post('/verify/{id}', [AdminController::class, 'verify'])->name('admin.verify.action');
});
