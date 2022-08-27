<?php
namespace App\Http\Resources;
use App\Http\Resources\Comment as CommentResource;
use App\Http\Resources\Track as TrackResource;
use App\Http\Resources\MediaSource as MediaSourceResource;
use Illuminate\Http\Resources\Json\JsonResource;
class Media extends JsonResource
{
    public function toArray($request)
    {
      $tagIds = array();
      foreach($this->tags as $tag){
        if(!empty($tag)){
          array_push($tagIds, $tag->id);
        }
      }
      $comments = $this->comments;
      return [
          'id' => $this->id,
          'title' => $this->title,
          'sources' => MediaSourceResource::collection($this->sources),
          'chapters' => $this->chapters,
          'poster_source' => $this->poster(),
          'description' => $this->description,
          'view' => $this->view,
          'base_type' => $this->base_type,
          'totalView' => $this->totalView(),
          'myLike' => $this->myLike($request),
          'likes' => $this->likes(),
          'dislikes' => $this->dislikes(),
          'tags' => $this->tags,
          'tagsIds' => $tagIds,
          'tagString' => $this->tagString(),
          'user_id' => $this->user_id,
          'category_id' => $this->category_id,
          'comments' => CommentResource::collection($comments),
          'created_at' => $this->created_at,
          'created_at_readable' => $this->created_at->diffForHumans(),
          'updated_at' => $this->updated_at,
      ];
    }
}
