require('./bootstrap');
module.exports = {
	module: {
		loaders: [
			{ test: /jquery-mousewheel/, loader: "imports?define=>false&this=>window" },
			{ test: /malihu-custom-scrollbar-plugin/, loader: "imports?define=>false&this=>window" }
		]
	}
};
var $ = require('jquery');
var WebTorrent = require('webtorrent')
$( document ).ready(function() {
$('#sidebarCollapse').on('click', function () {
  console.log("toggle clicked")
});
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
