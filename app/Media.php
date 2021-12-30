<?php
namespace App;
use App\User;
use App\Comment;
use App\Like;
use App\Track;
use Auth;
use Laravel\Scout\Searchable;
use Illuminate\Database\Eloquent\Model;
class Media extends Model
{
    use \Conner\Tagging\Taggable;
    use Searchable;
    protected $fillable = [
        'id', 'title', 'source','duration','poster_source', 'type', 'description', 'user_id','category_id','comments', 'category_id','next_id'
    ];
    protected $hidden = [
    ];
    protected $table = 'medias';
    public function user() {
      return User::find($this->user_id);
    }
    public function category() {
      return Category::find($this->category_id);
    }
    public function tracks() {
      return Track::where("media_id","=",$this->id)->get();
    }
    public function comments() {
      $comments = Comment::where('media_id', '=' ,$this->id)->where("parent_id","=","0")->get()->sortByDesc('created_at');
      return $comments;
    }
    public function likeObjects() {
      return Like::where('media_id', '=',$this->id)->get();
    }
    public function myLike($request){
      $like = Like::where('media_id', '=',$this->id)->where('user_id',Auth::id())->first();
      if(empty($like)){
        return "0";
      }
      return $like->count;
    }
    public function likes(){
      $likes = Like::where('media_id', '=',$this->id)->get();
      $counter = 0;
      foreach($likes as $like){
        if($like->count=="1"){
          $counter += 1;
        }
      }
      return $counter;
    }
    public function dislikes(){
      $likes = Like::where('media_id', '=',$this->id)->get();
      $counter = 0;
      foreach($likes as $like){
        if($like->count=="-1"){
          $counter += 1;
        }
      }
      return $counter;
    }
    public function poster(){
      if(empty($this->poster_source)){
        return url("/")."/"."img/404/poster.png";
      }
      return url("/")."/".$this->poster_source;
    }
    public function simpleType(){
      if(($this->type=="directAudio")||($this->type=="localAudio")||($this->type=="torrentAudio")) {
        return "audio";
      }
      return "video";
    }
    public function techType(){
      if(($this->type=="torrentAudio")||($this->type=="torrentVideo")) {
        return "torrent";
      } else if(($this->type=="directAudio")||($this->type=="localAudio")) {
        return "audio";
      }
      return "video";
    }
    public function tagString(){
      $string = "";
      foreach($this->tags as $tag) {
        if($tag!=NULL){
        $string .= $tag->name." ";
      }
    }
      return $string;
    }
}
