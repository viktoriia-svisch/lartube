<?php
namespace App;
use App\User;
use Auth;
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
    public function myLike(){
      $like = Like::where('comment_id', '=',$this->id)->where('user_id',Auth::id())->first();
      if(empty($like)){
        return "0";
      }
      return $like->count;
    }
    public function likes(){
      $likes = Like::where('comment_id', '=',$this->id)->get();
      $counter = 0;
      foreach($likes as $like){
        if($like->count=="1"){
          $counter += 1;
        }
      }
      return $counter;
    }
    public function dislikes(){
      $likes = Like::where('comment_id', '=',$this->id)->get();
      $counter = 0;
      foreach($likes as $like){
        if($like->count=="-1"){
          $counter += 1;
        }
      }
      return $counter;
    }
}
