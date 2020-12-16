<?php
namespace App\Http\Controllers;
use App\Media;
use Auth;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
class MediaController extends Controller
{
    public function index(Request $request)
    {
      $data = Media::orderBy('id','DESC')->paginate(5);
      return view('medias.index',compact('data'))
          ->with('i', ($request->input('page', 1) - 1) * 5);
    }
    public function create()
    {
    }
    public function directUpload(Request $request){
      $file = $request->file('directMedia');
      $title = $request->input('title');
      echo 'File Name: '.$file->getClientOriginalName(). "   ".Auth::id();
      $extension = $file->getClientOriginalExtension();
      if(($extension=="mp4")||($extension=="webm")){
        $path = $file->store('public/directMedia');
        $media = Media::create(['title' => $title,'source' => $path,'type' => 'localVideo', 'users_id' => Auth::id()]);
        return view('directupload');
      }
    }
    public function store(Request $request)
    {
    }
     public function show($title)
     {
         $media = Media::where('title', '=' ,$title)->firstOrFail();
         return view('medias.show',compact('media'));
     }
    public function edit($id)
    {
    }
    public function update(Request $request, $id)
    {
    }
    public function destroy($id)
    {
    }
}
