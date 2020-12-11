<?php
namespace App\Http\Controllers;
use App\Media;
use Auth;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
class MediaController extends Controller
{
    public function index()
    {
        return view('directupload');
    }
    public function create()
    {
    }
    public function directUpload(Request $request){
      $file = $request->file('directMedia');
      $title = $request->input('title');
      echo 'File Name: '.$file->getClientOriginalName();
      $path = $file->store('directMedia');
      $media = Media::create(['title' => $title,'source' => $path, 'users_id' => Auth::user()->id]);
      return view('directupload');
    }
    public function store(Request $request)
    {
    }
    public function show($id)
    {
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
