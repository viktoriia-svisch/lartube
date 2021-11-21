@extends('layouts.app')
@section('header')
@endsection
@section('content')
<div id="">
  <router-view :key="$route.fullPath" v-bind:categories="categories" v-bind:currentuser="currentuser" v-bind:tagenabled="true" v-bind:search="search" v-bind:users="users" v-bind:loggeduserid="loggeduserid" v-bind:dismisssecs="dismisssecs" v-bind:dismisscountdown="dismisscountdown" v-bind:showdismissiblealert="showdismissiblealert" v-bind:medias="medias" v-bind:canloadmore="canloadmore" v-bind:tags="tags" v-bind:user="user"></router-view>
</div>
@endsection
