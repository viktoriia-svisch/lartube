<?php
namespace App;
use Illuminate\Database\Eloquent\Model;
class DirectTag extends Model
{
    protected $fillable = [
        'id', 'slug', 'name','suggest','count'
    ];
    protected $table = 'tagging_tags';
}
