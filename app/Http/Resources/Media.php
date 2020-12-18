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
          'type' => $this->type,
          'description' => $this->description,
          'created_at' => $this->created_at,
          'updated_at' => $this->updated_at,
      ];
    }
}
