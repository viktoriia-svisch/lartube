<?php
namespace App\Notifications;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
class CommentReceived extends Notification
{
    use Queueable;
    public $comment;
    public function __construct($comment)
    {
        $this->comment = $comment;
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
        'user_id' => $this->comment->user_id,
        'media_id' => $this->comment->media_id,
        'comment_id' => $this->comment->id,
        'body' => $this->comment->body,
    ];
    }
}
