<?php
use Illuminate\Http\Request;
use App\Media;
use App\DirectTag;
use App\Http\Resources\Media as MediaResource;
Route::get('/', function () {
    return view('welcome');
});
Auth::routes();
Route::get('/internal-api/info', function () {
    return view('info');
});
Route::get('/home', 'HomeController@index')->name('home');
Route::group(['middleware' => ['auth']], function() {
    Route::resource('roles','RoleController');
    Route::resource('users','UserController');
});
Auth::routes();
Route::post('/user/updateAvatar','UserController@updateAvatar')->name('users.updateAvatar');
Route::put('/user/updateAvatar','UserController@updateAvatar')->name('users.updateAvatar');
Route::put('/user/updateBackground','UserController@updateBackground')->name('users.updateBackground');
Route::get('/media/add','MediaController@addMedia')->name('medias.add');
Route::post('/media/create','MediaController@create')->name('medias.create');
Route::put('/media','MediaController@create')->name('mediaasdasds.create');
Route::get('/media/edit/{title}','MediaController@editView')->name('medias.editView');
Route::post('/media/edit/{title}','MediaController@edit')->name('medias.edit');
Route::get('/media/delete/{title}','MediaController@destroy')->name('medias.delete');
Route::get('/media/{title}', 'MediaController@show')->name('media.show');
Route::get('/tags', 'MediaController@tags')->name('tags');
Route::get('/tags/{tags}', 'MediaController@tagsFilter')->name('tags.filter');
Route::post('/directUpload','MediaController@directUpload')->name('medias.directuploadAjax');
Route::put('/directUpload','MediaController@directUpload');
Route::get('/media','MediaController@index')->name('media');
Route::put('/like','MediaController@like')->name('media.like');
Route::post('/like','MediaController@like')->name('media222.like');
Route::get('/like','MediaController@like')->name('media222.like');
Route::get('/friends','UserController@profile')->name('friends');
Route::get('/profile/edit','UserController@selfEdit')->name('users.selfedit');
Route::get('/profile/{name}','UserController@profileview')->name('profile.view');
Route::put('/friends','UserController@changeFriends')->name('friends');
Route::put('/comment','CommentController@create')->name('comments.add');
Route::post('/comment','CommentController@create')->name('commentsasas.add');
Route::delete('/comment','CommentController@destroy')->name('comments.add');
Route::get('welcome/{locale}', function ($locale) {
    App::setLocale($locale);
});
Route::get('/search', function (Request $request) {
    return App\Media::search($request->search)->get();
});
Route::get('/internal-api/media', function (Request $request) {
    return MediaResource::collection(Media::orderBy('updated_at', 'desc')->whereNotIn('id', explode(",",$request->input('i')))->paginate(3));
});
Route::get('/internal-api/media/all', function (Request $request) {
    return MediaResource::collection(Media::orderBy('created_at', 'desc')->whereNotIn('id', explode(",",$request->input('i')))->get());
});
Route::get('/internal-api/media/search/{title}', function ($title) {
    return MediaResource::collection(Media::where('title', 'LIKE' ,'%'.$title.'%')->orWhere('description', 'LIKE' ,'%'.$title.'%')->whereNotIn('id', explode(",",$request->input('i')))->get());
});
Route::get('/internal-api/media/{title}', function ($title) {
    return new MediaResource(Media::where('title', '=' ,$title)->firstOrFail());
});
