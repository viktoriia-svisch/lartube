<?php
namespace App\Http\Controllers;
use Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\User;
use App\Like;
use Spatie\Permission\Models\Role;
use DB;
use Hash;
use Illuminate\Support\Facades\Storage;
class UserController extends Controller
{
  function __construct()
  {
  }
    public function index(Request $request)
    {
        $data = User::orderBy('id','DESC')->paginate(5);
        return view('users.index',compact('data'))
            ->with('i', ($request->input('page', 1) - 1) * 5);
    }
    public function profile()
    {
        $users = User::all();
        $friends = Auth::user()->getAcceptedFriendships();
        return view('profile.index',compact('users','friends'));
    }
    public function profileview($name)
    {
        $user = User::where('name','=',$name)->firstOrFail();
      $medias = $user->medias;
        return view('profile.view',compact('user','medias'));
    }
    public function changeFriends(Request $request)
    {
      $input = $request->all();
      if($input['type']=="request"){
        $friend = User::find($input['users_id']);
        if(Auth::user()->hasFriendRequestFrom($friend)){
          Auth::user()->acceptFriendRequest($friend);
        } else {
          Auth::user()->befriend($friend);
        }
      }
      if($input['type']=="confirm"){
        $friend = User::find($input['users_id']);
        Auth::user()->acceptFriendRequest($friend);
      }
      if($input['type']=="unfriend"){
        $friend = User::find($input['users_id']);
        Auth::user()->unfriend($friend);
      }
    }
    public function create()
    {
        $roles = Role::pluck('name','name')->all();
        return view('users.create',compact('roles'));
    }
    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|same:confirm-password',
            'roles' => 'required'
        ]);
        $input = $request->all();
        $input['password'] = Hash::make($input['password']);
        $user = User::create($input);
        $user->assignRole($request->input('roles'));
        $user->retag(explode(' ', $request->input('tags')));
        return redirect()->route('users.index')
                        ->with('success','User created successfully');
    }
    public function show($id)
    {
        $user = User::find($id);
        return view('users.show',compact('user'));
    }
    public function edit($id)
    {
        $user = User::find($id);
        $roles = Role::pluck('name','name')->all();
        $userRole = $user->roles->pluck('name','name')->all();
        return view('users.edit',compact('user','roles','userRole'));
    }
    public function selfEdit(){
      $user = User::find(Auth::user()->id);
      return view('users.selfedit',compact('user'));
    }
    public function updateAvatar(Request $request)
    {
      $data = $request->input('image');
      list($type, $data) = explode(';', $data);
      list(, $data)      = explode(',', $data);
      $data = base64_decode($data);
      $user = User::find(Auth::id());
      if(!empty($user->avatar_source)){
        Storage::delete($user->avatar_source);
      }
        $user->avatar_source = 'public/u/avatars/'.$user->id.'.png';
        Storage::put('public/u/avatars/'.$user->id.'.png', $data);
        $user->save();
        return;
    }
    public function updateBackground(Request $request)
    {
      $data = $request->input('image');
      list($type, $data) = explode(';', $data);
      list(, $data)      = explode(',', $data);
      $data = base64_decode($data);
      $user = User::find(Auth::id());
      if(!empty($user->background_source)){
        Storage::delete($user->background_source);
      }
        $user->background_source = 'public/u/backgrounds/'.$user->id.'.png';
        Storage::put('public/u/backgrounds/'.$user->id.'.png', $data);
        $user->save();
        return;
    }
    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'name' => 'required',
            'email' => 'required|email|unique:users,email,'.$id,
            'password' => 'same:confirm-password',
        ]);
        $input = $request->all();
        if(!empty($input['password'])){
            $input['password'] = Hash::make($input['password']);
        }else{
            $input = array_except($input,array('password'));
        }
        $user = User::find($id);
        $user->update($input);
        if(!empty($request->input('roles'))){
          DB::table('model_has_roles')->where('model_id',$id)->delete();
          $user->assignRole($request->input('roles'));
        }
        $user->retag(explode(' ', $request->input('tags')));
        return redirect()->route('profile.view', $user->name)
                        ->with('success','User updated successfully');
    }
    public function destroy($id)
    {
        User::find($id)->delete();
        return redirect()->route('users.index')
                        ->with('success','User deleted successfully');
    }
}
