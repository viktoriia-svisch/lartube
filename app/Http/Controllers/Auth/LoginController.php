<?php
namespace App\Http\Controllers\Auth;
use Illuminate\Http\Request;
use Auth;
use Response;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use App\User;
use App\Http\Resources\User as UserRessource;
use App\Support\Google2FAAuthenticator;
use PragmaRX\Google2FALaravel\Support\Authenticator;
class LoginController extends Controller
{
    use AuthenticatesUsers;
    protected $redirectTo = '/';
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }
    protected function authenticated(Request $request, $user)
{
    if (is_null($user->passwordSecurity)||$user->passwordSecurity->enabled==false) {
      if(!empty($request->input("ajaxLogin"))){
        return new UserRessource(Auth::user());
      }
      return redirect()->intended($this->redirectTo);
    }
    Auth::logout();
    $request->session()->put('user-id', $user->id);
    if(!empty($request->input("ajaxLogin"))){
      return response('{"twofactor":true}', 200);
    }
    $authenticator = app(Google2FAAuthenticator::class)->boot($request);
    return $authenticator->makeRequestOneTimePasswordResponse();
}
    public function logout(Request $request) {
        $this->guard()->logout();
        $request->session()->invalidate();
        (new Authenticator(request()))->logout();
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
      $loginSuccess = false;
      if (Auth::attempt(['email' => $request->input("email"), 'password' => $request->input("password")])) {
        $loginSuccess = true;
      } else {
        if(Auth::attempt(['username' => $request->input("email"), 'password' => $request->input("password")])){
          $loginSuccess = true;
        }
      }
        if ($this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);
            return $this->sendLockoutResponse($request);
        }
        if ($loginSuccess) {
          if(!empty($request->input("ajaxLogin"))){
            $user = Auth::user();
          if (is_null($user->passwordSecurity)||$user->passwordSecurity->enabled==false) {
            return new UserRessource(Auth::user());
          } else {
            Auth::logout();
            $request->session()->put('user-id', $user->id);
              return response('{"twofactor":true}', 200);
          }
        } else {
          return $this->sendLoginResponse($request);
        }
        }
        $this->incrementLoginAttempts($request);
        if(!empty($request->input("ajaxLogin"))){
          return response('{"login":invalid}', 401);
        } else {
          return $this->sendFailedLoginResponse($request);
        }
    }
}
