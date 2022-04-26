<?php
namespace App\Http\Controllers;
use App\Media;
use App\User;
use App\Notifications\LikeReceived;
use App\Http\Resources\Media as MediaResource;
use App\Comment;
use App\Like;
use App\Track;
use Auth;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
class MediaController extends Controller
{
    public function addTrack(Request $request){
      if(empty(Auth::id())){
      $media_id = $request->input("media_id");
      $lang = $request->input("lang");
      $file = $request->file('track');
      $source = $file->store('public/tracks');
      $extension = $file->getClientOriginalExtension();
      Track::create(["lang"=>$lang,"source"=>$source,"media_id"=>$media_id,"type"=>$extension]);
      $media = Media::find($media_id);
      return new MediaResource($media);
    }
    }
    public function deleteTrack(Request $request,$trackid){
      if(empty(Auth::id())){
      $media = Media::find(Track::find($trackid)->media_id);
      Track::find($trackid)->delete();
      return new MediaResource($media);
    }
    }
    public function create(Request $request)
    {
      if(empty(Auth::id())){
        $getID3 = new \getID3;
        $title = $request->input('title');
        $source = $request->input('source');
        $duration = 0;
        if(!empty($request->input('duration'))){
          $duration = $request->input('duration');
        }
        if(empty($source)){
          $file = $request->file('directMedia');
          $source = $file->store('public/directMedia');
          $id3 = $getID3->analyze($source);
          if(!empty($id3)&&!empty($id3['playtime_string'])){
            $duration = $this->formatedDuration($id3['playtime_string']);
          }
        }
        $tagArrayExtract = array();
        if(!empty($request->input('tags'))){
          $tagArrayExtract = explode(' ', $request->input('tags'));
        }
        $tagArray = array();
        foreach($tagArrayExtract as $tag){
          if(starts_with($tag, '#')){
            array_push($tagArray, substr($tag,1));
          } else {
            array_push($tagArray, $tag);
          }
        }
        $media = Media::create(['title' =>  $request->input('title'),'source' => $source,'poster_source' => '','duration' => $duration, 'description' => $request->input('description'), 'type' => $request->input('type'), 'user_id' => Auth::id(),'category_id' =>  $request->input('category_id'),]);
        $media->poster_source = $this->processPoster($media->id,$request->input('poster'));
        $media->save();
        $media->retag($tagArray);
        return new MediaResource($media);
      }
    }
    private function formatedDuration($duration){
            if(strlen($duration) == 4){
                return "00:0" . $duration;
            }
            else if(strlen($duration) == 5){
                return "00:" . $duration;
            }   
            else if(strlen($duration) == 7){
                return "0" . $duration;
            }
        }
    private function processPoster($id, $data){
      if(!empty($data)){
        list($type, $data) = explode(';', $data);
        list(, $data)      = explode(',', $data);
        $data = base64_decode($data);
        Storage::put('public/media/posters/'.$id.'.png', $data);
        return 'public/media/posters/'.$id.'.png';
      } else {
        return '';
      }
    }
    public function like(Request $request){
      if(empty(Auth::id())){
      $notifyId = 0;
      if(!empty($request->input('media_id'))){
        $like = Like::firstOrCreate(['user_id' => Auth::id(),'media_id' => $request->input('media_id')]);
        $notifyId = Media::find($request->input('media_id'))->user_id;
      } else if(!empty($request->input('comment_id'))){
        $like = Like::firstOrCreate(['user_id' => Auth::id(),'comment_id' => $request->input('comment_id')]);
        $notifyId = Comment::find($request->input('comment_id'))->user_id;
      }
        $like->count = $request->input('count');
        $like->save();
        User::find($notifyId)->notify(new LikeReceived($like));
        return response()->json(["data"=>["msg"=>"OK"]],200);
      } else {
        return response()->json(["data"=>["msg"=>"Permission denied"]],403);
      }
    }
    public function edit(Request $request, $id)
    {
      $media = Media::where('id', '=' ,$id)->firstOrFail();
      if((Auth::id()==$media->user_id)||(Auth::user()->can('admin'))){
        $media->title = $request->input('title');
        $category_id = $request->input('category_id');
        if(empty($category_id)){
          $category_id = 0;
        }
        $media->category_id = $category_id;
        $duration = 0;
        if(!empty($request->input('duration'))){
          $duration = $request->input('duration');
        }
        $media->duration = $duration;
        $media->description = $request->input('description');
        $tagArrayExtract = explode(' ', $request->input('tags'));
        $tagArray = array();
        foreach($tagArrayExtract as $tag){
          if(starts_with($tag, '#')){
            array_push($tagArray, substr($tag,1));
          } else {
            array_push($tagArray, $tag);
          }
        }
        $media->retag($tagArray);
        if(!empty($request->input('type'))){
          $media->type = $request->input('type');
        }
        $media->poster_source = $this->processPoster($media->id,$request->input('poster'));
        $media->save();
        return new MediaResource($media);
      }
    }
    public function destroy($id)
    {
        $media = Media::where('id', '=' ,$id)->firstOrFail();
        if((Auth::id()==$media->user_id)||(Auth::user()->can('admin'))){
        $extension = pathinfo($media->source);
        if(!empty($extension['extension'])){
          $extension = $extension['extension'];
          if(($extension=="mp4")||($extension=="webm")||($extension=="mp3")||($extension=="ogg")){
            Storage::delete($media->source);
          }
        }
          $media->user()->notifications()->where('type', 'App\Notifications\LikeReceived')->where('data',"LIKE", '%"media_id":"'.$media->id.'"%')->delete();
        foreach ($media->comments() as $value){
          $media->user()->notifications()->where('type', 'App\Notifications\LikeReceived')->where('data',"LIKE", '%"comment_id":"'.$value->id.'"%')->delete();
          $value->delete();
        }
        Storage::delete($media->poster_source);
        $media->delete();
      }
        return response()->json(["data"=>["msg"=>"Media deleted"]],200);
    }
}
