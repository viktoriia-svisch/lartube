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
  use HasRoles;
    protected $fillable = [
        'id','name', 'email', 'password', 'avatar_source', 'background_source'
    ];
    protected $hidden = [
        'password', 'remember_token',
    ];
    public function tags() {
      return $this->belongsToMany('App\Tags');
    }
    public function medias(){
      $media = Media::where('users_id', '=' ,$this->id)->get();
      return $media;
    }
}
