<?php
namespace App;
use App\Media;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;
class User extends Authenticatable
{
  use HasApiTokens, Notifiable;
  use \Conner\Tagging\Taggable;
  use HasRoles;
    protected $fillable = [
        'id','name', 'email', 'password', 'avatar_source', 'background_source'
    ];
    protected $hidden = [
        'password', 'remember_token',
    ];
    public function medias(){
      $media = Media::where('users_id', '=' ,$this->id)->get();
      return $media;
    }
    public function avatar(){
      if(empty($this->avatar_source)){
        return "img/404/avatar.png";
      }
      return $this->avatar_source;
    }
    public function background(){
      if(empty($this->background_source)){
        return "img/404/background.jpg";
      }
      return $this->background_source;
    }
    public function tagString(){
      $string = "";
      foreach($this->tags as $tag) {
        if(!empty($tag)){
        $string .= $tag->name." ";
      }
      }
      return $string;
    }
}
