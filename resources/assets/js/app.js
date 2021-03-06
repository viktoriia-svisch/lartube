require('./bootstrap');
window.Vue = require('vue');
 function sendFriendRequest(id,type){
   console.log("i should send a request to userid "+id);
   $.ajax({
     url: '{{ url("/friends") }}',
     type: 'PUT',
     data: "users_id="+id+"&type="+type,
     success: function(data) {
       console.log("friend-request done: "+type);
     }
   });
 }
$( document ).ready(function() {
});
