<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
class License extends JsonResource
{
    public function toArray($request)
    {
        return parent::toArray([
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'short_description' => $this->short_description
        ]);
    }
}
