<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @guest
      <meta id="loggedUserId" content="0">
    @else
      <meta id="loggedUserId" content="{{ Auth::id() }}">
    @endguest
    <title>{{ config('app.name', 'Laravel') }}</title>
    <script>var baseUrl = "{{ url("/") }}/";</script>
    @yield('header-before-js')
    <script src="{{ asset('js/app.js') }}" defer></script>
    @yield('header')
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
</head>
<body class="">
    <div id="app2" v-cloak >
  <thesidebar :currentuser="currentuser"></thesidebar>
        <main class="py-4 mt-5 col-12 mb-3">
          <div class="">
            <div class="d-flex justify-content-center">
              <div class="col-sm-12 col-12 col-lg-10" id="outerContainer">
            @yield('content')
          </div></div></div>
          <b-modal id="moremodal" style="display: none;" title="More options">
            <p>Medias loaded: @{{ medias.length }}</p>
            <p>Users loaded: @{{ users.length }}</p>
            <p>Tags loaded: @{{ tags.length }}</p>
            <p ><button @click="emitRefreshMedias()" class="btn btn-warning mr-1">Reset data</button></p>
            <p><button @click="emitLoadAllMedias()" class="btn btn-danger mr-1">Load all medias</button></p>
          </b-modal>
        </main>
    </div>
  </body>
  <footer>
  </footer>
</html>
