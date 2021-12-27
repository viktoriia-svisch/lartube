<?php
namespace App\Notifications;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
class LikeReceived extends Notification
{
    use Queueable;
    public $like;
    public function __construct($like)
    {
        $this->like = $like;
    }
    public function via($notifiable)
    {
        return ['database'];
    }
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->line('The introduction to the notification.')
                    ->action('Notification Action', url('/'))
                    ->line('Thank you for using our application!');
    }
    public function toArray($like)
    {
        return [
        'user_id' => $this->like->user_id,
        'media_id' => $this->like->media_id,
        'comment_id' => $this->like->comment_id,
        'like' => $this->like->count,
    ];
    }
}
