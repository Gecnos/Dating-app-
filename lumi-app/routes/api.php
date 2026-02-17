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

Route::middleware('auth')->group(function () {
    // User API
    Route::post('/user/location', [App\Http\Controllers\UserController::class, 'updateLocation']);
    Route::post('/user/ghost-mode', [App\Http\Controllers\UserController::class, 'toggleGhostMode']);
    
    // Interests
    Route::get('/interests', [App\Http\Controllers\UserController::class, 'getInterests']);
    Route::post('/interests/suggest', [App\Http\Controllers\UserController::class, 'suggestInterest']);
    
    // Swipe
    Route::post('/swipe', [App\Http\Controllers\MatchController::class, 'swipe'])->name('api.swipe');
    
    // Reports & Blocks
    Route::get('/reports', [App\Http\Controllers\ReportController::class, 'index']);
    Route::post('/reports', [App\Http\Controllers\ReportController::class, 'store']);
    Route::get('/blocks', [App\Http\Controllers\BlockController::class, 'index']);
    Route::post('/blocks', [App\Http\Controllers\BlockController::class, 'store']);
    Route::delete('/blocks/{user}', [App\Http\Controllers\BlockController::class, 'destroy']);
    
    // Messages
    Route::post('/messages', [ChatController::class, 'store']);
    
    // Récupération des messages
    Route::get('/messages/history/{user_id}', [ChatController::class, 'getMessages']);
    
    // Notifications
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [App\Http\Controllers\NotificationController::class, 'destroy']);
    
    // Récupération des notifications récentes
    Route::get('/notifications/latest', [App\Http\Controllers\NotificationController::class, 'getLatest']);
    
    // Nombre de messages non lus (initial load)
    Route::get('/messages/unread-count', [ChatController::class, 'getUnreadCount']);
});

