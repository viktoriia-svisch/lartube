@extends('layouts.app')
@section('header')
@endsection
@section('content')
<alert v-bind:dismissSecs="dismissSecs" v-bind:dismissCountDown="dismissCountDown" v-bind:showDismissibleAlert="showDismissibleAlert"></alert>
            <div id="">
  <router-view v-bind:dismissSecs="dismissSecs" v-bind:dismissCountDown="dismissCountDown" v-bind:showDismissibleAlert="showDismissibleAlert" v-bind:medias="medias" v-bind:canLoadMore="canLoadMore" v-bind:tags="tags" v-bind:currentTitle="currentTitle" v-bind:user="user"></router-view>
</div>
@endsection
