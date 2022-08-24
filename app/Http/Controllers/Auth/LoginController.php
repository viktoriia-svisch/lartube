<?php
namespace App\Http\Controllers\Auth;
use Illuminate\Http\Request;
use Auth;
use Response;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use App\UserSettings;
use App\Http\Resources\UserSettings as UserSettingsRessource;
class LoginController extends Controller
{
    use AuthenticatesUsers;
    protected $redirectTo = '/';
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }
    public function logout(Request $request) {
        $this->guard()->logout();
        $request->session()->invalidate();
        if($request->ajax()) {
            return Response::json(array(
                'success' => true,
                'data'   => 'Logout success'
            ));
        }
        else {
          return Response::json(array(
              'success' => false,
              'data'   => 'Logout failed'
          ));
        }
    }
    public function login(Request $request)
    {
        $this->validateLogin($request);
        if ($this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);
            return $this->sendLockoutResponse($request);
        }
        if ($this->attemptLogin($request)) {
          UserSettings::firstOrCreate(['user_id' => Auth::id()]);
          if(!empty($request->input("ajaxLogin"))){
            return new UserSettingsRessource(UserSettings::where('user_id', '=' ,Auth::id())->firstOrFail());
          }
          return $this->sendLoginResponse($request);
        }
        $this->incrementLoginAttempts($request);
        return $this->sendFailedLoginResponse($request);
    }
}
