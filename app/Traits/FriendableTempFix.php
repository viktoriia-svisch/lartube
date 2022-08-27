<?php
namespace App\Traits;
use Hootlex\Friendships\Models\Friendship;
use Hootlex\Friendships\Models\FriendFriendshipGroups;
use Hootlex\Friendships\Status;
use Hootlex\Friendships\Traits\Friendable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Event;
trait FriendableTempFix
{
    use Friendable;
    public function befriend(Model $recipient)
    {
        if (!$this->canBefriend($recipient)) {
            return false;
        }
        $friendship = (new Friendship)->fillRecipient($recipient)->fill([
            'status' => Status::PENDING,
        ]);
        $this->friends()->save($friendship);
        Event::dispatch('friendships.sent', [$this, $recipient]);
        return $friendship;
    }
    public function unfriend(Model $recipient)
    {
        $deleted = $this->findFriendship($recipient)->delete();
        Event::dispatch('friendships.cancelled', [$this, $recipient]);
        return $deleted;
    }
    public function acceptFriendRequest(Model $recipient)
    {
        $updated = $this->findFriendship($recipient)->whereRecipient($this)->update([
            'status' => Status::ACCEPTED,
        ]);
        Event::dispatch('friendships.accepted', [$this, $recipient]);
        return $updated;
    }
    public function denyFriendRequest(Model $recipient)
    {
        $updated = $this->findFriendship($recipient)->whereRecipient($this)->update([
            'status' => Status::DENIED,
        ]);
        Event::dispatch('friendships.denied', [$this, $recipient]);
        return $updated;
    }
    public function blockFriend(Model $recipient)
    {
        if (!$this->isBlockedBy($recipient)) {
            $this->findFriendship($recipient)->delete();
        }
        $friendship = (new Friendship)->fillRecipient($recipient)->fill([
            'status' => Status::BLOCKED,
        ]);
        $this->friends()->save($friendship);
        Event::dispatch('friendships.blocked', [$this, $recipient]);
        return $friendship;
    }
    public function unblockFriend(Model $recipient)
    {
        $deleted = $this->findFriendship($recipient)->whereSender($this)->delete();
        Event::dispatch('friendships.unblocked', [$this, $recipient]);
        return $deleted;
    }
}
