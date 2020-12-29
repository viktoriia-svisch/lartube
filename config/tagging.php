<?php
return [
	'primary_keys_type' => 'integer', 
	'normalizer' => '\Conner\Tagging\Util::slug',
	'displayer' => '\Illuminate\Support\Str::title',
	'untag_on_delete' => true,
	'delete_unused_tags'=>true,
	'tag_model'=>'\Conner\Tagging\Model\Tag',
	'delimiter' => '-',
	'tagged_model' => '\Conner\Tagging\Model\Tagged',
];
