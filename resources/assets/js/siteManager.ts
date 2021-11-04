var baseUrl:string;
import Vue from 'vue'
import Router from 'vue-router';
import BootstrapVue from 'bootstrap-vue'
import VueCroppie from 'vue-croppie';
import { eventBus } from './eventBus';
import { MediaSorter, Search } from './tools';
import { User, Media, Tag } from './models';
import VueApexCharts from 'vue-apexcharts'
import Vuesax from 'vuesax'
import 'material-icons/iconfont/material-icons.css';
import 'vuesax/dist/vuesax.css' 
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
  nextLink:string;
  loggedUserId:number;
  currentUser:User;
  lastLink:string;
  catchedTagMedias:any;
  initing:boolean;
  constructor(base:string){
    this.initing=true;
    baseUrl = base+"/";
    this.currentPage = "overview";
    this.catchedTagMedias=[];
    this.usedSearchTerms=[];
    this.loggedUserId = Number($("#loggedUserId").attr("content"));
    this.receiveUsers(true);
    let that = this;
  }
  initVue(){
    Vue.use(Router)
    Vue.use(BootstrapVue);
    Vue.use(VueCroppie);
    Vue.use(VueApexCharts)
    Vue.use(Vuesax)
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
      { path: '/about', component: aboutComp },
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
    });
    eventBus.$on('loadAllMedias', title => {
      that.receiveMedias("/internal-api/medias/all"+this.getIgnoreParam())
      theVue.canloadmore=false
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
      theVue.alert("Comment created","success")
    });
    eventBus.$on('refreshMedia', id => {
      that.receiveMediaByName(that.findMediaById(Number(id)).title)
      theVue.alert("Media refreshed","success")
    });
    eventBus.$on('videoDeleted', title => {
      theVue.alert("Video "+title+" deleted","success")
      that.deleteMediaByName(title);
    });
    eventBus.$on('videoCreated', json => {
      that.receiveTagsForMedia(json);
      theVue.alert("Video "+json.data.title+" created","success")
    });
    eventBus.$on('videoEdited', json => {
      that.deleteMediaByName(json[0]);
      that.receiveTagsForMedia(json[1]);
      theVue.alert("Video "+json[1].data.title+" edited","success")
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
      currentuser:that.currentUser,
      users:this.users,
      loggeduserid:this.loggedUserId,
      tags:this.tags,
      canloadmore:true,
      medias:this.medias,
      user:that.currentUser,
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
      alert(msg,type="dark"){
        this.$vs.notify({title:msg,text:'',color:type,position:'bottom-center'})
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
            that.receiveMedias("/internal-api/media/search/"+s+that.getIgnoreParam());
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
  receiveUsers(forceUpdate=false):void{
    let that = this;
    $.getJSON("/api/user", function name(data) {
      if((that.users==undefined)||(forceUpdate)){
      that.users = [];
      if(that.loggedUserId==0){
        that.currentUser = new User(0, "Guest", "/img/404/avatar.png", "/img/404/background.png", "","","",false);
      }
        $.each( data.data, function( key, value ) {
          var u = new User(value.id, value.name, value.avatar, value.background, value.bio, value.mediaIds,value.tagString,value.public);
          if(u.id==that.loggedUserId){
            that.currentUser=u;
            if(theVue!=undefined){
              theVue.currentuser = u;
            }
          }
          that.users.push(u);
        });
          that.receiveTags();
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
      that.medias.unshift(new Media(json.id,json.title,json.description,json.source,json.poster_source,json.duration,json.simpleType,json.techType,json.type,that.getUserById(json.user_id),json.user_id,json.created_at,json.updated_at,json.created_at_readable,json.comments,that.getTagsByIdArray(json.tagsIds),json.myLike,json.likes,json.dislikes))
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
        var m = new Media(data.id,data.title, data.description, data.source, data.poster_source,data.duration, data.simpleType,data.techType, data.type, that.getUserById(data.user_id),data.user_id,data.created_at,data.updated_at,data.created_at_readable,data.comments,that.getTagsByIdArray(data.tagsIds),data.myLike,data.likes,data.dislikes);
        $.each( m.comments, function( key1, value1 ) {
          m.comments[key1].user = that.getUserById(value1.user_id)
        });
        that.medias.push(m)
        that.medias = theMediaSorter.sort(that.medias)
        theVue.medias = that.medias;
      } else {
        var m = new Media(data.id,data.title, data.description, data.source, data.poster_source,data.duration, data.simpleType,data.techType, data.type, that.getUserById(data.user_id),data.user_id,data.created_at,data.updated_at,data.created_at_readable,data.comments,that.getTagsByIdArray(data.tagsIds),data.myLike,data.likes,data.dislikes);
        $.each( m.comments, function( key1, value1 ) {
          m.comments[key1] = that.fillUser(value1);
          m.comments[key1].user = that.getUserById(value1.user_id)
        });
        if(m!=that.medias[theKey]){
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
            var m = new Media(value.id,value.title, value.description, value.source, value.poster_source,value.duration, value.simpleType,value.techType, value.type, that.getUserById(value.user_id),value.user_id,value.created_at,value.updated_at,value.created_at_readable,value.comments,that.getTagsByIdArray(value.tagsIds),value.myLike,value.likes,value.dislikes)
            $.each( m.comments, function( key1, value1 ) {
              m.comments[key1] = that.fillUser(value1);
              m.comments[key1].user = that.getUserById(value1.user_id)
            });
            loadCount++;
            m.comments = m.comments.sort(MediaSorter.byCreatedAtComments);
            that.medias.push(m);
          } else {
            var m = new Media(value.id,value.title, value.description, value.source, value.poster_source,value.duration, value.simpleType,value.techType, value.type, that.getUserById(value.user_id),value.user_id,value.created_at,value.updated_at,value.created_at_readable,value.comments,that.getTagsByIdArray(value.tagsIds),value.myLike,value.likes,value.dislikes)
            $.each( m.comments, function( key1, value1 ) {
              m.comments[key1] = that.fillUser(value1);
              m.comments[key1].user = that.getUserById(value1.user_id)
            });
            m.comments = m.comments.sort(MediaSorter.byCreatedAtComments);
            if(m!=value){
              replaceCount++;
              console.log("Media replaced "+value.title+" with "+m.title)
              m.comments = JSON.parse(JSON.stringify(m.comments)).sort(MediaSorter.byCreatedAtComments);
              that.medias[key] = m;
            }
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
        that.medias = theMediaSorter.sort(that.medias)
        theVue.medias = that.medias;
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
