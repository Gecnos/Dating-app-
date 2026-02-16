<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPhoto extends Model
{
    protected $fillable = [
        'user_id',
        'url',
        'order',
        'is_primary',
    ];

    /**
     * Relation avec l'utilisateur.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
