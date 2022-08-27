<?php
namespace App\Http\Controllers;
use Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\User;
use App\Like;
use Spatie\Permission\Models\Role;
use DB;
use Hash;
use Illuminate\Support\Facades\Storage;
class UserController extends Controller
{
  function __construct()
  {
  }
  public function changeRoles(Request $request){
    if(Auth::user()->level()>(int)config('adminlevel')){
      $slugArray = explode(",",$request->input("roles"));
      $i = 0;
      $tmpArr = array();
      foreach(config('roles.models.role')::all() as $r){
        foreach($slugArray as $s){
        if($s==$r->slug){
          array_push($tmpArr,$r->id);
        }
        }
      }
      $user = config('roles.defaultUserModel')::find($request->input("uid"));
      $user->syncRoles($tmpArr);
      return $this->get($request);
    }
  }
    public function changePassword(Request $request)
    {
      if(Auth::user()->level()>0){
        if(Hash::check($request->input("oldpass"), Auth::user()->password)){
          $user = User::find(Auth::id());
          if($request->input("newpass")==$request->input("newpass2")){
            $user->password = $request->input("newpass");
            $user->save();
            return $this->get($request);
          }
        }
      }
    }  
    public function info(){
      $au = Auth::id();
      return "{ login: ".$au."}";
    }
    public function changeFriends(Request $request)
    {
      $input = $request->all();
      if($input['type']=="request"){
        $friend = User::find($input['users_id']);
        if(Auth::user()->hasFriendRequestFrom($friend)){
          Auth::user()->acceptFriendRequest($friend);
        } else {
          Auth::user()->befriend($friend);
        }
      }
      if($input['type']=="confirm"){
        $friend = User::find($input['users_id']);
        Auth::user()->acceptFriendRequest($friend);
      }
      if($input['type']=="unfriend"){
        $friend = User::find($input['users_id']);
        Auth::user()->unfriend($friend);
      }
    }
    public function mkAdmin(Request $request, $id){
        $user = User::find($id);
        $user->syncPermissions(['admin']);
      return response()->json(["data"=>["msg"=>"mkAdmin!"]],200);
    }
    public function rmAdmin(Request $request, $id){
        $user = User::find($id);
        $user->syncPermissions([]);
      return response()->json(["data"=>["msg"=>"rmAdmin!"]],200);
    }
    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'name' => 'required',
        ]);
        $input = $request->all();
        if(!empty($input['password'])){
            $input['password'] = Hash::make($input['password']);
        }else{
            $input = array_except($input,array('password'));
        }
        $user = User::find($id);
        $user->update($input);
        $avatar = 'public/user/avatars/'.$user->username.'.png';
        $data = $request->input('avatar');
        if(!empty($data)){
          list($type, $data) = explode(';', $data);
          list(, $data)      = explode(',', $data);
          $data = base64_decode($data);
          Storage::put('public/user/avatars/'.$user->username.'.png', $data);
        } else {
          $avatar = '';
        }
        $background = 'public/user/backgrounds/'.$user->username.'.png';
        $data = $request->input('background');
        if(!empty($data)){
          list($type, $data) = explode(';', $data);
          list(, $data)      = explode(',', $data);
          $data = base64_decode($data);
          Storage::put('public/user/backgrounds/'.$user->username.'.png', $data);
        } else {
          $background = '';
        }
        $user->avatar = $avatar;
        $user->background = $background;
        $user->save();
        if(!empty($request->input('roles'))){
          DB::table('model_has_roles')->where('model_id',$id)->delete();
          $user->assignRole($request->input('roles'));
        }
        $tagArrayExtract = explode(' ', $request->input('tags'));
        $tagArray = array();
        foreach($tagArrayExtract as $tag){
          if(starts_with($tag, '#')){
            array_push($tagArray, substr($tag,1));
          } else {
            array_push($tagArray, $tag);
          }
        }
        $user->retag($tagArray);
        return response()->json(["data"=>["msg"=>"User updated"]],200);
    }
    public function destroy($id)
    {
        User::find($id)->delete();
        return response()->json(["data"=>["msg"=>"User deleted"]],200);
    }
}
