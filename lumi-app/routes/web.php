<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\BlockController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SecurityController;

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

Route::get('/onboarding/basic', function () {
    return Inertia::render('Onboarding/BasicInformation');
})->name('onboarding.basic');
Route::post('/onboarding/basic', [UserController::class, 'storeBasicInfo']);
Route::post('/onboarding/intentions', [UserController::class, 'storeIntentions']);
Route::post('/onboarding/interests', [UserController::class, 'storeInterests']);
Route::post('/onboarding/photos', [UserController::class, 'storePhotos']);
Route::get('/api/interests', [UserController::class, 'getInterests']);
Route::post('/api/interests/suggest', [UserController::class, 'suggestInterest'])->middleware('auth');

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

Route::get('/profile/{id}', [UserController::class, 'show'])->name('profile')->where('id', '[0-9]+|me');

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

    Route::get('/settings', function () {
        return Inertia::render('Settings');
    })->name('settings');

    Route::get('/settings/blocked', function () {
        return Inertia::render('BlockedUsers');
    })->name('settings.blocked');

    Route::get('/settings/reports', function () {
        return Inertia::render('ReportedUsers');
    })->name('settings.reports');

    Route::get('/profile/edit', [UserController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/update', [UserController::class, 'update'])->name('profile.update');
    Route::delete('/profile/destroy', [UserController::class, 'destroy'])->name('user.destroy');

    Route::get('/help', function () {
        return Inertia::render('Help');
    })->name('help');

    Route::get('/legal/terms', function () {
        return Inertia::render('Legal/Terms');
    })->name('legal.terms');

    Route::get('/legal/privacy', function () {
        return Inertia::render('Legal/Privacy');
    })->name('legal.privacy');
    
    Route::get('/match-success/{user2}', function ($user2) {
        return Inertia::render('MatchSuccess', [
            'user1' => Auth::user(),
            'user2' => \App\Models\User::find($user2)
        ]);
    })->name('match.success');

    Route::get('/my-profile', function () {
        return Inertia::render('Profile', [
            'user' => Auth::user()->load('photos')
        ]);
    })->name('my.profile');

    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

    Route::post('/api/user/location', [UserController::class, 'updateLocation'])->name('user.location');
    Route::post('/api/user/ghost-mode', [UserController::class, 'toggleGhostMode'])->name('user.ghost-mode');

    // Signalements et Blocages
    Route::get('/api/reports', [ReportController::class, 'index']);
    Route::post('/api/reports', [ReportController::class, 'store']);
    Route::get('/api/blocks', [BlockController::class, 'index']);
    Route::post('/api/blocks', [BlockController::class, 'store']);
    Route::delete('/api/blocks/{user}', [BlockController::class, 'destroy']);

    Route::get('/api/messages/{user_id}', [ChatController::class, 'index']);
    Route::get('/api/messages/{user_id}/fetch', [ChatController::class, 'fetchMessages']);
    Route::post('/api/messages', [ChatController::class, 'store']);

    Route::get('/api/notifications', [NotificationController::class, 'index']);
    Route::post('/api/notifications/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/api/notifications/{id}', [NotificationController::class, 'destroy']);

    Route::get('/api/security/info', [SecurityController::class, 'getSecurityInfo']);
    Route::post('/api/security/password', [SecurityController::class, 'updatePassword'])->name('security.password.update');

    Route::get('/photos/manage', [UserController::class, 'photoManagement'])->name('photos.manage');
    Route::post('/api/photos', [UserController::class, 'addPhoto'])->name('photos.add');
    Route::delete('/api/photos/{id}', [UserController::class, 'deletePhoto'])->name('photos.delete');
    Route::post('/api/photos/reorder', [UserController::class, 'reorderPhotos'])->name('photos.reorder');
});

Route::prefix('admin')->middleware(['auth'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'stats'])->name('admin.dashboard');
    Route::get('/verify', [AdminController::class, 'index'])->name('admin.verify');
    Route::post('/verify/{id}', [AdminController::class, 'verify'])->name('admin.verify.action');
});
