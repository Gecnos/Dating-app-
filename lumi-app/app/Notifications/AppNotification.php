<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppNotification extends Notification
{
    use Queueable;

    private $type;
    private $title;
    private $content;
    private $icon;
    private $color;
    private $url;

    /**
     * Create a new notification instance.
     */
    public function __construct($type, $title, $content, $url = '/', $icon = 'notifications', $color = '#D4AF37')
    {
        $this->type = $type;
        $this->title = $title;
        $this->content = $content;
        $this->url = $url;
        $this->icon = $icon;
        $this->color = $color;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->type,
            'title' => $this->title,
            'content' => $this->content,
            'url' => $this->url,
            'icon' => $this->icon,
            'color' => $this->color
        ];
    }
}
