<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Intention extends Model
{
    use HasFactory;

    protected $fillable = [
        'label',
        'slug',
        'color_badge',
        'icon',
        'description',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
