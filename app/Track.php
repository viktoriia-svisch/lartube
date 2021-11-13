<?php
namespace App;
use Illuminate\Database\Eloquent\Model;
class Track extends Model
{
    protected $fillable = [
        'id', 'lang', 'source','media_id'
    ];
    protected $table = 'tracks';
}
