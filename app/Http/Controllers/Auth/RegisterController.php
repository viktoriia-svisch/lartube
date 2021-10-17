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
        $this->validator($request->all())->validate();
        $user = User::create($request->all());
        $avatar_source = 'public/user/avatars/'.$user->name.'.png';
        $data = $request->input('avatar');
        if(!empty($data)){
          list($type, $data) = explode(';', $data);
          list(, $data)      = explode(',', $data);
          $data = base64_decode($data);
          Storage::put('public/user/avatars/'.$user->name.'.png', $data);
        } else {
          $avatar_source = '';
        }
        $background_source = 'public/user/backgrounds/'.$user->name.'.png';
        $data = $request->input('background');
        if(!empty($data)){
          list($type, $data) = explode(';', $data);
          list(, $data)      = explode(',', $data);
          $data = base64_decode($data);
          Storage::put('public/user/backgrounds/'.$user->name.'.png', $data);
        } else {
          $background_source = '';
        }
        $user->avatar_source = $avatar_source;
        $user->background_source = $background_source;
        $user->save();
        $this->guard()->login($user);
        return $this->registered($request, $user)
                       ?: redirect($this->redirectPath());
    }
    protected function guard()
    {
        return Auth::guard();
    }
    protected function registered(Request $request, $user)
    {
    }
}
