require('./bootstrap');
$( document ).ready(function() {
  require('./siteManager').init(process.env.MIX_APP_URL);
});
