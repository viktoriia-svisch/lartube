require('./bootstrap');
var $ = require('jquery')
$( document ).ready(function() {
  $.ajaxSetup({
      headers: {
          'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
  }});
  $("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
  });
  require('./siteManager').init(process.env.MIX_APP_URL);
});
