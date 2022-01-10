var baseUrl;
import Vue from 'vue';
import Router from 'vue-router';
import BootstrapVue from 'bootstrap-vue';
import VueCroppie from 'vue-croppie';
import { eventBus } from './eventBus';
import { MediaSorter, Search } from './tools';
import { User, Media, Tag, Category, Notification } from './models';
import VueApexCharts from 'vue-apexcharts';
import Vuesax from 'vuesax';
import 'material-icons/iconfont/material-icons.css';
import 'vuesax/dist/vuesax.css'; 
import VuePlyr from 'vue-plyr';
var app;
var theVue;
var searchDelay;
var theMediaSorter = new MediaSorter();
var siteManager =  (function () {
    function siteManager(base) {
        this.maxPage = -1;
        this.currentMediaId = 0;
        this.currentPage = 2;
        this.initing = true;
        baseUrl = base + "/";
        if (localStorage.getItem("mediaTypes") != '' && localStorage.getItem("mediaTypes") != null) {
            this.types = localStorage.getItem("mediaTypes").split(",");
        }
        else {
            this.types = ["audio", "video"];
        }
        this.catchedTagMedias = [];
        this.usedSearchTerms = [];
        this.nextMedias = [];
        this.loggedUserId = Number($("#loggedUserId").attr("content"));
        this.receiveUsers(true);
        this.csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        setInterval(this.updateCSRF, 1800000);
    }
    siteManager.prototype.initVue = function () {
        var _this = this;
        Vue.use(Router);
        Vue.use(BootstrapVue);
        Vue.use(VueCroppie);
        Vue.use(VueApexCharts);
        Vue.use(Vuesax);
        Vue.use(VuePlyr);
        Vue.component('apexchart', VueApexCharts);
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
        var that = this;
        var routes = [
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
            { path: '/notifications', component: notiComp },
            { path: '/myvideos', component: myVideosComp },
            { path: '/admin/users', component: uaComp },
            { path: '/mediaedit/:editTitle', component: editVideoComp }
        ];
        eventBus.$on('getNotifications', function (url) {
            theVue.alert("Look for new notifications");
            that.receiveNotifications(url, true);
        });
        eventBus.$on('getNewMedias', function (title) {
            theVue.alert("Look for new medias..");
            that.receiveMedias();
        });
        eventBus.$on('userEdited', function (title) {
            theVue.alert("Look for new users..");
            that.receiveUsers(true);
        });
        eventBus.$on('refreshMedias', function (title) {
            theVue.canloadmore = true;
            that.catchedTagMedias = [];
            _this.usedSearchTerms = [];
            that.receiveMedias("/internal-api/media" + _this.getIgnoreParam(), true);
            that.updateCSRF();
        });
        eventBus.$on('loadAllMedias', function (title) {
            that.receiveMedias("/internal-api/medias/all" + _this.getIgnoreParam());
            theVue.canloadmore = false;
            that.updateCSRF();
        });
        eventBus.$on('autoplayNextVideo', function (id) {
            console.log("received autoplay");
            var tmpv = that.nextVideosList(id);
            if (tmpv.length > 0) {
                console.log("got values!" + tmpv[0].title);
                theVue.currentmedia = tmpv[0];
                theVue.$router.push('/media/' + encodeURIComponent(tmpv[0].title));
                that.nextMedias = that.nextVideosList(tmpv[0].id);
                theVue.nextvideos = that.nextMedias;
                console.log(theVue.nextvideos);
                if (theVue.nextvideos == null || theVue.nextvideos) {
                    console.log("do load more");
                    that.loadMorePages(function () {
                        that.nextMedias = that.nextVideosList(id);
                        theVue.nextvideos = that.nextMedias;
                        console.log("received by callback");
                    });
                }
            }
            else {
                that.loadMorePages(function () {
                    that.nextMedias = that.nextVideosList(id);
                    theVue.nextvideos = that.nextMedias;
                    theVue.$router.push('/media/' + encodeURIComponent(theVue.nextvideos[0].title));
                    theVue.currentmedia = theVue.nextvideos[0];
                    theVue.nextvideos = that.nextVideosList(theVue.nextvideos[0].id);
                    if (theVue.nextvideos == null || theVue.nextvideos) {
                        that.loadMorePages(function () {
                            that.nextMedias = that.nextVideosList(id);
                            theVue.nextvideos = that.nextMedias;
                        });
                    }
                });
            }
        });
        eventBus.$on('login', function (settings) {
            _this.initing = false;
            _this.loggedUserId = settings.user_id;
            theVue.loggeduserid = _this.loggedUserId;
            that.currentUser = that.getUserById(_this.loggedUserId);
            theVue.currentuser = that.currentUser;
            if (that.currentUser.admin) {
                that.receiveUsers(true);
            }
            theVue.alert("Welcome back, " + that.getUserById(_this.loggedUserId).name, "success", "exit_to_app");
            theVue.$router.push('/');
            that.updateCSRF();
        });
        eventBus.$on('logout', function (settings) {
            _this.loggedUserId = 0;
            theVue.loggeduserid = _this.loggedUserId;
            that.currentUser = that.getUserById(_this.loggedUserId);
            theVue.currentuser = that.currentUser;
            theVue.alert("Logged out", "danger", "power_settings_new");
            theVue.$router.push('/');
            that.updateCSRF();
        });
        eventBus.$on('loginFailed', function (settings) {
            theVue.alert("Login failed", "danger", "error");
        });
        eventBus.$on('loadUserVideos', function (userid) {
            that.receiveMedias("/internal-api/medias/by/" + userid + _this.getIgnoreParam());
        });
        eventBus.$on('sortBy', function (sortBy) {
            theMediaSorter.sortBy = sortBy;
            if (theVue.$router.currentRoute.path == "/search") {
                theVue.search.mediaResult = theMediaSorter.sort(theVue.search.mediaResult);
            }
            that.medias = theMediaSorter.sort(that.medias);
            if (that.currentMediaId != 0) {
                that.nextMedias = that.nextVideosList(that.currentMediaId);
                theVue.nextvideos = that.nextMedias;
            }
            theVue.medias = that.getFilteredMedias();
        });
        eventBus.$on('commentCreated', function (json) {
            that.receiveMediaByName(that.findMediaById(Number(json.data.media_id)).title);
            that.updateCSRF();
            theVue.alert("Comment created", "success");
        });
        eventBus.$on('refreshMedia', function (id) {
            that.receiveMediaByName(that.findMediaById(Number(id)).title);
            that.updateCSRF();
            theVue.alert("Media refreshed", "success");
        });
        eventBus.$on('loadMediaById', function (id) {
            if (theVue != undefined) {
                that.receiveMediaById(id);
                that.updateCSRF();
            }
            theVue.alert("Media load by id", "success");
        });
        eventBus.$on('loadMediaByCommentId', function (id) {
            if (theVue != undefined) {
                that.receiveMediaByCommentId(id);
                that.updateCSRF();
            }
            theVue.alert("Media load by comment", "success");
        });
        eventBus.$on('loadMedia', function (title) {
            that.receiveMediaByName(title, function (id) {
                that.updateCSRF();
                if (theVue != undefined) {
                    if (theVue.$route.params.currentTitle != undefined) {
                        that.currentMediaId = id;
                        that.nextMedias = that.nextVideosList(id);
                        theVue.nextvideos = that.nextMedias;
                    }
                }
            });
        });
        eventBus.$on('videoDeleted', function (title) {
            theVue.alert("Video " + title + " deleted", "success");
            that.deleteMediaByName(title);
            that.updateCSRF();
            that.receiveNotifications(undefined, true);
        });
        eventBus.$on('videoCreated', function (json) {
            that.receiveTagsForMedia(json);
            theVue.alert("Video " + json.data.title + " created", "success");
            that.updateCSRF();
        });
        eventBus.$on('videoEdited', function (json) {
            that.deleteMediaByName(json[0]);
            that.receiveTagsForMedia(json[1]);
            theVue.alert("Video " + json[1].data.title + " edited", "success");
            that.updateCSRF();
        });
        eventBus.$on('checkTag', function (tagName) {
            if (tagName == '') {
                if ($("#specialAllTag").is(":checked")) {
                    theVue.medias = that.getFilteredMedias();
                }
                else {
                    theVue.medias = [];
                    theVue.medias = that.getFilteredMedias();
                }
            }
            else {
                if (that.catchedTagMedias.includes(tagName) == false) {
                    that.catchedTagMedias.push(tagName);
                    that.receiveMedias("/api/tags/" + tagName);
                }
            }
        });
        eventBus.$on('loadMore', function (title) {
            that.loadMorePages();
        });
        window.onscroll = function () {
            var d = document.documentElement;
            var offset = d.scrollTop + window.innerHeight;
            var height = d.offsetHeight;
            if (offset >= height) {
                console.log("current page");
                console.log(that.currentPage);
                if (that.maxPage >= that.currentPage) {
                    that.loadMorePages();
                }
                else {
                    console.log("no more because of link is null");
                }
            }
        };
        eventBus.$on('refreshSearch', function (title) {
            theVue.searching();
        });
        eventBus.$on('filterTypes', function (types) {
            that.types = types;
            theVue.medias = that.getFilteredMedias();
            if (_this.currentMediaId != 0) {
                that.nextMedias = that.nextVideosList(_this.currentMediaId);
            }
            theVue.nextvideos = that.getFilteredMedias(that.nextMedias);
            if (theVue.$router.currentRoute.path == "/search") {
                theVue.searching();
            }
        });
        eventBus.$on('setCurrentMedia', function (id) {
            console.log("set current id");
            that.currentMediaId = id;
            that.nextMedias = that.nextVideosList(id);
            theVue.nextvideos = that.nextMedias;
        });
        theVue = new Vue({
            data: {
                title: "Overview",
                search: '',
                nextvideos: [],
                notifications: [],
                csrf: that.csrf,
                currentuser: that.currentUser,
                users: this.users,
                loggeduserid: this.loggedUserId,
                tags: this.tags,
                canloadmore: true,
                medias: this.medias,
                user: that.currentUser,
                categories: that.categories,
                baseUrl: baseUrl
            },
            components: {
                'thesidebar': sidebarComp
            },
            router: new Router({ routes: routes,
                scrollBehavior: function (to, from, savedPosition) {
                    return { x: 0, y: 0 };
                }
            }),
            methods: {
                alert: function (msg, type, icon) {
                    if (type === void 0) { type = "dark"; }
                    if (icon === void 0) { icon = ''; }
                    this.$vs.notify({ title: msg, text: '', icon: icon, color: type, position: 'bottom-center' });
                },
                searching: function () {
                    if (theVue.$router.currentRoute.path != "/search") {
                        theVue.$router.push('/search');
                    }
                    var s = $("#theLiveSearch").val();
                    var m = [];
                    if (that.usedSearchTerms.includes(s.toString()) == false && s.toString() != "") {
                        that.usedSearchTerms.push(s);
                        if (searchDelay != undefined) {
                            clearTimeout(searchDelay);
                        }
                        searchDelay = setTimeout(function () {
                            that.receiveMedias("/internal-api/medias/search/" + s + that.getIgnoreParam());
                        }, 300);
                    }
                    var so = new Search(s.toString(), that.getFilteredMedias(), that.tags, that.users);
                    theVue.search = so;
                    theVue.medias = that.getFilteredMedias(so.mediaResult);
                    theVue.users = so.userResult;
                }
            },
            mounted: function () {
            },
            watch: {
                $route: function (to, from) {
                    if (to.params.currentTitle != undefined) {
                        if (that.findMediaByName(to.params.currentTitle) == undefined) {
                            that.receiveMediaByName(to.params.currentTitle);
                        }
                        else {
                            this.nextvideos = that.nextVideosList(that.findMediaByName(this.$route.params.currentTitle).id);
                        }
                    }
                    if (to.params.editTitle != undefined) {
                        if (sm.findMediaByName(to.params.editTitle) == undefined) {
                            sm.receiveMediaByName(to.params.editTitle);
                        }
                    }
                    if (to.params.profileId != undefined) {
                        this.user = sm.getUserById(to.params.profileId);
                        this.medias = sm.getMediasByUser(to.params.profileId);
                    }
                    else {
                        this.medias = sm.medias;
                    }
                    if (to.path == "/search") {
                    }
                    if (to.path == "/login" || to.path == "/register") {
                        if (that.loggedUserId != 0) {
                            theVue.$router.push('/');
                        }
                    }
                }
            }
        }).$mount('#app');
        if (localStorage.getItem('cookiePolicy') != "read") {
            theVue.$vs.notify({
                title: 'We use cookies and the offline-storage',
                text: 'Some of your informations are saved in your browser or on the server (mostly in case of login).<br /> With a Ok you acceppt this. <br /> <a class="btn btn-success" onclick="localStorage.setItem(\'cookiePolicy\',\'read\');">Ok</a>',
                color: 'primary',
                fixed: true,
                click: function () {
                },
            });
        }
    };
    siteManager.prototype.loadMorePages = function (callback) {
        if (callback === void 0) { callback = undefined; }
        if (this.maxPage >= this.currentPage) {
            this.receiveMedias('/internal-api/media?page=' + this.currentPage + this.getIgnoreParam(false), false, callback);
            this.currentPage++;
            if (this.currentPage > this.maxPage) {
                console.log("end reached");
                theVue.canloadmore = false;
            }
        }
    };
    siteManager.prototype.getFilteredMedias = function (myList) {
        if (myList === void 0) { myList = undefined; }
        var theMedias = [];
        var origMedias;
        if (myList == undefined) {
            origMedias = this.medias;
        }
        else {
            origMedias = myList;
        }
        var that = this;
        $.each(origMedias, function (key, value) {
            $.each(that.types, function (key1, type) {
                if (type == value.simpleType) {
                    if (theMedias.indexOf(value) == -1) {
                        theMedias.push(value);
                    }
                }
            });
            if (value.id == that.currentMediaId) {
                if (theMedias.indexOf(value) == -1) {
                    theMedias.push(value);
                }
            }
        });
        return theMedias;
    };
    siteManager.prototype.fillUser = function (comment) {
        var that = this;
        console.log("start filluser");
        console.log(comment.childs);
        $.each(comment.childs, function (key, value) {
            console.log("fill the user");
            if (value.childs.length > 0) {
                comment.childs[key] = that.fillUser(value);
            }
            comment.childs[key].user = that.getUserById(value.user_id);
        });
        comment.childs = comment.childs.sort(MediaSorter.byCreatedAtComments);
        return comment;
    };
    siteManager.prototype.updateCSRF = function () {
        $.get('/internal-api/refresh-csrf').done(function (data) {
            this.csrf = data;
            theVue.csrf = data;
            $('meta[name="csrf-token"]').attr('content', data);
        });
    };
    siteManager.prototype.receiveUsers = function (forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        var that = this;
        $.getJSON("/internal-api/users", function name(data) {
            if ((that.users == undefined) || (forceUpdate)) {
                that.users = [];
                if (that.loggedUserId == 0) {
                    that.currentUser = new User(0, "Guest", "/img/404/avatar.png", "/img/404/background.png", "", "", "", false);
                    if (theVue != undefined) {
                        theVue.currentuser = that.currentUser;
                    }
                }
                $.each(data.data, function (key, value) {
                    var u = new User(value.id, value.name, value.avatar, value.background, value.bio, value.mediaIds, value.tagString, value.public, value.admin, value.email, value.created_at.date, value.updated_at.date);
                    if (u.id == that.loggedUserId) {
                        that.currentUser = u;
                        if (theVue != undefined) {
                            theVue.currentuser = u;
                        }
                    }
                    that.users.push(u);
                });
                if (that.initing) {
                    that.receiveTags();
                    that.receiveCategories();
                }
            }
        });
    };
    siteManager.prototype.nextVideosList = function (id) {
        var nextVideos = [];
        var startAdd = false;
        $.each(this.getFilteredMedias(), function (key, value) {
            if (startAdd) {
                nextVideos.push(value);
            }
            if (value.id == id) {
                startAdd = true;
            }
        });
        return nextVideos;
    };
    siteManager.prototype.getIgnoreParam = function (first) {
        if (first === void 0) { first = true; }
        var content = "&i=0";
        if (first) {
            content = "?i=0";
        }
        $.each(this.medias, function (key, value) {
            content += "," + value.id;
        });
        return content;
    };
    siteManager.prototype.receiveCategories = function (forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        var that = this;
        $.getJSON("/internal-api/categories", function name(data) {
            if ((that.categories == undefined) || (forceUpdate)) {
                that.categories = [];
                $.each(data.data, function (key, value) {
                    console.log("push cat " + value.title);
                    that.categories.push(new Category(value.id, value.title, value.description, value.avatar_source, value.background_source));
                });
            }
            this.categories = that.categories;
            if (theVue != undefined) {
                theVue.categories = this.categories;
            }
        });
    };
    siteManager.prototype.receiveNotifications = function (url, forceUpdate) {
        if (url === void 0) { url = '/internal-api/notifications'; }
        if (forceUpdate === void 0) { forceUpdate = false; }
        var that = this;
        $.getJSON(url, function name(data) {
            if ((that.notifications == undefined) || (forceUpdate)) {
                that.notifications = [];
                $.each(data, function (key, value) {
                    if (value.data.media_id != null && value.data.media_id != 0) {
                        that.findMediaById(value.data.media_id, function () {
                            console.log("push media-like-notification " + value.id);
                            that.notifications.push(new Notification(value.id, value.type, value.data, value.read_at, value.created_at));
                            theVue.notifications = that.notifications;
                        });
                    }
                    if (value.data.comment_id != null && value.data.comment_id != 0) {
                        console.log("load a comment");
                        that.getCommentById2(value.data.comment_id, function () {
                            console.log("push comment-like-notification " + value.id);
                            that.notifications.push(new Notification(value.id, value.type, value.data, value.read_at, value.created_at));
                            theVue.notifications = that.notifications;
                        });
                    }
                });
            }
            this.notifications = that.notifications;
            if (theVue != undefined) {
                console.log("set notifications to vue");
                theVue.notifications = this.notifications;
            }
        });
    };
    siteManager.prototype.getCategoryMedias = function (category_id) {
        var ma = [];
        $.each(this.medias, function (key, value) {
            if (value.category_id == category_id) {
                ma.push(value);
            }
        });
        return ma;
    };
    siteManager.prototype.getCategoryKey = function (category_id) {
        var res;
        $.each(this.categories, function (key, value) {
            if (value.id == category_id) {
                res = key;
            }
        });
        return res;
    };
    siteManager.prototype.receiveTags = function (forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        var that = this;
        $.getJSON("/api/tags", function name(data) {
            if ((that.tags == undefined) || (forceUpdate)) {
                that.tags = [];
                $.each(data.data, function (key, value) {
                    that.tags.push(new Tag(value.id, value.name, value.slug, value.count));
                });
            }
            this.tags = that.tags;
            if (theVue != undefined) {
                theVue.tags = this.tags;
            }
            that.receiveMedias();
        });
    };
    siteManager.prototype.receiveTagsForMedia = function (json, forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = true; }
        var that = this;
        $.getJSON("/api/tags", function name(data) {
            if ((that.tags == undefined) || (forceUpdate)) {
                that.tags = [];
                $.each(data.data, function (key, value) {
                    that.tags.push(new Tag(value.id, value.name, value.slug, value.count));
                });
            }
            this.tags = that.tags;
            if (theVue != undefined) {
                theVue.tags = this.tags;
            }
            json = json.data;
            that.medias.unshift(new Media(json.id, json.title, json.description, json.source, json.poster_source, json.duration, json.simpleType, json.techType, json.type, that.getUserById(json.user_id), json.user_id, json.created_at, json.updated_at, json.created_at_readable, json.comments, that.getTagsByIdArray(json.tagsIds), json.myLike, json.likes, json.dislikes, json.tracks, json.category_id));
            theVue.medias = that.getFilteredMedias();
            theVue.$router.push('/');
        });
    };
    siteManager.prototype.getCommentById2 = function (id, callback) {
        if (callback === void 0) { callback = undefined; }
        if (id == null || id == 0) {
            return;
        }
        var theMedia = undefined;
        var that = this;
        this.medias.forEach(function (val, key) {
            val.comments.forEach(function (val2, key2) {
                if (val2.id == id) {
                    theMedia = val2;
                }
            });
        });
        if (theMedia == undefined) {
            that.receiveMediaByCommentId(id, callback);
        }
        else {
            callback();
        }
        return theMedia;
    };
    siteManager.prototype.receiveMediaByCommentId = function (mediaName, callback) {
        if (callback === void 0) { callback = undefined; }
        var that = this;
        var theKey;
        var existsAlready = false;
        $.getJSON("/internal-api/medias/byCommentId/" + mediaName, function name(data) {
            data = data.data;
            $.each(that.medias, function (key, value) {
                $.each(value.comments, function (key2, comment) {
                    if (comment.id == mediaName) {
                        existsAlready = true;
                        theKey = key;
                    }
                });
            });
            if (existsAlready == false) {
                var m = new Media(data.id, data.title, data.description, data.source, data.poster_source, data.duration, data.simpleType, data.techType, data.type, that.getUserById(data.user_id), data.user_id, data.created_at, data.updated_at, data.created_at_readable, data.comments, that.getTagsByIdArray(data.tagsIds), data.myLike, data.likes, data.dislikes, data.tracks, data.category_id);
                $.each(m.comments, function (key1, value1) {
                    m.comments[key1] = that.fillUser(value1);
                    m.comments[key1].user = that.getUserById(value1.user_id);
                });
                that.medias.push(m);
                that.medias = theMediaSorter.sort(that.medias);
                theVue.medias = that.getFilteredMedias();
            }
            else {
                var m = new Media(data.id, data.title, data.description, data.source, data.poster_source, data.duration, data.simpleType, data.techType, data.type, that.getUserById(data.user_id), data.user_id, data.created_at, data.updated_at, data.created_at_readable, data.comments, that.getTagsByIdArray(data.tagsIds), data.myLike, data.likes, data.dislikes, data.tracks, data.category_id);
                $.each(m.comments, function (key1, value1) {
                    m.comments[key1] = that.fillUser(value1);
                    m.comments[key1].user = that.getUserById(value1.user_id);
                });
                if (m != that.medias[theKey]) {
                    that.medias[theKey].likes = m.likes;
                    that.medias[theKey].dislikes = m.dislikes;
                    that.medias[theKey].tracks = m.tracks;
                    that.medias[theKey].updated_at = m.updated_at;
                    that.medias[theKey].comments = m.comments.sort(MediaSorter.byCreatedAtComments);
                    theVue.medias = that.getFilteredMedias();
                }
            }
            if (callback != undefined) {
                callback();
            }
        });
    };
    siteManager.prototype.receiveMediaById = function (mediaName, callback) {
        if (callback === void 0) { callback = undefined; }
        var that = this;
        var theKey;
        var existsAlready = false;
        $.getJSON("/internal-api/medias/byId/" + mediaName, function name(data) {
            $.each(that.medias, function (key, value) {
                if (value.id == mediaName) {
                    existsAlready = true;
                    theKey = key;
                }
            });
            data = data.data;
            if (that.findMediaById(mediaName) == undefined) {
                var m = new Media(data.id, data.title, data.description, data.source, data.poster_source, data.duration, data.simpleType, data.techType, data.type, that.getUserById(data.user_id), data.user_id, data.created_at, data.updated_at, data.created_at_readable, data.comments, that.getTagsByIdArray(data.tagsIds), data.myLike, data.likes, data.dislikes, data.tracks, data.category_id);
                $.each(m.comments, function (key1, value1) {
                    m.comments[key1] = that.fillUser(value1);
                    m.comments[key1].user = that.getUserById(value1.user_id);
                });
                that.medias.push(m);
                that.medias = theMediaSorter.sort(that.medias);
                theVue.medias = that.getFilteredMedias();
            }
            else {
                var m = new Media(data.id, data.title, data.description, data.source, data.poster_source, data.duration, data.simpleType, data.techType, data.type, that.getUserById(data.user_id), data.user_id, data.created_at, data.updated_at, data.created_at_readable, data.comments, that.getTagsByIdArray(data.tagsIds), data.myLike, data.likes, data.dislikes, data.tracks, data.category_id);
                $.each(m.comments, function (key1, value1) {
                    m.comments[key1] = that.fillUser(value1);
                    m.comments[key1].user = that.getUserById(value1.user_id);
                });
                if (m != that.medias[theKey]) {
                    that.medias[theKey].likes = m.likes;
                    that.medias[theKey].dislikes = m.dislikes;
                    that.medias[theKey].tracks = m.tracks;
                    that.medias[theKey].updated_at = m.updated_at;
                    that.medias[theKey].comments = m.comments.sort(MediaSorter.byCreatedAtComments);
                    theVue.medias = that.getFilteredMedias();
                }
            }
            if (callback != undefined) {
                callback();
            }
        });
    };
    siteManager.prototype.receiveMediaByName = function (mediaName, callback) {
        if (callback === void 0) { callback = undefined; }
        var that = this;
        var theKey;
        var existsAlready = false;
        $.getJSON("/internal-api/media/" + mediaName, function name(data) {
            $.each(that.medias, function (key, value) {
                if (value.title == mediaName) {
                    existsAlready = true;
                    theKey = key;
                }
            });
            data = data.data;
            if (that.findMediaByName(mediaName) == undefined) {
                var m = new Media(data.id, data.title, data.description, data.source, data.poster_source, data.duration, data.simpleType, data.techType, data.type, that.getUserById(data.user_id), data.user_id, data.created_at, data.updated_at, data.created_at_readable, data.comments, that.getTagsByIdArray(data.tagsIds), data.myLike, data.likes, data.dislikes, data.tracks, data.category_id);
                $.each(m.comments, function (key1, value1) {
                    m.comments[key1] = that.fillUser(value1);
                    m.comments[key1].user = that.getUserById(value1.user_id);
                });
                that.medias.push(m);
                that.medias = theMediaSorter.sort(that.medias);
                theVue.medias = that.getFilteredMedias();
            }
            else {
                var m = new Media(data.id, data.title, data.description, data.source, data.poster_source, data.duration, data.simpleType, data.techType, data.type, that.getUserById(data.user_id), data.user_id, data.created_at, data.updated_at, data.created_at_readable, data.comments, that.getTagsByIdArray(data.tagsIds), data.myLike, data.likes, data.dislikes, data.tracks, data.category_id);
                $.each(m.comments, function (key1, value1) {
                    m.comments[key1] = that.fillUser(value1);
                    m.comments[key1].user = that.getUserById(value1.user_id);
                });
                if (m != that.medias[theKey]) {
                    that.medias[theKey].likes = m.likes;
                    that.medias[theKey].dislikes = m.dislikes;
                    that.medias[theKey].tracks = m.tracks;
                    that.medias[theKey].updated_at = m.updated_at;
                    that.medias[theKey].comments = m.comments.sort(MediaSorter.byCreatedAtComments);
                    theVue.medias = that.getFilteredMedias();
                }
            }
            if (callback != undefined) {
                callback(data.id);
            }
        });
    };
    siteManager.prototype.getTagsByIdArray = function (arr) {
        var tmpTags = [];
        var that = this;
        $.each(arr, function (key, value) {
            tmpTags.push(that.findTagById(value));
        });
        return tmpTags;
    };
    siteManager.prototype.findTagById = function (id) {
        var returner = undefined;
        $.each(this.tags, function (key, value) {
            if (value.id == id) {
                returner = value;
            }
        });
        return returner;
    };
    siteManager.prototype.findMediaByName = function (mediaName) {
        var returnMedia = undefined;
        var that = this;
        $.each(that.medias, function (key, value) {
            if (value.title == mediaName) {
                returnMedia = value;
            }
        });
        return returnMedia;
    };
    siteManager.prototype.findMediaById = function (id, callback) {
        if (callback === void 0) { callback = undefined; }
        var returnMedia = undefined;
        var that = this;
        $.each(that.medias, function (key, value) {
            if (value.id == id) {
                returnMedia = value;
            }
        });
        if (returnMedia == undefined) {
            that.receiveMediaById(id, callback);
        }
        else {
            if (callback != undefined) {
                callback();
            }
        }
        return returnMedia;
    };
    siteManager.prototype.deleteMediaByName = function (mediaName) {
        console.log("deletemethod reach");
        var that = this;
        var i = 0;
        $.each(that.medias, function (key, value) {
            if (value != undefined) {
                if (value.title == mediaName) {
                    console.log("delete media " + mediaName);
                    that.medias.splice(i, 1);
                }
            }
            i++;
        });
        theVue.medias = that.getFilteredMedias();
        theVue.$router.push('/');
    };
    siteManager.prototype.receiveMedias = function (url, forceUpdate, callback) {
        if (url === void 0) { url = "/internal-api/media" + this.getIgnoreParam(); }
        if (forceUpdate === void 0) { forceUpdate = false; }
        if (callback === void 0) { callback = undefined; }
        var that = this;
        var loadCount = 0, replaceCount = 0;
        $.getJSON(url, function name(data) {
            if ((forceUpdate) || (that.medias == undefined)) {
                that.medias = [];
            }
            $.each(data.data, function (key, value) {
                if (that.findMediaById(value.id) == undefined) {
                    var m = new Media(value.id, value.title, value.description, value.source, value.poster_source, value.duration, value.simpleType, value.techType, value.type, that.getUserById(value.user_id), value.user_id, value.created_at, value.updated_at, value.created_at_readable, value.comments, that.getTagsByIdArray(value.tagsIds), value.myLike, value.likes, value.dislikes, value.tracks, value.category_id);
                    $.each(m.comments, function (key1, value1) {
                        m.comments[key1] = that.fillUser(value1);
                        m.comments[key1].user = that.getUserById(value1.user_id);
                    });
                    loadCount++;
                    m.comments = m.comments.sort(MediaSorter.byCreatedAtComments);
                    that.medias.push(m);
                    if (that.getCategoryKey(m.category_id) != undefined) {
                        that.categories[that.getCategoryKey(m.category_id)].medias.push(m);
                    }
                }
                else {
                    replaceCount++;
                }
            });
            if (data.meta != undefined && that.maxPage == -1) {
                if (data.meta.last_page != null) {
                    console.log("set maxPage");
                    console.log(data.meta.last_page);
                    that.maxPage = data.meta.last_page;
                }
            }
            if (theVue == undefined) {
                that.initVue();
                that.receiveNotifications();
            }
            theVue.users = that.users;
            theVue.categories = that.categories;
            console.log(this.categories);
            that.medias = theMediaSorter.sort(that.medias);
            theVue.medias = that.getFilteredMedias();
            theVue.categories = that.categories;
            if (theVue.$route.params.profileId != undefined) {
                theVue.user = that.getUserById(theVue.$route.params.profileId);
                theVue.medias = that.getFilteredMedias(that.getMediasByUser(theVue.$route.params.profileId));
            }
            if (theVue.$route.params.currentTitle != undefined) {
                if (that.findMediaByName(theVue.$route.params.currentTitle) == undefined) {
                    that.receiveMediaByName(theVue.$route.params.currentTitle, function (id) {
                        that.currentMediaId = id;
                        that.nextMedias = that.nextVideosList(id);
                        theVue.nextvideos = that.nextMedias;
                    });
                }
                else {
                    that.nextMedias = that.nextVideosList(that.findMediaByName(theVue.$route.params.currentTitle).id);
                    theVue.nextvideos = that.nextMedias;
                }
            }
            if (theVue.$route.params.editTitle != undefined) {
                if (that.findMediaByName(theVue.$route.params.editTitle) == undefined) {
                    that.receiveMediaByName(theVue.$route.params.editTitle, function (id) {
                        that.currentMediaId = id;
                    });
                }
            }
            if ((theVue.$router.currentRoute.path == "/search")) {
                theVue.searching();
            }
            if (loadCount == 0 && replaceCount == 0) {
                theVue.alert("All medias are loaded", "warning");
            }
            else {
                theVue.alert("Load " + loadCount + " and " + replaceCount + " medias already existed.");
            }
            var d = document.documentElement;
            var offset = d.scrollTop + window.innerHeight;
            var height = d.offsetHeight;
            if (offset > height) {
                if (that.maxPage >= that.currentPage) {
                    that.loadMorePages();
                }
            }
            if (callback != undefined) {
                callback();
            }
        });
    };
    siteManager.prototype.getUserById = function (id) {
        var search = new User(0, "None", "/img/404/avatar.png", "/img/404/background.png", "None-profile", {}, "", false);
        $.each(this.users, function (key, value) {
            if (value.id == id) {
                search = value;
            }
        });
        return search;
    };
    siteManager.prototype.getMediasByUser = function (id) {
        var userMedias = [];
        $.each(this.medias, function (key, value) {
            if (value.user_id == id) {
                userMedias.push(value);
            }
        });
        return userMedias;
    };
    return siteManager;
}());
;
if (sm == undefined) {
    var sm;
}
export function init(baseUrl) {
    sm = new siteManager(baseUrl);
    eventBus.$on('overviewPlayClick', function (title) {
        theVue.title = title;
    });
}
