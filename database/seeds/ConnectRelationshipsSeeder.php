<?php
namespace Database\Seeds;
use Illuminate\Database\Seeder;
class ConnectRelationshipsSeeder extends Seeder
{
    public function run()
    {
        $permissions = config('roles.models.permission')::all();
        $roleAdmin = config('roles.models.role')::where('name', '=', 'Admin')->first();
        foreach ($permissions as $permission) {
            $roleAdmin->attachPermission($permission);
        }
    }
}
