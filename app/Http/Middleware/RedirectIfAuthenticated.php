<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Support\Facades\Auth;
use App\UserSettings;
use App\Http\Resources\UserSettings as UserSettingsRessource;
class RedirectIfAuthenticated
{
    public function handle($request, Closure $next, $guard = null)
    {
        if (!empty(Auth::id())) {
          UserSettings::firstOrCreate(['user_id' => Auth::id()]);
          return new UserSettingsRessource(UserSettings::where('user_id', '=' ,Auth::id())->firstOrFail());
        }
        return $next($request);
    }
}
