<?php
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
class PermissionTableSeeder extends Seeder
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
 $u = User::create('name' => "admin",'email' => "admin@admin.admin",'password' => Hash::make("admin")]);
 $u->assignRole($permissions);
 foreach ($permissions as $permission) {
      Permission::create(['name' => $permission]);
 }
 $u->syncPermissions($permissions);
 $u->save();
    }
}
