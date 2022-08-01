window.$ = window.jQuery = require('jquery');
var $ = require('jquery');
var WebTorrent = require('webtorrent')
$( document ).ready(function() {
  require('./siteManager').init(process.env.MIX_APP_URL);
});
