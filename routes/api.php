<?php
use Illuminate\Http\Request;
Route::post('register', 'API\RegisterController@register');
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
use App\User;
use App\Http\Resources\User as UserResource;
Route::get('/user', function () {
    return UserResource::collection(User::all());
});
Route::get('/user/{id}', function ($id) {
    return new UserResource(User::find($id));
});
use App\Media;
use App\Http\Resources\Media as MediaResource;
use App\Http\Resources\Tag as TagResource;
Route::get('/media', function () {
    return MediaResource::collection(Media::orderBy('created_at', 'desc')->paginate(3));
});
Route::get('/media/not/{title}', function ($title) {
    return MediaResource::collection(Media::where('title', '!=' ,$title)->paginate(12));
});
Route::get('/media/{title}', function ($title) {
    return new MediaResource(Media::where('title', '=' ,$title)->firstOrFail());
});
Route::get('/tags', function () {
    $tags = Media::existingTags();
    return TagResource::collection($tags);
});
Route::get('/tags/{tags}', function (Request $request,$tags) {
  $tagArrayExtract = explode(' ', $tags);
  $tagArray = array();
  foreach($tagArrayExtract as $tag){
    if(starts_with($tag, '#')){
      array_push($tagArray, substr($tag,1));
    } else {
      array_push($tagArray, $tag);
    }
  }
  if($request->input('tagsCombine')=="true"){
    $medias = Media::withAllTags($tagArray)->paginate(12);
  } else {
    $medias = Media::withAnyTag($tagArray)->paginate(12);
  }
    return MediaResource::collection($medias);
});
use App\Comment;
use App\Http\Resources\Comment as CommentResource;
Route::get('/comment', function () {
    return CommentResource::collection(Comment::orderBy('created_at', 'desc')->paginate(10));
});
Route::get('/comment/{mediaId}', function ($mediaId) {
    return CommentResource::collection(Comment::where('media_id', '=' ,$mediaId)->orderBy('created_at', 'desc')->paginate(10));
});
