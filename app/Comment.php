<?php
namespace App;
use App\User;
use Illuminate\Database\Eloquent\Model;
class Comment extends Model
{
    protected $table = 'comments';
    protected $fillable = [
        'id','user_id', 'parent_id', 'media_id', 'body', 'user'
    ];
    public function media() {
      return Media::find($this->media_id);
    }
    public function childs() {
      return Comment::where('parent_id', '=' ,$this->id)->get();
    }
    public function user() {
      return $this->belongsTo('App\User');
    }
}
