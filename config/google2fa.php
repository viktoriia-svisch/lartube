<?php
return [
    'enabled' => true,
    'lifetime' => 0, 
    'keep_alive' => true,
    'auth' => 'auth',
    'session_var' => 'google2fa',
    'otp_input' => 'one_time_password',
    'window' => 1,
    'forbid_old_passwords' => false,
    'otp_secret_column' => 'google2fa_secret',
    'view' => 'google2fa.index',
    'error_messages' => [
        'wrong_otp' => "The 'One Time Password' typed was wrong.",
    ],
    'throw_exceptions' => true,
];
