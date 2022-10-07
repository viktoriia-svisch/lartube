<?php
namespace App\Http\Controllers\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
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
}
