<?php
namespace App\Http\Controllers\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
class LoginController extends Controller
{
    use AuthenticatesUsers;
    protected $redirectTo = '/';
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }
public function login2(Request $request)
{
    $this->validateLogin($request);
    if ($this->attemptLogin($request)) {
        $user = $this->guard()->user();
        $user->generateToken();
        return response()->json([
            'data' => $user->toArray(),
        ]);
    }
    return $this->sendFailedLoginResponse($request);
}
}
