<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class MatchNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $match;
    public $matchedUser;

    /**
     * Create a new event instance.
     */
    public function __construct($match, User $matchedUser)
    {
        $this->match = $match;
        $this->matchedUser = $matchedUser;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->match->user_id),
            new PrivateChannel('user.' . $this->match->target_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'match.created';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'match_id' => $this->match->id,
            'matched_user' => [
                'id' => $this->matchedUser->id,
                'name' => $this->matchedUser->name,
                'avatar' => $this->matchedUser->avatar,
            ],
        ];
    }
}
