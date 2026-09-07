<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Ces routes ne passent PAS par le middleware Inertia.
| Elles sont parfaites pour le polling et les requêtes AJAX.
|
*/

// Auth
Route::post('/login', [App\Http\Controllers\Auth\LoginController::class, 'login']);
Route::post('/register', [App\Http\Controllers\Auth\LoginController::class, 'register']);
Route::post('/password/forgot', [App\Http\Controllers\Auth\LoginController::class, 'forgotPassword']);
Route::post('/password/reset', [App\Http\Controllers\Auth\LoginController::class, 'resetPassword']);
Route::middleware('auth:sanctum')->post('/logout', [App\Http\Controllers\Auth\LoginController::class, 'logout']); // Fixing logout here as well to use Sanctum middleware if not already present, though "auth:sanctum" is correct.

// Email verification: soft/non-blocking — no `verified` middleware is applied
// anywhere, this only powers the dismissible banner + resend button.
Route::middleware(['auth:sanctum', 'throttle:3,1'])->post('/email/resend', [App\Http\Controllers\Auth\LoginController::class, 'resendVerificationEmail']);
Route::get('/email/verify/{id}/{hash}', [App\Http\Controllers\Auth\LoginController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('verification.verify');

Route::get('/auth/google/url', [App\Http\Controllers\Auth\GoogleController::class, 'redirectToGoogle']);
// Google redirects to auth/google/callback (registered in web.php), which then
// redirects the browser to /auth/callback?token=... — a frontend SPA route
// (resources/js/Pages/Auth/AuthCallback.jsx) that finishes login client-side.
// That path must NOT be registered here too, or it shadows the SPA route and
// the callback controller ends up calling itself with no OAuth code, breaking
// Google login every time.

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Illuminate\Http\Request $request) {
        return $request->user();
    });
    
    // Bootstrap (Combo Init) - Private Cache 1 min
    Route::middleware('cache.control:private,60')->get('/bootstrap', App\Http\Controllers\BootstrapController::class);

    // Chat List - No Cache (Realtime)
    Route::middleware('cache.control:private,0')->get('/chat', [ChatController::class, 'list']);
    
    // User API
    Route::post('/user/location', [App\Http\Controllers\UserController::class, 'updateLocation']);
    Route::post('/user/ghost-mode', [App\Http\Controllers\UserController::class, 'toggleGhostMode']);
    // Counts - Private Cache 30s
    Route::middleware('cache.control:private,30')->get('/user/counts', [App\Http\Controllers\UserController::class, 'counts']);
    Route::post('/fcm-token', [App\Http\Controllers\UserController::class, 'updateFcmToken']);
    // Discovery - Private Cache 10 mins (600s)
    Route::middleware('cache.control:private,600')->get('/discovery', [App\Http\Controllers\UserController::class, 'discovery']);
    Route::get('/explorer', [App\Http\Controllers\UserController::class, 'explorer']);
    Route::get('/profile/edit', [App\Http\Controllers\UserController::class, 'edit']);
    Route::post('/profile/update', [App\Http\Controllers\UserController::class, 'update']);
    Route::get('/user/{id}', [App\Http\Controllers\UserController::class, 'show']);

    // Photo Management
    Route::get('/photos/manage', [App\Http\Controllers\UserController::class, 'photoManagement']);
    Route::post('/photos/add', [App\Http\Controllers\UserController::class, 'addPhoto'])->name('photos.add');
    Route::delete('/photos/{id}', [App\Http\Controllers\UserController::class, 'deletePhoto'])->name('photos.delete');
    Route::post('/photos/reorder', [App\Http\Controllers\UserController::class, 'reorderPhotos'])->name('photos.reorder');
    
    // Onboarding
    Route::post('/onboarding/basic', [App\Http\Controllers\UserController::class, 'storeBasicInfo']);
    Route::post('/onboarding/intentions', [App\Http\Controllers\UserController::class, 'storeIntentions']);
    Route::post('/onboarding/interests', [App\Http\Controllers\UserController::class, 'storeInterests']);
    Route::post('/onboarding/photos', [App\Http\Controllers\UserController::class, 'storePhotos']);

    // Interests - Public Cache 1 day (86400s)
    Route::middleware('cache.control:public,86400')->get('/interests', [App\Http\Controllers\UserController::class, 'getInterests']);
    Route::post('/interests/suggest', [App\Http\Controllers\UserController::class, 'suggestInterest']);
    
    // Security
    Route::get('/security/info', [App\Http\Controllers\SecurityController::class, 'getSecurityInfo']);
    Route::post('/security/password', [App\Http\Controllers\SecurityController::class, 'updatePassword'])->name('security.password.update');
    Route::delete('/user/delete', [App\Http\Controllers\UserController::class, 'destroy'])->name('user.destroy');

    // Swipe & Matches
    Route::post('/swipe', [App\Http\Controllers\MatchController::class, 'swipe'])->name('api.swipe');
    Route::get('/matches', [App\Http\Controllers\MatchController::class, 'index']); // Added this

    
    // Reports & Blocks
    Route::get('/reports', [App\Http\Controllers\ReportController::class, 'index']);
    Route::post('/reports', [App\Http\Controllers\ReportController::class, 'store']);
    Route::get('/blocks', [App\Http\Controllers\BlockController::class, 'index']);
    Route::post('/blocks', [App\Http\Controllers\BlockController::class, 'store']);
    Route::delete('/blocks/{user}', [App\Http\Controllers\BlockController::class, 'destroy']);
    
    // Messaging
    Route::get('/chat', [ChatController::class, 'list']);
    Route::get('/chat/{user}', [ChatController::class, 'show']);
    Route::get('/messages/{user}', [ChatController::class, 'fetchMessages']);
    Route::post('/messages', [ChatController::class, 'store']);
    Route::get('/messages/unread/count', [ChatController::class, 'getUnreadCount']); // Check if this exists
    
    // Notifications
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [App\Http\Controllers\NotificationController::class, 'destroy']);

    // Broadcasting Auth
    Route::post('/broadcasting/auth', function (Illuminate\Http\Request $request) {
        return Broadcast::auth($request);
    });
});

