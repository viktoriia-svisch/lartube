@extends('layouts.app')
@section('header')
@endsection
@section('content')
            <div id="app2">
  <router-view v-bind:medias="medias" v-bind:currentTitle="currentTitle"></router-view>
</div>
@endsection
