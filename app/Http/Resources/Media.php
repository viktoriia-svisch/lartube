<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
class Media extends JsonResource
{
    public function toArray($request)
    {
      return [
          'id' => $this->id,
          'title' => $this->title,
          'source' => $this->source,
          'poster_source' => $this->poster_source,
          'type' => $this->type,
          'description' => $this->description,
          'comments' => $this->comments(),
          'created_at' => $this->created_at,
          'updated_at' => $this->updated_at,
      ];
    }
}
