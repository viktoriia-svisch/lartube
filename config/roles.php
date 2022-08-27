<?php
return [
    'connection' => null,
    'separator' => '.',
    'models' => [
        'role'       => jeremykenedy\LaravelRoles\Models\Role::class,
        'permission' => jeremykenedy\LaravelRoles\Models\Permission::class,
    ],
    'pretend' => [
        'enabled' => false,
        'options' => [
            'hasRole'       => true,
            'hasPermission' => true,
            'allowed'       => true,
        ],
    ],
    'defaultUserModel' => env('ROLES_DEFAULT_USER_MODEL', config('auth.providers.users.model')),
    'defaultSeeds' => [
        'PermissionsTableSeeder'        => env('ROLES_SEED_DEFAULT_PERMISSIONS', true),
        'RolesTableSeeder'              => env('ROLES_SEED_DEFAULT_ROLES', true),
        'ConnectRelationshipsSeeder'    => env('ROLES_SEED_DEFAULT_RELATIONSHIPS', true),
        'UsersTableSeeder'              => env('ROLES_SEED_DEFAULT_USERS', false),
    ],
];
