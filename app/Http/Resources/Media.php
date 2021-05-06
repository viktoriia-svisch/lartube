<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
class Media extends JsonResource
{
    public function toArray($request)
    {
      $finalSource = $this->source;
      if($this->simpleType()!="torrent"){
        if(substr($finalSource,0,4)!="http"){
          $finalSource = url("/")."/".$this->source;
        }
      }
      $tagIds = array();
      foreach($this->tags as $tag){
        array_push($tagIds, $tag->id);
      }
      return [
          'id' => $this->id,
          'title' => $this->title,
          'source' => $this->source,
          'poster_source' => $this->poster(),
          'type' => $this->type,
          'description' => $this->description,
          'myLike' => $this->myLike(),
          'simpleType' => $this->simpleType(),
          'tags' => $this->tags,
          'tagsIds' => $tagIds,
          'tagString' => $this->tagString(),
          'user_id' => $this->user_id,
          'comments' => $this->comments(),
          'created_at' => $this->created_at,
          'created_at_readable' => $this->created_at->diffForHumans(),
          'updated_at' => $this->updated_at,
      ];
    }
}
