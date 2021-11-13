<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
class Track extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'lang' => $this->lang,
            'source' => $this->source,
            'type' => $this->type
        ];
    }
}
