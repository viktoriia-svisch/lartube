var baseUrl:string;
import Vue from 'vue'
import Vuex from 'vuex'
import Router from 'vue-router';
import BootstrapVue from 'bootstrap-vue'
import VueCroppie from 'vue-croppie';
import { eventBus,store } from './eventBus';
import translation from './translation';
import dateTranslation from './dateTranslation';
import { MediaSorter, Search } from './tools';
import { User, Media, Tag, Category, Notification } from './models';
import VueApexCharts from 'vue-apexcharts'
import Vuesax from 'vuesax'
import 'material-icons/iconfont/material-icons.css';
import 'plyr/dist/plyr.css';
import 'vuesax/dist/vuesax.css' 
import VuePlyr from 'vue-plyr'
import VueI18n from 'vue-i18n'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
Vue.use(Vuex)
Vue.use(Router)
Vue.use(BootstrapVue);
Vue.use(VueCroppie);
Vue.use(VueApexCharts)
Vue.use(Vuesax)
Vue.use(VuePlyr)
Vue.use(VueI18n)
Vue.component('treeselect', Treeselect)
Vue.component('apexchart', VueApexCharts)
var theVue:any;
var searchDelay:any;
var theMediaSorter = new MediaSorter();
var i18n:VueI18n;
class siteManager {
  medias:Array<Media>;
  nextMedias:Array<Media>;
  users:Array<User>;
  notifications:Array<Notification>;
  usedSearchTerms:any;
  usedCatRequests:any;
  tags:Array<Tag>;
  blockScrollExecution:boolean;
  categories:Array<Category>;
  loggedUserId:number;
  currentUser:User;
  lastLink:string;
  totalMedias:number; 
  catchedTagMedias:any;
  initing:boolean;
  csrf:string;
  loadedLangs:any;
  treecatptions:any;
  notificationTimer:any;
  types:Array<string>;
  currentMediaId:number;
  constructor(base:string){
    this.currentMediaId = 0;
    this.initing=true;
    this.blockScrollExecution = false;
    baseUrl = base+"/";
    if(localStorage.getItem("mediaTypes")!=''&&localStorage.getItem("mediaTypes")!=null){
      this.types = localStorage.getItem("mediaTypes").split(",")
    } else {
      this.types = ["audio","video"]
    }
    this.catchedTagMedias=[];
    this.usedSearchTerms=[];
    this.usedCatRequests=[];
    this.loadedLangs=['en'];
    this.nextMedias=[];
    this.loggedUserId = Number($("#loggedUserId").attr("content"));
    this.updateCSRF();
    this.receiveUsers(function(){
    });
    this.csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    setInterval(this.updateCSRF, 1800000);
  }
  initVue(){
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
    var notiComp = Vue.component('thesidebar', require("./components/Notifications.vue"));
    var ccComp = Vue.component('thesidebar', require("./components/CreateCategory.vue"));
    var ceComp = Vue.component('thesidebar', require("./components/EditCategory.vue"));
    var singleCatComp = Vue.component('thesidebar', require("./components/Category.vue"));
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
      { path: '/category/:currentCat', component: singleCatComp },
      { path: '/editcat/:catId', component: ceComp },
      { path: '/newcat', component: ccComp },
      { path: '/about', component: aboutComp },
      { path: '/notifications', component: notiComp },
      { path: '/myvideos', component: myVideosComp },
      { path: '/admin/users', component: uaComp },
      { path: '/mediaedit/:editTitle', component: editVideoComp }
    ]
    eventBus.$on('getNotifications', url => {
      theVue.alert("Look for new notifications")
      that.receiveNotifications(url)
    });
    eventBus.$on('getNewMedias', title => {
      theVue.alert("Look for new medias..")
      that.receiveMedias()
    });
    eventBus.$on('languageChange', lang => {
      that.getLang(lang)
    });
    eventBus.$on('userEdited', id => {
      theVue.alert("Look for new users..")
      that.receiveUsers()
      that.updateCSRF();
      if(id!=''&&id!=undefined){
        theVue.$router.push("/profile/"+id)
      }
    });
    eventBus.$on('refreshMedias', title => {
      theVue.canloadmore = true;
      that.catchedTagMedias=[];
      this.usedSearchTerms=[];
      this.usedCatRequests=[];
      that.receiveMedias("/internal-api/media"+this.getIgnoreParam(),true)
      that.updateCSRF();
    });
    eventBus.$on('loadAllMedias', title => {
      that.receiveMedias("/internal-api/medias/all"+this.getIgnoreParam())
      theVue.canloadmore=false
      that.updateCSRF();
    });
    eventBus.$on('autoplayNextVideo', id => {
      console.log("received autoplay")
      var tmpv = that.nextVideosList(id)
      if(tmpv.length>0){
        console.log("got values!" + tmpv[0].title)
        theVue.currentmedia = tmpv[0];
        theVue.$router.push('/media/'+tmpv[0].urlTitle);
        that.nextMedias = that.nextVideosList(tmpv[0].id)
        theVue.nextvideos = that.nextMedias
        if(theVue.nextvideos==null||theVue.nextvideos){
          console.log("do load more cause nextvideos is empty")
          that.loadMorePages(function(){
            that.nextMedias = that.nextVideosList(id)
            theVue.nextvideos = that.nextMedias
            that.loadMorePages()
            console.log("received by callback from nextvideo-empty")
          });
        }
      } else {
        that.loadMorePages(function(){
          that.nextMedias = that.nextVideosList(id)
          theVue.nextvideos = that.nextMedias
          theVue.$router.push('/media/'+theVue.nextvideos[0].urlTitle);
          theVue.currentmedia = theVue.nextvideos[0];
          theVue.nextvideos = that.nextVideosList(theVue.nextvideos[0].id)
          if(theVue.nextvideos==null||theVue.nextvideos){
            that.loadMorePages(function(){
              that.nextMedias = that.nextVideosList(id)
              theVue.nextvideos = that.nextMedias
              that.loadMorePages()
            });
          }
        });
      }
    });
    eventBus.$on('login', settings => {
      this.initing = false;
      this.loggedUserId = settings.user_id
      theVue.loggeduserid = this.loggedUserId
      that.receiveUsers(function(){
        that.currentUser = that.getUserById(that.loggedUserId);
        theVue.currentuser = that.currentUser;
      });
      theVue.alert("Welcome back, "+that.getUserById(that.loggedUserId).name,"success","exit_to_app")
      theVue.$router.push('/');
      that.updateCSRF();
    });
    eventBus.$on('logout', settings => {
      this.loggedUserId = 0
      theVue.loggeduserid = this.loggedUserId
      that.currentUser = that.getUserById(that.loggedUserId);
      theVue.currentuser = that.currentUser;
      theVue.alert("Logged out","danger","power_settings_new")
      theVue.$router.push('/');
      that.updateCSRF();
    });
    eventBus.$on('loginFailed', settings => {
      theVue.alert("Login failed","danger","error")
    });
    eventBus.$on('loadUserVideos', userid => {
      that.receiveMedias("/internal-api/medias/by/"+userid+this.getIgnoreParam())
    });
    eventBus.$on('sortBy', sortBy => {
      theMediaSorter.setSortBy(sortBy)
      store.commit("sortMediasBy",sortBy)
      if(theVue.$router.currentRoute.path=="/search"){
        theVue.search.mediaResult = theMediaSorter.sort(theVue.search.mediaResult)
      }
      that.medias = theMediaSorter.sort(that.medias)
      if(that.currentMediaId!=0){
        console.log("nextMedias set by sort")
        that.nextMedias = that.nextVideosList(that.currentMediaId);
        theVue.nextvideos = that.nextMedias;
      }
    });
    eventBus.$on('commentCreated', json => {
      that.receiveMediaById(json.data.media_id, function(){
        that.updateCSRF();
        theVue.alert(theVue.$t("Comment")+" "+theVue.$t("created"),"success")
      })
    });
    eventBus.$on('refreshMedia', id => {
      that.receiveMediaById(id,function(){
        that.updateCSRF();
        theVue.alert(theVue.$t("Media")+" "+theVue.$t("refreshed"),"success")
      })
    });
    eventBus.$on('loadMediaById', id => {
      that.receiveMediaById(id)
      that.updateCSRF();
      if(theVue!=undefined){
        theVue.alert("Media load by id","success")
      }
    });
    eventBus.$on('loadMediaByCommentId', id => {
      that.receiveMediaByCommentId(id,function(){
        that.updateCSRF();
        if(theVue!=undefined){
          theVue.alert("Media load by comment","success")
        }
      })
    });
    eventBus.$on('loadMedia', title => {
      that.receiveMediaByName(encodeURIComponent(title), function(id){
        that.updateCSRF();
        store.commit("disableBlockRequest")
        if(theVue!=undefined){
          console.log("[loadMedia] update the vue after receive media")
          if(theVue.$route.params.currentTitle!=undefined){
            that.currentMediaId = id;
            that.nextMedias = that.nextVideosList(id)
            theVue.nextvideos = that.nextMedias
          }
        }
      })
    });
    eventBus.$on('videoDeleted', title => {
      theVue.alert("Video "+title+" deleted","success")
      store.commit("deleteMediaByTitle",title)
      theVue.$router.push('/');
      that.updateCSRF();
    });
    eventBus.$on('videoCreated', json => {
      that.receiveTagsForMedia(json);
      theVue.alert("Video "+json.data.title+" created","success")
      that.updateCSRF();
    });
    eventBus.$on('categoriesRefreshed', json => {
      that.receiveCategories(function(){
        theVue.alert("Categories refreshed","success")
        that.updateCSRF();
        theVue.$router.push("/categories")
      });
    });
    eventBus.$on('videoEdited', json => {
      store.commit("updateOrAddMedia",this.jsonToMedia(json[1].data))
      theVue.$router.push('/media/'+json[0]);
      theVue.alert("Video "+json[1].data.title+" edited","success")
      that.updateCSRF();
    });
    eventBus.$on('checkTag', tagName => {
      if(tagName==''){
      } else {
      if(that.catchedTagMedias.includes(tagName)==false){
        that.catchedTagMedias.push(tagName);
        that.receiveMedias("/api/tags/"+tagName,false,function(){
        });
      }
    }
    });
    eventBus.$on('loadMore', title => {
      that.loadMorePages();
    });
    $(window).scroll(function() {
       if($(window).scrollTop() + $(window).height() > $(document).height() - 50) {
         if(theVue.canloadmore&&that.blockScrollExecution==false){
           if(theVue.$router.currentRoute.path=="/"||theVue.$router.currentRoute.path=="/tags"){
           console.log("near bottom, do a request and block until request done!");
           that.blockScrollExecution=true
           that.loadMorePages(function(){
             console.log("done, allow next request")
             that.blockScrollExecution = false;
           })
          }
         }
       }
    });
    eventBus.$on('refreshSearch', title => {
      theVue.searching();
    });
    eventBus.$on('getMediasByCatId', id => {
      if(that.usedCatRequests.includes(id)==false){
        that.usedCatRequests.push(id);
        that.receiveMedias("/internal-api/medias/byCatId/"+id+that.getIgnoreParam(),false,function(){
          that.fillMediasToCat();
          eventBus.$emit('mediasByCatIdReceived',id);
        });
      }
    });
    eventBus.$on('filterTypes', types => {
      that.types = types;
      store.commit("setFilterTypes",types)
      if(this.currentMediaId!=0){
        that.nextMedias = that.nextVideosList(this.currentMediaId)
      }
      theVue.nextvideos = that.getFilteredMedias(that.nextMedias);
      if(theVue.$router.currentRoute.path=="/search"){
        theVue.searching();
      }
    });
    eventBus.$on('setCurrentMedia', id => {
      console.log("set current id")
      that.currentMediaId = id
      that.nextMedias = that.nextVideosList(id)
      if(theVue!=undefined){
        theVue.nextvideos = that.nextMedias
      }
    });
    var lang = "en"
    if(localStorage.getItem("language")!=''&&localStorage.getItem("language")!=undefined){
      lang = localStorage.getItem("language");
    }
    i18n = new VueI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages:translation,
      dateTimeFormats:dateTranslation
    })
    if(lang!="en"){
      this.getLang(lang)
    }
   theVue = new Vue({
    i18n,
    data : {
      title : "Overview",
      search:undefined,
      nextvideos:[],
      notifications:[],
      treecatptions:undefined,
      csrf:that.csrf,
      currentuser:that.currentUser,
      users:this.users,
      loggeduserid:this.loggedUserId,
      tags:this.tags,
      canloadmore:true,
      user:that.currentUser,
      categories:that.categories,
      baseUrl:baseUrl
    },
    components : {
        'thesidebar': sidebarComp
    },
    computed:{
        medias:function(){
          return store.getters.getMediasByTypes()
        }
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
      openLoading(){
        this.$vs.loading()
        setTimeout( ()=> {
          this.$vs.loading.close()
        }, 2000);
      },
      searching() {
        var s =  $("#theLiveSearch").val();
        if(theVue.$router.currentRoute.path!="/search"&&s!=''){
          theVue.$router.push('/search');
        }
        if(theVue.$router.currentRoute.path=="/search"&&s==''){
          theVue.$router.go(-1)
        }
        if(s!=''){
          var m = [];
          if(that.usedSearchTerms.includes(s.toString())==false&&s.toString()!=""){
            if(searchDelay!=undefined){
              clearTimeout(searchDelay);
            }
            searchDelay = setTimeout(function(){
              that.usedSearchTerms.push(s);
              that.receiveMedias("/internal-api/medias/search/"+s+that.getIgnoreParam(), false, function(){
                var so = new Search(s.toString(),that.getFilteredMedias(),store.state.tags,store.state.users);
                console.log("the media-result")
                console.log(so.mediaResult)
                theVue.search = so;
                theVue.users = so.userResult;
              });
            }, 300);
          } 
            var so = new Search(s.toString(),that.getFilteredMedias(),store.state.tags,store.state.users);
            console.log("the media-result")
            console.log(so.mediaResult)
            theVue.search = so;
            theVue.users = so.userResult;
        }
      }
    },
    mounted(){
    },
    watch:{
      $route (to, from){
          if(from.path=="/search"&&to.path!="/search"){
            $("#theLiveSearch").val('');
          }
          if(to.path=="/login"||to.path=="/register"){
            if(that.loggedUserId!=0){
              theVue.$router.push('/');
            }
          }
      }
  }
  }).$mount('#app');
  theVue.$router.beforeResolve((to, from, next) => {
  next()
})
theVue.$router.afterEach((to, from) => {
})
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
  loadMorePages(callback=undefined){
    if(this.totalMedias>this.medias.length){
      console.log("loadMorePages go for")
      this.receiveMedias('/internal-api/media?'+this.getIgnoreParam(false),false,callback)
      theVue.canloadmore=true;
  } else {
    console.log("loadMorePages end reached")
    theVue.canloadmore=false;
  }
}
  getFilteredMedias(myList = undefined){
    var theMedias:Array<Media> = []
    var origMedias:Array<Media>;
    if(myList==undefined){
      origMedias = store.state.medias
    } else {
      origMedias = myList
    }
    let that = this;
    $.each( origMedias, function( key, value ) {
      $.each( that.types, function( key1, type ) {
        if(type==value.simpleType){
          if(theMedias.indexOf(value)==-1){
            theMedias.push(value)
          }
        }
      });
      if(value.id==that.currentMediaId){
        if(theMedias.indexOf(value)==-1){
          theMedias.push(value)
        }
      }
    });
    return theMedias;
  }
  fillUser(comment:any){
    let that = this;
    $.each( comment.childs, function( key, value ) {
      if(value.childs.length>0){
        comment.childs[key] = that.fillUser(value)
      }
     comment.childs[key].user = that.getUserById(value.user_id)
    });
    comment.childs = comment.childs.sort(MediaSorter.byCreatedAtComments)
    return comment;
  }
  getLang(lang){
    let that = this;
    if(this.loadedLangs.includes(lang)==false){
      this.loadedLangs.push(lang)
      $.getJSON('/lang/'+lang+".json").done(function(data){
        i18n.setLocaleMessage(lang, data.default)
        i18n.locale = lang
      });
    } else {
      i18n.locale = lang
    }
  }
  updateCSRF(){
    let that = this;
    $.getJSON('/internal-api/refresh-csrf').done(function(data){
      that.csrf = data.csrf;
      that.totalMedias = data.totalMedias;
      if(theVue!=undefined){
        theVue.csrf = data.csrf;
        theVue.totalmedias = data.totalMedias
        store.commit("setTotalMedias",data.totalMedias)
        if(that.totalMedias>that.medias.length){
          theVue.canloadmore=true
        }
      }
      $('meta[name="csrf-token"]').attr('content',data.csrf)
      $.ajaxSetup({
          headers: {
              'X-CSRF-TOKEN': data.csrf
      }});
    });
  }
  receiveUsers(callback=undefined):void{
    let that = this;
    $.getJSON("/internal-api/users", function name(data) {
      that.users = [];
      if(that.loggedUserId==0){
        that.currentUser = new User(0, "Guest", "/img/404/avatar.png", "/img/404/background.png", "","","",false);
        if(theVue!=undefined){
          theVue.currentuser = that.currentUser
        }
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
        store.commit("setUsers", that.users)
        if(that.initing){
          that.receiveTags(function(){
            that.receiveCategories();
          });
        }
        if(callback!=undefined){
          callback();
        }
    });
  }
  nextVideosList(id){
    var nextVideos = []
    var startAdd = false;
    $.each( this.getFilteredMedias(), function( key, value ) {
      if(startAdd){
        nextVideos.push(value)
      }
      if(value.id==id){
        startAdd=true;
      }
    });
    return nextVideos;
  }
  getIgnoreParam(first=true){
    var content = "&i=0";
    if(first){
      content = "?i=0";
    }
    $.each( store.state.medias, function( key, value ) {
      content += ","+value.id
    });
    return content+"&types="+this.types.join()+"&sortBy="+theMediaSorter.sortBy
  }
  mkTreeCat(data,l=0){
    var result:any = [];
    if(l==0){
      result = [{id:0,label:'None'}];
    }
    let that = this;
    $.each( data, function( key, value ) {
      if(value.children.length>0){
        result.push({id:value.id,label:value.title,children:that.mkTreeCat(value.children,1)})
      }else{
        result.push({id:value.id,label:value.title})
      }
      });
      return result;
  }
  resolveMediaCategorys(){
  }
  receiveCategories(callback=undefined):void{
    let that = this;
    $.getJSON("/internal-api/categories", function name(data) {
        that.categories = [];
        $.each( data.data, function( key, value ) {
          that.categories.push(new Category(value.id, value.title, value.description, value.avatar_source,value.background_source,value.parent_id,value.children));
        });
      that.fillMediasToCat();
      that.treecatptions = that.mkTreeCat(data.data)
      store.commit("setCategories",that.categories)
      if(theVue!=undefined){
        theVue.categories = that.categories;
        theVue.treecatptions = that.treecatptions;
      }
      if(callback!=undefined){
        callback();
      }
    });
  }
  receiveNotifications(url='/internal-api/notifications',callback=undefined):void{
    let that = this;
    if(this.loggedUserId!=0){
    $.getJSON(url, function name(data) {
        that.notifications = [];
        $.each( data, function( key, value ) {
          if(value.data.media_id!=null&&value.data.media_id!=0){
            that.findMediaById(value.data.media_id,function(){
              console.log("push media-like-notification "+value.id)
              that.notifications.push(new Notification(value.id, value.type, value.data, value.read_at,value.created_at));
              theVue.notifications = that.notifications
            });
          }
          if(value.data.comment_id!=null&&value.data.comment_id!=0){
            console.log("load a comment")
            that.getCommentById2(value.data.comment_id,function(){
              console.log("push comment-like-notification "+value.id)
              that.notifications.push(new Notification(value.id, value.type, value.data, value.read_at,value.created_at));
              theVue.notifications = that.notifications
            });
          }
        });
      this.notifications = that.notifications;
      if(theVue!=undefined){
        console.log("set notifications to vue")
        theVue.notifications = this.notifications;
      }
    });
  }
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
  getCategoryKey(category_id:number,data=undefined){
    var res:any;
    let that = this;
    var idata = this.categories
    if(data!=undefined){
      idata = data
    }
    $.each( idata, function( key, value ) {
      if(value.children.length>0){
        var t = that.getCategoryKey(category_id,value.children)
        if(t!=undefined){
          res = t;
        }
      }
      if(value.id==category_id){
        res = key;
      }
    });
    return res;
  }
  getCategoryById(category_id:number,data=undefined){
    var res;
    let that = this;
    var idata = this.categories
    if(data!=undefined){
      idata = data
    }
    $.each( idata, function( key, value ) {
      if(value.children.length>0){
        var t = that.getCategoryById(category_id,value.children)
        if(t!=undefined){
          res = t;
        }
      }
      if(value.id==category_id){
        res = value;
      }
    });
    return res;
  }
  receiveTags(callback=undefined):void{
    let that = this;
    $.getJSON("/api/tags", function name(data) {
      that.tags = [];
        $.each( data.data, function( key, value ) {
          that.tags.push(new Tag(value.id, value.name, value.slug, value.count));
        });
      this.tags = that.tags;
      store.commit("setTags",that.tags)
      if(theVue!=undefined){
        theVue.tags = this.tags;
      }
      if(callback!=undefined){
        callback()
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
      store.commit("setTags",that.tags)
      if(theVue!=undefined){
        theVue.tags = this.tags;
      }
      json = json.data;
    });
  }
  getCommentById2(id:number,callback=undefined){
    if(id==null||id==0){
      return;
    }
    var theMedia = undefined;
    let that = this;
    this.medias.forEach(function(val,key){
      val.comments.forEach(function(comment:any,key2){
      if(comment.id==id){
        theMedia = comment;
      }
      });
    });
    if(theMedia==undefined){
      that.receiveMediaByCommentId(id,callback)
    } else {
      if(callback!=undefined){
        callback();
      }
    }
    return theMedia
  }
  receiveMediaByCommentId(cid:number,callback=undefined):void{
    let that = this;
    var theKey;
    var existsAlready = false;
    $.getJSON("/internal-api/medias/byCommentId/"+cid, function name(data) {
      data = data.data;
      var m = that.jsonToMedia(data)
      that.medias.push(m)
      store.commit("updateOrAddMedia",m)
      that.medias = theMediaSorter.sort(that.medias)
      if(callback!=undefined){
        callback();
      }
      });
  }
  receiveMediaById(mediaName:number,callback=undefined):void{
    let that = this;
    $.getJSON("/internal-api/medias/byId/"+mediaName, function name(data) {
      data = data.data;
      var m = that.jsonToMedia(data)
      that.medias.push(m)
      store.commit("updateOrAddMedia",m)
      that.medias = theMediaSorter.sort(that.medias)
      if(callback!=undefined){
        callback();
      }
      });
  }
  receiveMediaByName(mediaName:string,callback=undefined):void{
    let that = this;
    var theKey;
    var existsAlready = false;
    var m
    $.each(that.medias, function(key,value){
      if(value.urlTitle==mediaName){
        existsAlready=true;
        theKey = key;
      }
    });
    $.getJSON("/internal-api/media/"+mediaName, function name(data) {
      data = data.data;
      var m = that.jsonToMedia(data)
      that.medias.push(m)
      store.commit("updateOrAddMedia",m)
      that.medias = theMediaSorter.sort(that.medias)
      if(callback!=undefined){
        callback(data.id);
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
      if(value.urlTitle==mediaName){
        returnMedia=value;
      }
    });
    return returnMedia;
  }
  findMediaById(id:number,callback=undefined,getIfUndefined=true):Media{
    var returnMedia = undefined;
    let that = this;
    $.each(that.medias, function(key,value){
      if(value.id==id){
        returnMedia=value;
      }
    });
    if(returnMedia==undefined){
      if(getIfUndefined){
        that.receiveMediaById(id,callback);
      }
    } else {
      if(callback!=undefined){
        callback()
      }
    }
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
    theVue.$router.push('/');
  }
  fillMediasToCat(c=undefined){
    let that = this;
    if(c==undefined){
      c = that.categories
    }
    $.each( c, function( key1, value ) {
      value.setMedias(that.medias)
      if(value.children.length>0){
        that.fillMediasToCat(value.children)
      }
    });
  }
  jsonToMedia(value){
    let that = this;
    var m = new Media(value.id,value.title, value.description, value.source, value.poster_source,value.duration, value.simpleType,value.techType, value.type, this.getUserById(value.user_id),value.user_id,value.created_at,value.updated_at,value.created_at_readable,value.comments,this.getTagsByIdArray(value.tagsIds),value.myLike,value.likes,value.dislikes,value.tracks,value.category_id,value.intro,value.outro)
    $.each( m.comments, function( key1, value1 ) {
      m.comments[key1] = that.fillUser(value1);
      m.comments[key1].user = that.getUserById(value1.user_id)
    });
    m.comments = m.comments.sort(MediaSorter.byCreatedAt)
    m.comments.sort(MediaSorter.byCreatedAtComments);
    return m
  }
  receiveMedias(url="/internal-api/media"+this.getIgnoreParam(),forceUpdate=false,callback=undefined):void{
    let that = this;
    var loadCount=0,replaceCount=0;
    if((forceUpdate)||(that.medias==undefined)){
      that.medias = [];
      store.commit("clearMedias")
    }
    if(this.totalMedias>this.medias.length){
    $.getJSON(url, function name(data) {
        $.each( data.data, function( key, value ) {
            var m = that.jsonToMedia(value)
            that.medias.push(m);
            store.commit("updateOrAddMedia",m)
            that.fillMediasToCat()
        });
        if(theVue==undefined){
          that.initVue();
          that.receiveNotifications();
          if(that.notificationTimer!=undefined){
            clearInterval(that.notificationTimer);
          }
          that.notificationTimer = setInterval(function(){
            console.log("check for new notifications")
            that.receiveNotifications();
          }, 120000);
          that.updateCSRF()
        }
        theVue.users = that.users;
        if(that.treecatptions!=undefined){
          theVue.treecatptions = that.treecatptions;
        }
        that.medias = theMediaSorter.sort(that.medias)
        theVue.categories = that.categories;
        if(theVue.$route.params.profileId != undefined){
          theVue.user = that.getUserById(theVue.$route.params.profileId)
        }
        if((theVue.$router.currentRoute.path=="/search")) {
          theVue.searching();
        }
        if(loadCount==0&&replaceCount==0){
          if(that.totalMedias==that.medias.length){
            theVue.alert("All medias are loaded","warning")
          }
        } else {
          theVue.alert("Load "+loadCount+" and "+replaceCount+" medias already existed.")
        }
        if(callback!=undefined){
          callback();
        }
    });
  }
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
export function init(baseUrl:string) {
  sm = new siteManager(baseUrl);
  eventBus.$on('overviewPlayClick', title => {
    theVue.title = title;
  });
}
