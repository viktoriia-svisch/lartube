<?php
namespace App\Http\Controllers;
use App\Category;
use Illuminate\Http\Request;
class CategoryController extends Controller
{
    public function create(Request $request)
    {
        $media = Category::create(['title' =>  $request->input('title'),'description' => $request->input('description'),'parent_id' => $request->input('parent_id')]);
        return;
    }
    public function destroy(Request $request)
    {
        $comment = Category::where('id', '=' ,$request->input('category_id'))->firstOrFail();
        if(Auth::id()==$comment->users_id){
          $comment->delete();
          return;
        }
    }
}
