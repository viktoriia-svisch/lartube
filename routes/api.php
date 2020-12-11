<?php
use Illuminate\Http\Request;
Route::post('register', 'API\RegisterController@register');
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
