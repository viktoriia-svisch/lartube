<?php
namespace App\Http\Controllers\Auth;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\User;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Support\Facades\Storage;
use App\UserSettings;
use App\Http\Resources\UserSettings as UserSettingsRessource;
class RegisterController extends Controller
{
    use RegistersUsers;
    protected $redirectTo = '/';
    public function __construct()
    {
        $this->middleware('guest');
    }
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);
    }
    public function register(Request $request)
    {
      if(config("app.auth")=="local"){
        $this->validator($request->all())->validate();
        $user = User::create($request->except(['avatar','background','_token']));
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
        $user->password = Hash::make($request->input('password'));
        $user->save();
        $this->guard()->login($user);
        return new UserSettingsRessource(UserSettings::firstOrCreate(['user_id' => Auth::id()]));
      } else {
        return response('{"auth":notallowed}', 401);
      }
    }
    protected function guard()
    {
        return Auth::guard();
    }
    protected function registered(Request $request, $user)
    {
    }
}
