var baseUrl:string;
import Vue from 'vue'
import Router from 'vue-router';
import BootstrapVue from 'bootstrap-vue'
import VueCroppie from 'vue-croppie';
import { eventBus } from './eventBus';
import { MediaSorter, Search } from './tools';
import { User, Media, Tag, Category } from './models';
import VueApexCharts from 'vue-apexcharts'
import Vuesax from 'vuesax'
import 'material-icons/iconfont/material-icons.css';
import 'vuesax/dist/vuesax.css' 
import VuePlyr from 'vue-plyr'
var app;
var theVue;
var searchDelay;
var theMediaSorter = new MediaSorter();
class siteManager {
  medias:Array<Media>;
  currentPage:string;
  users:Array<User>;
  usedSearchTerms:any;
  tags:Array<Tag>;
  categories:Array<Category>;
  nextLink:string;
  loggedUserId:number;
  currentUser:User;
  lastLink:string;
  catchedTagMedias:any;
  initing:boolean;
  csrf:string;
  constructor(base:string){
    this.initing=true;
    baseUrl = base+"/";
    this.currentPage = "overview";
    this.catchedTagMedias=[];
    this.usedSearchTerms=[];
    this.loggedUserId = Number($("#loggedUserId").attr("content"));
    this.receiveUsers(true);
    this.csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    setInterval(this.updateCSRF, 1800000);
  }
  initVue(){
    Vue.use(Router)
    Vue.use(BootstrapVue);
    Vue.use(VueCroppie);
    Vue.use(VueApexCharts)
    Vue.use(Vuesax)
    Vue.use(VuePlyr)
    Vue.component('apexchart', VueApexCharts)
    var overview = Vue.component('overview', require("./components/OverviewComponent.vue"));
    var player = Vue.component('player', require("./components/MediaComponent.vue"));
    var profileComp = Vue.component('profile', require("./components/ProfileComponent.vue"));
    var editProfileComp = Vue.component('editprofile', require("./components/EditProfile.vue"));
    var tagComp = Vue.component('tags', require("./components/TagComponent.vue"));
    var loginComp = Vue.component('login', require("./components/auth/Login.vue"));
    var registerComp = Vue.component('register', require("./components/auth/Register.vue"));
    var uploadComp = Vue.component('upload', require("./components/UploadComponent.vue"));
    var searchComp = Vue.component('search', require("./components/SearchComponent.vue"));
    var chartsComp = Vue.component('search', require("./components/ChartsComponent.vue"));
    var editVideoComp = Vue.component('search', require("./components/EditVideo.vue"));
    var aboutComp = Vue.component('search', require("./components/About.vue"));
    var sidebarComp = Vue.component('thesidebar', require("./components/SidebarComponent.vue"));
    var catComp = Vue.component('thesidebar', require("./components/Categories.vue"));
    var uaComp = Vue.component('thesidebar', require("./components/UserAdmin.vue"));
    var myVideosComp = Vue.component('thesidebar', require("./components/MyVideos.vue"));
    let that = this;
    const routes = [
      { path: '/', component: overview },
      { path: '/media/:currentTitle', component: player },
      { path: '/profile/:profileId', component: profileComp },
      { path: '/tags', component: tagComp },
      { path: '/tags/:tagName', component: tagComp },
      { path: '/login', component: loginComp },
      { path: '/editprofile', component: editProfileComp },
      { path: '/register', component: registerComp },
      { path: '/upload', component: uploadComp },
      { path: '/search', component: searchComp },
      { path: '/charts', component: chartsComp },
      { path: '/categories', component: catComp },
      { path: '/about', component: aboutComp },
      { path: '/myvideos', component: myVideosComp },
      { path: '/admin/users', component: uaComp },
      { path: '/mediaedit/:editTitle', component: editVideoComp }
    ]
    eventBus.$on('getNewMedias', title => {
      theVue.alert("Look for new medias..")
      that.receiveMedias()
    });
    eventBus.$on('userEdited', title => {
      theVue.alert("Look for new users..")
      that.receiveUsers(true)
    });
    eventBus.$on('refreshMedias', title => {
      theVue.canloadmore = true;
      that.catchedTagMedias=[];
      this.usedSearchTerms=[];
      that.receiveMedias("/internal-api/media"+this.getIgnoreParam(),true)
      that.updateCSRF();
    });
    eventBus.$on('loadAllMedias', title => {
      that.receiveMedias("/internal-api/medias/all"+this.getIgnoreParam())
      theVue.canloadmore=false
      that.updateCSRF();
    });
    eventBus.$on('login', settings => {
      this.initing = false;
      this.loggedUserId = settings.user_id
      theVue.loggeduserid = this.loggedUserId
      that.currentUser = that.getUserById(this.loggedUserId);
      theVue.currentuser = that.currentUser;
      if(that.currentUser.admin){
        that.receiveUsers(true);
      }
      theVue.alert("Welcome back, "+that.getUserById(this.loggedUserId).name,"success","exit_to_app")
      theVue.$router.push('/');
      that.updateCSRF();
    });
    eventBus.$on('logout', settings => {
      this.loggedUserId = 0
      theVue.loggeduserid = this.loggedUserId
      that.currentUser = that.getUserById(this.loggedUserId);
      theVue.currentuser = that.currentUser;
      theVue.alert("Logged out","danger","power_settings_new")
      theVue.$router.push('/');
      that.updateCSRF();
    });
    eventBus.$on('loginFailed', settings => {
      theVue.alert("Login failed","danger","error")
    });
    eventBus.$on('loadUserVideos', userid => {
      console.log("/internal-api/medias/by/"+userid+this.getIgnoreParam())
      that.receiveMedias("/internal-api/medias/by/"+userid+this.getIgnoreParam())
    });
    eventBus.$on('sortBy', sortBy => {
      theMediaSorter.sortBy = sortBy
      if(theVue.$router.currentRoute.path=="/search"){
        theVue.search.mediaResult = theMediaSorter.sort(theVue.search.mediaResult)
      }
      that.medias = theMediaSorter.sort(that.medias)
      theVue.medias = that.medias
    });
    eventBus.$on('commentCreated', json => {
      that.receiveMediaByName(that.findMediaById(Number(json.data.media_id)).title)
      that.updateCSRF();
      theVue.alert("Comment created","success")
    });
    eventBus.$on('refreshMedia', id => {
      that.receiveMediaByName(that.findMediaById(Number(id)).title)
      that.updateCSRF();
      theVue.alert("Media refreshed","success")
    });
    eventBus.$on('loadMedia', title => {
      if(theVue!=undefined){
        that.receiveMediaByName(title)
        that.updateCSRF();
      }
      theVue.alert("Media refreshed","success")
    });
    eventBus.$on('videoDeleted', title => {
      theVue.alert("Video "+title+" deleted","success")
      that.deleteMediaByName(title);
      that.updateCSRF();
    });
    eventBus.$on('videoCreated', json => {
      that.receiveTagsForMedia(json);
      theVue.alert("Video "+json.data.title+" created","success")
      that.updateCSRF();
    });
    eventBus.$on('videoEdited', json => {
      that.deleteMediaByName(json[0]);
      that.receiveTagsForMedia(json[1]);
      theVue.alert("Video "+json[1].data.title+" edited","success")
      that.updateCSRF();
    });
    eventBus.$on('checkTag', tagName => {
      if(tagName==''){
        if($("#specialAllTag").is(":checked")){
          theVue.medias = that.medias;
        } else {
          theVue.medias = [];
          theVue.medias = that.medias;
        }
      } else {
      if(that.catchedTagMedias.includes(tagName)==false){
        that.catchedTagMedias.push(tagName);
        that.receiveMedias("/api/tags/"+tagName);
      }
    }
    });
    eventBus.$on('loadMore', title => {
      that.receiveMedias(that.nextLink)
    });
    window.onscroll = function() {
      var d = document.documentElement;
      var offset = d.scrollTop + window.innerHeight;
      var height = d.offsetHeight;
      if (offset >= height) {
        if(that.nextLink!=null){
          that.receiveMedias(that.nextLink)
        }
      }
    };
    eventBus.$on('refreshSearch', title => {
      theVue.searching();
    });
    eventBus.$on('showAlert', data => {
      theVue.dismisscountdown = theVue.dismisssecs
    });
   theVue = new Vue({
    data : {
      title : "Overview",
      dismisssecs: 10,
      dismisscountdown: 0,
      showdismissiblealert: false,
      alertmsg: "",
      alerttype:"",
      search:'',
      csrf:that.csrf,
      currentuser:that.currentUser,
      users:this.users,
      loggeduserid:this.loggedUserId,
      tags:this.tags,
      canloadmore:true,
      medias:this.medias,
      user:that.currentUser,
      categories:that.categories,
      baseUrl:baseUrl
    },
    components : {
        'thesidebar': sidebarComp
    },
    router:new Router({ routes,
      scrollBehavior (to, from, savedPosition) {
        return { x: 0, y: 0 }
      }
   }),
    methods:{
      alert(msg,type="dark",icon=''){
        this.$vs.notify({title:msg,text:'',icon:icon,color:type,position:'bottom-center'})
      },
      searching() {
        if(theVue.$router.currentRoute.path!="/search"){
          theVue.$router.push('/search');
        }
        var s =  $("#theLiveSearch").val();
        var m = [];
        if(that.usedSearchTerms.includes(s.toString())==false&&s.toString()!=""){
          that.usedSearchTerms.push(s);
          if(searchDelay!=undefined){
            clearTimeout(searchDelay);
          }
          searchDelay = setTimeout(function(){
            that.receiveMedias("/internal-api/medias/search/"+s+that.getIgnoreParam());
          }, 300);
        }
        var so = new Search(s.toString(),that.medias,that.tags,that.users);
        theVue.search = so;
        theVue.medias = so.mediaResult;
        theVue.users = so.userResult;
      }
    },
    mounted(){
    },
    watch:{
      $route (to, from){
          if(to.params.currentTitle!=undefined){
            if(sm.findMediaByName(to.params.currentTitle)==undefined){
              sm.receiveMediaByName(to.params.currentTitle);
            }
          }
          if(to.params.editTitle!=undefined){
            if(sm.findMediaByName(to.params.editTitle)==undefined){
              sm.receiveMediaByName(to.params.editTitle);
            }
          }
          if(to.params.profileId!=undefined){
            this.user = sm.getUserById(to.params.profileId)
            this.medias = sm.getMediasByUser(to.params.profileId)
          } else {
            this.medias = sm.medias;
          }
          if(to.path=="/search"){
          }
          if(to.path=="/login"||to.path=="/register"){
            if(that.loggedUserId!=0){
              theVue.$router.push('/');
            }
          }
      }
  }
  }).$mount('#app2');
if(localStorage.getItem('cookiePolicy')!="read"){
  theVue.$vs.notify({
    title:'We use cookies and the offline-storage',
    text:'Some of your informations are saved in your browser or on the server (mostly in case of login).<br /> With a Ok you acceppt this. <br /> <a class="btn btn-success" onclick="localStorage.setItem(\'cookiePolicy\',\'read\');">Ok</a>',
    color:'primary',
    fixed:true,
    click:()=>{
    },
  })
}
  }
  fillUser(comment){
    let that = this;
    console.log("start filluser")
    console.log(comment.childs)
    $.each( comment.childs, function( key, value ) {
      console.log("fill the user")
      if(value.childs.length>0){
        comment.childs[key] = that.fillUser(value)
      }
     comment.childs[key].user = that.getUserById(value.user_id)
    });
    comment.childs = comment.childs.sort(MediaSorter.byCreatedAtComments)
    return comment;
  }
  getCurrentSite(){
    return this.currentPage;
  }
  updateCSRF(){
    $.get('/internal-api/refresh-csrf').done(function(data){
      this.csrf = data;
      theVue.csrf = data;
      $('meta[name="csrf-token"]').attr('content',data)
});
  }
  receiveUsers(forceUpdate=false):void{
    let that = this;
    $.getJSON("/internal-api/users", function name(data) {
      if((that.users==undefined)||(forceUpdate)){
      that.users = [];
      if(that.loggedUserId==0){
        that.currentUser = new User(0, "Guest", "/img/404/avatar.png", "/img/404/background.png", "","","",false);
      }
        $.each( data.data, function( key, value ) {
          var u = new User(value.id, value.name, value.avatar, value.background, value.bio, value.mediaIds,value.tagString,value.public,value.admin,value.email,value.created_at.date,value.updated_at.date);
          if(u.id==that.loggedUserId){
            that.currentUser=u;
            if(theVue!=undefined){
              theVue.currentuser = u;
            }
          }
          that.users.push(u);
        });
        if(that.initing){
          that.receiveTags();
          that.receiveCategories();
        }
      }
    });
  }
  getIgnoreParam(){
    var content = "?i=0";
    $.each( this.medias, function( key, value ) {
      content += ","+value.id
    });
    return content
  }
  receiveCategories(forceUpdate=false):void{
    let that = this;
    $.getJSON("/internal-api/categories", function name(data) {
      if((that.categories==undefined)||(forceUpdate)){
        that.categories = [];
        $.each( data.data, function( key, value ) {
          console.log("push cat "+value.title)
          that.categories.push(new Category(value.id, value.title, value.description, value.avatar_source,value.background_source));
        });
      }
      this.categories = that.categories;
      if(theVue!=undefined){
        theVue.categories = this.categories;
      }
    });
  }
  getCategoryMedias(category_id:number){
    var ma = []
    $.each( this.medias, function( key, value ) {
      if(value.category_id==category_id){
        ma.push(value);
      }
    });
    return ma;
  }
  getCategoryKey(category_id:number){
    var res;
    $.each( this.categories, function( key, value ) {
      if(value.id==category_id){
        res = key;
      }
    });
    return res;
  }
  receiveTags(forceUpdate=false):void{
    let that = this;
    $.getJSON("/api/tags", function name(data) {
      if((that.tags==undefined)||(forceUpdate)){
      that.tags = [];
        $.each( data.data, function( key, value ) {
          that.tags.push(new Tag(value.id, value.name, value.slug, value.count));
        });
      }
      this.tags = that.tags;
      if(theVue!=undefined){
        theVue.tags = this.tags;
      }
        that.receiveMedias();
    });
  }
  receiveTagsForMedia(json,forceUpdate=true):void{
    let that = this;
    $.getJSON("/api/tags", function name(data) {
      if((that.tags==undefined)||(forceUpdate)){
      that.tags = [];
        $.each( data.data, function( key, value ) {
          that.tags.push(new Tag(value.id, value.name, value.slug, value.count));
        });
      }
      this.tags = that.tags;
      if(theVue!=undefined){
        theVue.tags = this.tags;
      }
      json = json.data;
      that.medias.unshift(new Media(json.id,json.title,json.description,json.source,json.poster_source,json.duration,json.simpleType,json.techType,json.type,that.getUserById(json.user_id),json.user_id,json.created_at,json.updated_at,json.created_at_readable,json.comments,that.getTagsByIdArray(json.tagsIds),json.myLike,json.likes,json.dislikes,json.tracks,json.category_id))
      theVue.medias = that.medias
      theVue.$router.push('/');
    });
  }
  receiveMediaByName(mediaName:string,forceUpdate=false):void{
    let that = this;
    var theKey;
    var existsAlready = false;
    $.getJSON("/internal-api/media/"+mediaName, function name(data) {
      $.each(that.medias, function(key,value){
        if(value.title==mediaName){
          existsAlready=true;
          theKey = key;
        }
      });
      data = data.data;
      if(that.findMediaByName(mediaName)==undefined){
        var m = new Media(data.id,data.title, data.description, data.source, data.poster_source,data.duration, data.simpleType,data.techType, data.type, that.getUserById(data.user_id),data.user_id,data.created_at,data.updated_at,data.created_at_readable,data.comments,that.getTagsByIdArray(data.tagsIds),data.myLike,data.likes,data.dislikes,data.tracks,data.category_id);
        $.each( m.comments, function( key1, value1 ) {
          m.comments[key1] = that.fillUser(value1);
          m.comments[key1].user = that.getUserById(value1.user_id)
        });
        that.medias.push(m)
        that.medias = theMediaSorter.sort(that.medias)
        theVue.medias = that.medias;
      } else {
        var m = new Media(data.id,data.title, data.description, data.source, data.poster_source,data.duration, data.simpleType,data.techType, data.type, that.getUserById(data.user_id),data.user_id,data.created_at,data.updated_at,data.created_at_readable,data.comments,that.getTagsByIdArray(data.tagsIds),data.myLike,data.likes,data.dislikes,data.tracks,data.category_id);
        $.each( m.comments, function( key1, value1 ) {
          m.comments[key1] = that.fillUser(value1);
          m.comments[key1].user = that.getUserById(value1.user_id)
        });
        if(m!=that.medias[theKey]){
          that.medias[theKey].likes = m.likes;
          that.medias[theKey].dislikes = m.dislikes;
          that.medias[theKey].tracks = m.tracks;
          that.medias[theKey].updated_at = m.updated_at;
          that.medias[theKey].comments = m.comments.sort(MediaSorter.byCreatedAtComments);
          theVue.medias=that.medias
        }
      }
      });
  }
  getTagsByIdArray(arr:Array<number>){
    var tmpTags = [];
    let that = this;
    $.each(arr, function(key,value){
      tmpTags.push(that.findTagById(value));
    });
    return tmpTags;
  }
  findTagById(id:number){
    var returner:Tag=undefined;
    $.each(this.tags, function(key,value){
      if(value.id==id){
        returner=value;
      }
    });
    return returner;
  }
  findMediaByName(mediaName:string):Media{
    var returnMedia = undefined;
    let that = this;
    $.each(that.medias, function(key,value){
      if(value.title==mediaName){
        returnMedia=value;
      }
    });
    return returnMedia;
  }
  findMediaById(id:number):Media{
    var returnMedia = undefined;
    let that = this;
    $.each(that.medias, function(key,value){
      if(value.id==id){
        returnMedia=value;
      }
    });
    return returnMedia;
  }
  deleteMediaByName(mediaName:string):void{
    console.log("deletemethod reach")
    let that = this;
    var i = 0;
    $.each(that.medias, function(key,value){
      if(value!=undefined){
        if(value.title==mediaName){
          console.log("delete media "+mediaName)
          that.medias.splice(i,1)
        }
      }
      i++
    });
    theVue.medias = that.medias;
    theVue.$router.push('/');
  }
  receiveMedias(url="/internal-api/media"+this.getIgnoreParam(),forceUpdate=false):void{
    let that = this;
    var loadCount=0,replaceCount=0;
    $.getJSON(url, function name(data) {
      if((forceUpdate)||(that.medias==undefined)){
        that.medias = [];
      }
        $.each( data.data, function( key, value ) {
         if(that.findMediaById(value.id)==undefined){
            var m = new Media(value.id,value.title, value.description, value.source, value.poster_source,value.duration, value.simpleType,value.techType, value.type, that.getUserById(value.user_id),value.user_id,value.created_at,value.updated_at,value.created_at_readable,value.comments,that.getTagsByIdArray(value.tagsIds),value.myLike,value.likes,value.dislikes,value.tracks,value.category_id)
            $.each( m.comments, function( key1, value1 ) {
              m.comments[key1] = that.fillUser(value1);
              m.comments[key1].user = that.getUserById(value1.user_id)
            });
            loadCount++;
            m.comments = m.comments.sort(MediaSorter.byCreatedAtComments);
            that.medias.push(m);
            if(that.getCategoryKey(m.category_id)!=undefined){
              that.categories[that.getCategoryKey(m.category_id)].medias.push(m)
            }
          } else {
          }
        });
        if(data.links!=undefined){
          that.nextLink = data.links.next;
          that.lastLink = data.links.prev;
        }
        if(theVue==undefined){
          that.initVue();
        }
        if(that.nextLink==null){
          theVue.canloadmore=false;
        }
        theVue.users = that.users;
        theVue.categories = that.categories;
        console.log(this.categories)
        that.medias = theMediaSorter.sort(that.medias)
        theVue.medias = that.medias;
        theVue.categories = that.categories;
        if(theVue.$route.params.profileId != undefined){
          theVue.user = sm.getUserById(theVue.$route.params.profileId)
          theVue.medias = sm.getMediasByUser(theVue.$route.params.profileId)
        }
        if(theVue.$route.params.currentTitle!=undefined){
          if(that.findMediaByName(theVue.$route.params.currentTitle)==undefined){
            that.receiveMediaByName(theVue.$route.params.currentTitle);
          }
        }
        if(theVue.$route.params.editTitle!=undefined){
          if(that.findMediaByName(theVue.$route.params.editTitle)==undefined){
            that.receiveMediaByName(theVue.$route.params.editTitle);
          }
        }
        if((theVue.$router.currentRoute.path=="/search")) {
          theVue.searching();
        }
        if(loadCount==0&&replaceCount==0){
          theVue.alert("All medias are loaded","warning")
        } else {
          theVue.alert("Load "+loadCount+" and replace "+replaceCount+" medias.")
        }
        var d = document.documentElement;
        var offset = d.scrollTop + window.innerHeight;
        var height = d.offsetHeight;
        if(offset > height){
          if(that.nextLink!=null){
            console.log("receive cause no scroll yet")
            that.receiveMedias(that.nextLink)
          }
        }
    });
  }
  getUserById(id:number):User{
    var search:User = new User(0,"None","/img/404/avatar.png","/img/404/background.png","None-profile",{},"",false)
    $.each( this.users, function( key, value ) {
      if(value.id == id){
        search = value;
      }
    });
    return search;
  }
  getMediasByUser(id:number){
    var userMedias = []
    $.each( this.medias, function( key, value ) {
      if(value.user_id == id){
        userMedias.push(value)
      }
    });
    return userMedias;
  }
};
if(sm==undefined){
  var sm;
}
export function init(baseUrl) {
  sm = new siteManager(baseUrl);
  eventBus.$on('overviewPlayClick', title => {
    theVue.title = title;
  });
}
