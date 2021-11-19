<?php
namespace App\Http\Controllers;
use App\Media;
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
    public function index(Request $request)
    {
      $data = Media::orderBy('id','DESC')->paginate(5);
      return view('medias.index',compact('data'))
          ->with('i', ($request->input('page', 1) - 1) * 5);
    }
    public function addTrack(Request $request){
      $media_id = $request->input("media_id");
      $lang = $request->input("lang");
      $file = $request->file('track');
      $source = $file->store('public/tracks');
      $extension = $file->getClientOriginalExtension();
      Track::create(["lang"=>$lang,"source"=>$source,"media_id"=>$media_id,"type"=>$extension]);
      return "{}";
    }
    public function deleteTrack(Request $request,$trackid){
      Track::find($trackid)->delete();
      return "{}";
    }
    public function addMedia(Request $request)
    {
      return view('medias.create');
    }
    public function create(Request $request)
    {
        $getID3 = new \getID3;
        $title = $request->input('title');
        $poster_source = 'public/media/posters/'.$title.'.png';
        $data = $request->input('poster');
        if(!empty($data)){
          list($type, $data) = explode(';', $data);
          list(, $data)      = explode(',', $data);
          $data = base64_decode($data);
          Storage::put('public/media/posters/'.$title.'.png', $data);
        } else {
          $poster_source = '';
        }
        $source = $request->input('source');
        $duration = "0";
        if(empty($source)){
          $file = $request->file('directMedia');
          $source = $file->store('public/directMedia');
          $id3 = $getID3->analyze($source);
          if(!empty($id3)&&!empty($id3['playtime_string'])){
            $duration = $id3['playtime_string'];
          }
        }
        $tagArrayExtract = explode(' ', $request->input('tags'));
        $tagArray = array();
        foreach($tagArrayExtract as $tag){
          if(starts_with($tag, '#')){
            array_push($tagArray, substr($tag,1));
          } else {
            array_push($tagArray, $tag);
          }
        }
        $media = Media::create(['title' =>  $request->input('title'),'source' => $source,'poster_source' => $poster_source,'duration' => $duration, 'description' => $request->input('description'), 'type' => $request->input('type'), 'user_id' => Auth::id()]);
        $media->retag($tagArray);
        return new MediaResource($media);
    }
    function format_duration($duration){
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
    public function tags(Request $request){
      $tags = Media::existingTags();
      return view('tags.index',compact('tags'));
    }
    public function like(Request $request){
      echo Auth::id();
      if(!empty($request->input('media_id'))){
        $like = Like::firstOrCreate(['user_id' => Auth::id(),'media_id' => $request->input('media_id')]);
      } else if(!empty($request->input('comment_id'))){
        $like = Like::firstOrCreate(['user_id' => Auth::id(),'comment_id' => $request->input('comment_id')]);
      }
        $like->count = $request->input('count');
        $like->save();
        echo $like->count;
      return "OK";
    }
    public function directUpload(Request $request){
      $data = $request->input('image');
      list($type, $data) = explode(';', $data);
      list(, $data)      = explode(',', $data);
      $data = base64_decode($data);
      $title = $request->input('title');
      $file = $request->file("directMedia");
      $extension = $file->getClientOriginalExtension();
      $tagArrayExtract = explode(' ', $request->input('tags'));
      $tagArray = array();
      foreach($tagArrayExtract as $tag){
        if(starts_with($tag, '#')){
          array_push($tagArray, substr($tag,1));
        } else {
          array_push($tagArray, $tag);
        }
      }
      $posterPath = '';
      if(!empty($data)){
        Storage::put('public/media/posters/'.$title.'.png', $data);
      }
      if(($extension=="mp4")||($extension=="webm")){
        $path = $file->store('public/directMedia');
        $media = Media::create(['title' => $title,'source' => $path,'poster_source' => 'public/media/posters/'.$title.'.png','type' => 'localVideo', 'description' => $request->input('description'), 'user_id' => Auth::id()]);
        if(!empty($tagArray)){
          $media->retag($tagArray);
        }
        return redirect()->route('media.show',$title)
                        ->with('success','Video created successfully');
      }
      else if(($extension=="mp3")||($extension=="ogg")){
        $path = $file->store('public/directMedia');
        $media = Media::create(['title' => $title,'source' => $path,'poster_source' => 'public/media/posters/'.$title.'.png','type' => 'localAudio', 'description' => $request->input('description'), 'user_id' => Auth::id()]);
        if(!empty($tagArray)){
          $media->retag($tagArray);
        }
        return redirect()->route('media.show',$title)
                        ->with('success','Audio created successfully');
      } else {
        return redirect()->route('medias.add')
                        ->with('error','Media-format is wrong');
      }
      return view('medias.create');
    }
    public function store(Request $request)
    {
    }
     public function show($title)
     {
         $media = Media::where('title', '=' ,$title)->firstOrFail();
         return view('medias.show',compact('media'));
     }
    public function edit(Request $request, $title)
    {
        $data = $request->input('poster');
        list($type, $data) = explode(';', $data);
        list(, $data)      = explode(',', $data);
        $data = base64_decode($data);
        $media = Media::where('title', '=' ,$title)->firstOrFail();
        $media->title = $request->input('title');
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
        if(!empty($media->poster_source)){
          Storage::delete($media->poster_source);
        }
        $media->poster_source = 'public/media/posters/'.$media->title.'.png';
        Storage::put('public/media/posters/'.$media->title.'.png', $data);
        $media->save();
        return new MediaResource($media);
    }
    public function editView($title)
    {
        $media = Media::where('title', '=' ,$title)->firstOrFail();
        return view('medias.edit',compact('media'));
    }
    public function update(Request $request, $id)
    {
    }
    public function tagsFilter(Request $request, $tags)
    {
        $tagArrayExtract = explode(' ', $tags);
        $tagArray = array();
        foreach($tagArrayExtract as $tag){
          if(starts_with($tag, '#')){
            array_push($tagArray, substr($tag,1));
          } else {
            array_push($tagArray, $tag);
          }
        }
        $medias = Media::withAnyTag($tagArray)->get();
        return view('tags.filter',compact('medias'));
    }
    public function destroy($title)
    {
        $media = Media::where('title', '=' ,$title)->firstOrFail();
        $extension = pathinfo($media->source);
        if(!empty($extension['extension'])){
          $extension = $extension['extension'];
          if(($extension=="mp4")||($extension=="webm")||($extension=="mp3")||($extension=="ogg")){
            Storage::delete($media->source);
          }
        }
        Storage::delete($media->poster_source);
        $media->delete();
        return redirect()->route('media')
                        ->with('success','Media deleted successfully');
    }
}
