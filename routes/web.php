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
Route::post('/user/updateAvatar','UserController@updateAvatar')->name('users.updateAvatar');
Route::put('/user/updateAvatar','UserController@updateAvatar')->name('users.updateAvatar');
Route::post('/user/updateBackground','UserController@updateBackground')->name('users.updateBackground');
Route::get('/media/add','MediaController@addMedia')->name('medias.add');
Route::post('/media/create','MediaController@create')->name('medias.create');
Route::get('/media/edit/{title}','MediaController@editView')->name('medias.editView');
Route::post('/media/edit/{title}','MediaController@edit')->name('medias.edit');
Route::get('/media/delete/{title}','MediaController@destroy')->name('medias.delete');
Route::get('/media/{title}', 'MediaController@show')->name('media.show');
Route::get('/profileEdit','UserController@selfEdit')->name('users.selfedit');
Route::post('/directUpload','MediaController@directUpload')->name('medias.directuploadAjax');
Route::get('/media','MediaController@index')->name('media');
Route::put('/comment/add','CommentController@create')->name('comments.add');
Route::get('welcome/{locale}', function ($locale) {
    App::setLocale($locale);
});
