<?php
Route::get('/', function () {
    return view('welcome');
});
Auth::routes();
Route::get('/home', 'HomeController@index')->name('home');
Route::group(['middleware' => ['auth']], function() {
    Route::resource('roles','RoleController');
    Route::resource('users','UserController');
});
Auth::routes();
Route::get('/home', 'HomeController@index')->name('home');
Route::get('/directUpload','MediaController@index');
Route::get('/profileEdit','UserController@selfEdit');
Route::post('/directUpload','MediaController@directUpload');
