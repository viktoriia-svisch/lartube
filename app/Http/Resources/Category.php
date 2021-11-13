<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
class Category extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'avatar' => $this->avatar,
            'background' => $this->background
        ];
    }
}
