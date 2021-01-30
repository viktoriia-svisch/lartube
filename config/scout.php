<?php
return [
    'driver' => env('SCOUT_DRIVER', 'null'),
    'prefix' => env('SCOUT_PREFIX', ''),
    'queue' => env('SCOUT_QUEUE', false),
    'chunk' => [
        'searchable' => 500,
        'unsearchable' => 500,
    ],
    'soft_delete' => false,
    'mysql' => [
        'mode' => 'NATURAL_LANGUAGE',
        'model_directories' => [app_path()],
        'min_search_length' => 0,
        'min_fulltext_search_length' => 4,
        'min_fulltext_search_fallback' => 'LIKE',
        'query_expansion' => false
    ],
    'algolia' => [
        'id' => env('ALGOLIA_APP_ID', ''),
        'secret' => env('ALGOLIA_SECRET', ''),
    ],
];
