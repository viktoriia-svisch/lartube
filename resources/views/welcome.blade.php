@extends('layouts.app')
@section('header')
@endsection
@section('content')
            <div id="">
  <router-view v-bind:loggeduserid="loggeduserid" v-bind:dismissSecs="dismissSecs" v-bind:dismissCountDown="dismissCountDown" v-bind:showDismissibleAlert="showDismissibleAlert" v-bind:medias="medias" v-bind:canloadmore="canloadmore" v-bind:tags="tags" v-bind:currentTitle="currentTitle" v-bind:user="user"></router-view>
</div>
@endsection
