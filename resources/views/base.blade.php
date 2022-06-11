@extends('layouts.vueApp')
@section('header')
@endsection
@section('content')
<div style="">
  <router-view v-bind:treecatptions="treecatptions" v-bind:medias="medias" v-bind:catlevel="Number(0)" v-bind:search="search" :key="$route.fullPath" v-bind:tagenabled="true" v-bind:canloadmore="canloadmore"></router-view>
</div>
@endsection
