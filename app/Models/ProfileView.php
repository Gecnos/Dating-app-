<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfileView extends Model
{
    use HasFactory;

    protected $fillable = [
        'viewer_id',
        'viewed_id',
        'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    public function viewer()
    {
        return $this->belongsTo(User::class, 'viewer_id');
    }

    public function viewed()
    {
        return $this->belongsTo(User::class, 'viewed_id');
    }
}
