@extends('layouts.app')
@section('header')
@endsection
@section('content')
            <div id="">
  <router-view v-bind:medias="medias" v-bind:canLoadMore="canLoadMore" v-bind:tags="tags" v-bind:currentTitle="currentTitle" v-bind:user="user"></router-view>
</div>
@endsection
