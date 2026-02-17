<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'bio',
        'intention_id',
        'gender',
        'date_of_birth',
        'credits',
        'blur_enabled',
        'is_verified',
        'interests',
        'latitude',
        'longitude',
        'job',
        'education',
        'height',
        'languages',
        'city',
        'is_ghost_mode',
        'password_changed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be appended to arrays.
     *
     * @var array
     */
    protected $appends = [
        'age',
        'masked_email',
        'avatar_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'interests' => 'array',
            'languages' => 'array',
            'is_ghost_mode' => 'boolean',
            'password_changed_at' => 'datetime',
        ];
    }

    /**
     * Relation avec l'Intention.
     */
    public function intention()
    {
        return $this->belongsTo(Intention::class);
    }

    /**
     * Relation avec les Likes envoyés.
     */
    public function sentLikes()
    {
        return $this->hasMany(MatchModel::class, 'user_id');
    }

    /**
     * Relation avec les Likes reçus.
     */
    public function receivedLikes()
    {
        return $this->hasMany(MatchModel::class, 'target_id');
    }

    /**
     * Tous les Matchs mutuels.
     */
    public function matches()
    {
        return $this->hasMany(MatchModel::class, 'user_id')->where('is_mutual', true);
    }

    /**
     * Messages envoyés.
     */
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'from_id');
    }

    /**
     * Messages reçus.
     */
    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'to_id');
    }

    /**
     * Relation avec les photos de l'utilisateur.
     */
    public function photos()
    {
        return $this->hasMany(UserPhoto::class)->orderBy('order');
    }

    /**
     * Signalements effectués par l'utilisateur.
     */
    public function reportsMade()
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    /**
     * Signalements reçus par l'utilisateur.
     */
    public function reportsReceived()
    {
        return $this->hasMany(Report::class, 'reported_id');
    }

    /**
     * Utilisateurs bloqués par l'utilisateur.
     */
    public function blockedUsers()
    {
        return $this->hasMany(Block::class, 'blocker_id');
    }

    /**
     * Utilisateurs par lesquels l'utilisateur est bloqué.
     */
    public function blockedBy()
    {
        return $this->hasMany(Block::class, 'blocked_id');
    }

    /**
     * FCM Tokens de l'utilisateur.
     */
    public function fcmTokens()
    {
        return $this->hasMany(FcmToken::class);
    }

    /**
     * Vérifie si l'utilisateur est en ligne (dernière activité il y a moins de 5 minutes).
     */
    public function isOnline()
    {
        return $this->updated_at && $this->updated_at->gt(now()->subMinutes(5));
    }

    /**
     * Accesseur pour l'URL de l'avatar.
     */
    public function getAvatarUrlAttribute()
    {
        if (!$this->avatar) {
            return "https://ui-avatars.com/api/?name=" . urlencode($this->name) . "&color=D4AF37&background=101322";
        }
        
        if (strpos($this->avatar, 'http') === 0 || strpos($this->avatar, '/') === 0) {
            return $this->avatar;
        }
    }

    /**
     * Accesseur pour l'email masqué (ex: v...y@gmail.com).
     */
    public function getMaskedEmailAttribute()
    {
        $email = $this->email;
        if (!$email) return '';
        
        $parts = explode('@', $email);
        $name = $parts[0];
        $domain = $parts[1];
        
        $len = strlen($name);
        if ($len <= 2) {
            $maskedName = $name;
        } else {
            $maskedName = substr($name, 0, 1) . str_repeat('.', 3) . substr($name, -1);
        }
        
        return $maskedName . '@' . $domain;
    }

    /**
     * Accesseur pour l'âge.
     */
    public function getAgeAttribute()
    {
        return $this->date_of_birth ? \Carbon\Carbon::parse($this->date_of_birth)->age : null;
    }
}
