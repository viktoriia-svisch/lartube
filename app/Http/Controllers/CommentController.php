<?php
namespace App\Http\Controllers;
use App\Comment;
use App\Http\Resources\Comment as CommentResource;
use App\Media;
use Auth;
use Illuminate\Http\Request;
class CommentController extends Controller
{
    public function create(Request $request)
    {
        $media = Comment::create(['media_id' =>  $request->input('medias_id'),'user_id' => Auth::id(),'body' => $request->input('body')]);
        return new CommentResource($media);
    }
    public function destroy(Request $request)
    {
        $comment = Comment::where('id', '=' ,$request->input('comments_id'))->firstOrFail();
        if(Auth::id()==$comment->users_id){
          $comment->delete();
          return;
        }
    }
}
