@extends('layouts.vueApp')
@section('header')
@endsection
@section('content')
<div style="">
  <router-view v-bind:fullmedias="fullmedias" :key="$route.fullPath" v-bind:notifications="notifications" v-bind:nextvideos="nextvideos" v-bind:csrf="csrf" v-bind:categories="categories" v-bind:currentuser="currentuser" v-bind:tagenabled="true" v-bind:search="search" v-bind:users="users" v-bind:loggeduserid="loggeduserid" v-bind:medias="medias" v-bind:canloadmore="canloadmore" v-bind:tags="tags" v-bind:user="user"></router-view>
</div>
@endsection
