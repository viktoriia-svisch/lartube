<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
class Tag extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'count' => $this->count,
            'slug' => $this->slug,
            'name' => $this->name
        ];
    }
}
