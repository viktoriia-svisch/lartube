<?php
namespace App\Providers;
use Illuminate\Support\Facades\Event;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        'App\Events\Event' => [
            'App\Listeners\EventListener',
        ],
        'Laravel\Passport\Events\AccessTokenCreated' => [
          'App\Listeners\RevokeOldTokens',
        ]
    ];
    public function boot()
    {
        parent::boot();
    }
}
