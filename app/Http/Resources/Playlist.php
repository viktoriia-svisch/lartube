<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
class Playlist extends JsonResource
{
    public function toArray($request)
    {
        return parent::toArray([
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'media_ids' => $this->media_ids()
        ]);
    }
}
