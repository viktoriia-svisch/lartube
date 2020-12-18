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
Route::get('/media/{title}', 'MediaController@show')->name('media.show');
Route::get('/directUpload','MediaController@directUploadView')->name('media.directupload');
Route::get('/profileEdit','UserController@selfEdit');
Route::post('/directUpload','MediaController@directUpload');
Route::get('/media','MediaController@index');
