<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $fromId;
    public $toId;

    public function __construct($fromId, $toId)
    {
        $this->fromId = $fromId;
        $this->toId = $toId;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->toId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'user.typing';
    }

    public function broadcastWith(): array
    {
        return [
            'from_id' => $this->fromId,
        ];
    }
}
