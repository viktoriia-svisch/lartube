@extends('layouts.vueApp')
@section('header')
@endsection
@section('content')
<div style="">
  <router-view v-bind:treecatptions="treecatptions" v-bind:medias="medias" v-bind:catlevel="Number(0)" v-bind:search="search" :key="$route.fullPath" v-bind:notifications="notifications" v-bind:nextvideos="nextvideos" v-bind:csrf="csrf" v-bind:categories="categories" v-bind:currentuser="currentuser" v-bind:tagenabled="true" v-bind:loggeduserid="loggeduserid" v-bind:canloadmore="canloadmore" v-bind:user="user"></router-view>
</div>
@endsection
