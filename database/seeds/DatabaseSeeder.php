<?php
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use App\User;
use App\Media;
class DatabaseSeeder extends Seeder
{
    public function run()
    {
      $permissions = [
        'role-list',
        'role-create',
        'role-edit',
        'role-delete',
        'admin',
        'role-admin',
        'user-admin',
        'video-admin',
        'moderator'
        ];
     $u = User::create(['name' => 'admin','bio' => 'Hi, i am a test-user. My e-mail is admin@admin.admin and my password is adminadmin - feel free to try, but remember: this is a work in progress and the database gets dropped from time to time!','email' => 'admin@admin.admin','password' => Hash::make('adminadmin')]);
     $u1 = User::create(['name' => 'bla','bio' => 'Hi, i am a test-user. My e-mail is bla@bla.bla and my password is blabla - feel free to try, but remember: this is a work in progress and the database gets dropped from time to time!','email' => 'bla@bla.bla','password' => Hash::make('blabla')]);
     $u2 = User::create(['name' => 'ni','bio' => 'Hi, i am a test-user. My e-mail is ni@ni.ni and my password is ninini - feel free to try, but remember: this is a work in progress and the database gets dropped from time to time!','email' => 'ni@ni.ni','password' => Hash::make('ninini')]);
     $u3 = User::create(['name' => 'na','bio' => 'Hi, i am a test-user. My e-mail is na@na.na and my password is nanana - feel free to try, but remember: this is a work in progress and the database gets dropped from time to time!','email' => 'na@na.na','password' => Hash::make('nanana')]);
     $u->tag('Test');
     $u->tag('thing');
     $u1->tag('Some');
     $u1->tag('thing');
     $u2->tag('Test');
     $u2->tag('else');
     $u3->tag('Gardening');
     $u->befriend($u1);
     $u->befriend($u3);
     $u3->acceptFriendRequest($u);
     $u2->befriend($u3);
     $u2->befriend($u1);
     $u3->acceptFriendRequest($u2);
     $u1->acceptFriendRequest($u2);
     $m1 = Media::create(['title' => 'Audio test 1', 'source' => 'https:
     $m1->tag('Gardening');
     $m1->tag('Open');
     $m1->tag('Test');
     $m1 = Media::create(['title' => 'Big bucks bunny test', 'source' => 'https:
     $m1->tag('Some');
     $m1->tag('thing');
     $m1->tag('else');
     $m1 = Media::create(['title' => 'Big bucks bunny test 2', 'source' => 'https:
     $m1->tag('Some');
     $m1->tag('Test');
     $m1 = Media::create(['title' => 'Audio test 3', 'source' => 'https:
     $m1->tag('Foo');
     $m1->tag('thing');
     $m1 = Media::create(['title' => 'Big test', 'source' => 'https:
     $m1->tag('Hello');
     $m1->tag('thing');
     $m1 = Media::create(['title' => 'Big bucks test', 'source' => 'https:
     $m1->tag('Some');
     $m1->tag('Hello');
     $m1 = Media::create(['title' => 'Audio test 2', 'source' => 'https:
     $m1->tag('Some');
     $m1->tag('thing');
     $m1->tag('Test');
     $m1->tag('Gardening');
     foreach ($permissions as $permission) {
          Permission::create(['name' => $permission]);
     }
     $u->syncPermissions($permissions);
     $u->save();
     $u1->syncPermissions($permissions);
     $u1->save();
     $u2->syncPermissions($permissions);
     $u2->save();
     $u3->syncPermissions($permissions);
     $u3->save();
    }
}
