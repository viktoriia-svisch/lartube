var baseUrl;
import Vue from 'vue';
import Router from 'vue-router';
import BootstrapVue from 'bootstrap-vue';
import VueCroppie from 'vue-croppie';
import { eventBus } from './eventBus';
import { MediaSorter, Search } from './tools';
import { User, Media, Tag } from './models';
import VueApexCharts from 'vue-apexcharts';
var app;
var theVue;
var searchDelay;
var theMediaSorter = new MediaSorter();
require("./models");
var siteManager =  (function () {
    function siteManager(base) {
        this.initing = true;
        baseUrl = base + "/";
        this.currentPage = "overview";
        this.catchedTagMedias = [];
        this.usedSearchTerms = [];
        this.loggedUserId = Number($("#loggedUserId").attr("content"));
        this.receiveUsers(true);
        var that = this;
    }
    siteManager.prototype.initVue = function () {
        var _this = this;
        Vue.use(Router);
        Vue.use(BootstrapVue);
        Vue.use(VueCroppie);
        Vue.use(VueApexCharts);
        Vue.component('apexchart', VueApexCharts);
        Vue.component('passport-clients', require('./components/passport/Clients.vue').default);
        Vue.component('passport-authorized-clients', require('./components/passport/AuthorizedClients.vue').default);
        Vue.component('passport-personal-access-tokens', require('./components/passport/PersonalAccessTokens.vue').default);
        var overview = Vue.component('overview', require("./components/OverviewComponent.vue"));
        var player = Vue.component('player', require("./components/MediaComponent.vue"));
        var profileComp = Vue.component('profile', require("./components/ProfileComponent.vue"));
        var tagComp = Vue.component('tags', require("./components/TagComponent.vue"));
        var loginComp = Vue.component('login', require("./components/LoginComponent.vue"));
        var uploadComp = Vue.component('upload', require("./components/UploadComponent.vue"));
        var searchComp = Vue.component('search', require("./components/SearchComponent.vue"));
        var chartsComp = Vue.component('search', require("./components/ChartsComponent.vue"));
        var editVideoComp = Vue.component('search', require("./components/EditVideo.vue"));
        var aboutComp = Vue.component('search', require("./components/About.vue"));
        var that = this;
        var routes = [
            { path: '/', component: overview },
            { path: '/media/:currentTitle', component: player },
            { path: '/profile/:profileId', component: profileComp },
            { path: '/tags', component: tagComp },
            { path: '/tags/:tagName', component: tagComp },
            { path: '/login', component: loginComp },
            { path: '/upload', component: uploadComp },
            { path: '/search', component: searchComp },
            { path: '/charts', component: chartsComp },
            { path: '/about', component: aboutComp },
            { path: '/mediaedit/:editTitle', component: editVideoComp }
        ];
        theVue = new Vue({
            data: {
                title: "Overview",
                dismisssecs: 10,
                dismisscountdown: 0,
                showdismissiblealert: false,
                alertmsg: "",
                alerttype: "",
                search: '',
                users: this.users,
                loggeduserid: this.loggedUserId,
                tags: this.tags,
                canloadmore: true,
                medias: this.medias,
                user: new User(0, "None", "img/404/avatar.png", "img/404/background.png", "None-user", {}),
                baseUrl: baseUrl
            },
            router: new Router({ routes: routes }),
            methods: {
                emitRefreshMedias: function () {
                    eventBus.$emit('refreshMedias', "");
                },
                emitLoadAllMedias: function () {
                    eventBus.$emit('loadAllMedias', "");
                },
                toggleSidebar: function () {
                    console.log("toggle clicked!");
                    $('#sidebar').toggleClass('d-none');
                    $("#outerContainer").toggleClass('sidebar-spacer');
                    $('.collapse.in').toggleClass('in');
                    $('a[aria-expanded=true]').attr('aria-expanded', 'false');
                },
                countDownChanged: function (dismisscountdown) {
                    this.dismisscountdown = dismisscountdown;
                },
                emitGetNewMedias: function () {
                    eventBus.$emit('getNewMedias', "");
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
                            that.receiveMedias("/internal-api/media/search/" + s);
                        }, 300);
                    }
                    var so = new Search(s.toString(), that.medias, that.tags, that.users);
                    theVue.search = so;
                    theVue.medias = so.mediaResult;
                    theVue.users = so.userResult;
                }
            },
            mounted: function () {
            },
            watch: {
                $route: function (to, from) {
                    if (to.params.currentTitle != undefined) {
                        if (sm.findMediaByName(to.params.currentTitle) == undefined) {
                            sm.receiveMediaByName(to.params.currentTitle);
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
                }
            }
        }).$mount('#app2');
        eventBus.$on('getNewMedias', function (title) {
            theVue.dismisscountdown = 10;
            theVue.alertmsg = "Look for new medias..";
            theVue.alerttype = "info";
            that.receiveMedias();
        });
        eventBus.$on('refreshMedias', function (title) {
            theVue.canloadmore = true;
            that.catchedTagMedias = [];
            _this.usedSearchTerms = [];
            that.receiveMedias("/internal-api/media" + _this.getIgnoreParam(), true);
        });
        eventBus.$on('loadAllMedias', function (title) {
            that.receiveMedias("/internal-api/media/all" + _this.getIgnoreParam(), true);
            theVue.canloadmore = false;
        });
        eventBus.$on('sortBy', function (sortBy) {
            theMediaSorter.sortBy = sortBy;
            if (theVue.$router.currentRoute.path == "/search") {
                theVue.search.mediaResult = theMediaSorter.sort(theVue.search.mediaResult);
            }
            that.medias = theMediaSorter.sort(that.medias);
            theVue.medias = that.medias;
        });
        eventBus.$on('commentCreated', function (json) {
            that.receiveMediaByName(that.findMediaById(Number(json.data.media_id)).title);
            theVue.dismisscountdown = 10;
            theVue.alertmsg = "Comment created";
            theVue.alerttype = "success";
        });
        eventBus.$on('videoDeleted', function (title) {
            theVue.dismisscountdown = 10;
            theVue.alertmsg = "Video " + title + " deleted";
            theVue.alerttype = "success";
            that.deleteMediaByName(title);
        });
        eventBus.$on('videoCreated', function (json) {
            that.receiveTagsForMedia(json);
            theVue.dismisscountdown = 10;
            theVue.alertmsg = "Video " + json.data.title + " created";
            theVue.alerttype = "success";
        });
        eventBus.$on('videoEdited', function (json) {
            that.deleteMediaByName(json[0]);
            that.receiveTagsForMedia(json[1]);
            theVue.dismisscountdown = 10;
            theVue.alertmsg = "Video " + json[1].data.title + " edited";
            theVue.alerttype = "success";
        });
        eventBus.$on('checkTag', function (tagName) {
            if (tagName == '') {
                if ($("#specialAllTag").is(":checked")) {
                    theVue.medias = that.medias;
                }
                else {
                    theVue.medias = [];
                    theVue.medias = that.medias;
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
            that.receiveMedias(that.nextLink);
        });
        eventBus.$on('refreshSearch', function (title) {
            theVue.searching();
        });
        eventBus.$on('showAlert', function (data) {
            theVue.dismisscountdown = theVue.dismisssecs;
        });
    };
    siteManager.prototype.getCurrentSite = function () {
        return this.currentPage;
    };
    siteManager.prototype.receiveUsers = function (forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        var that = this;
        $.getJSON("/api/user", function name(data) {
            if ((that.users == undefined) || (forceUpdate)) {
                that.users = [];
                $.each(data.data, function (key, value) {
                    that.users.push(new User(value.id, value.name, value.avatar, value.background, value.bio, value.mediaIds));
                });
                that.receiveTags();
            }
        });
    };
    siteManager.prototype.getIgnoreParam = function () {
        var content = "?i=0";
        $.each(this.medias, function (key, value) {
            content += "," + value.id;
        });
        return content;
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
            that.medias.unshift(new Media(json.id, json.title, json.description, json.source, json.poster_source, json.duration, json.simpleType, json.type, that.getUserById(json.user_id), json.user_id, json.created_at, json.updated_at, json.created_at_readable, json.comments, that.getTagsByIdArray(json.tagsIds), json.myLike, json.likes, json.dislikes));
            theVue.medias = that.medias;
            theVue.$router.push('/');
        });
    };
    siteManager.prototype.receiveMediaByName = function (mediaName, forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
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
                var m = new Media(data.id, data.title, data.description, data.source, data.poster_source, data.duration, data.simpleType, data.type, that.getUserById(data.user_id), data.user_id, data.created_at, data.updated_at, data.created_at_readable, data.comments, that.getTagsByIdArray(data.tagsIds), data.myLike, data.likes, data.dislikes);
                $.each(m.comments, function (key1, value1) {
                    m.comments[key1].user = that.getUserById(value1.user_id);
                });
                that.medias.push(m);
                that.medias = theMediaSorter.sort(that.medias);
                theVue.medias = that.medias;
            }
            else {
                var m = new Media(data.id, data.title, data.description, data.source, data.poster_source, data.duration, data.simpleType, data.type, that.getUserById(data.user_id), data.user_id, data.created_at, data.updated_at, data.created_at_readable, data.comments, that.getTagsByIdArray(data.tagsIds), data.myLike, data.likes, data.dislikes);
                $.each(m.comments, function (key1, value1) {
                    m.comments[key1].user = that.getUserById(value1.user_id);
                });
                if (m != that.medias[theKey]) {
                    that.medias[theKey].comments = JSON.parse(JSON.stringify(m.comments)).sort(MediaSorter.byCreatedAtComments);
                    theVue.medias = that.medias;
                }
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
    siteManager.prototype.findMediaById = function (id) {
        var returnMedia = undefined;
        var that = this;
        $.each(that.medias, function (key, value) {
            if (value.id == id) {
                returnMedia = value;
            }
        });
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
        theVue.medias = that.medias;
        theVue.$router.push('/');
    };
    siteManager.prototype.receiveMedias = function (url, forceUpdate) {
        if (url === void 0) { url = "/internal-api/media" + this.getIgnoreParam(); }
        if (forceUpdate === void 0) { forceUpdate = false; }
        var that = this;
        $.getJSON(url, function name(data) {
            if ((forceUpdate) || (that.medias == undefined)) {
                that.medias = [];
            }
            $.each(data.data, function (key, value) {
                if (that.findMediaById(value.id) == undefined) {
                    var m = new Media(value.id, value.title, value.description, value.source, value.poster_source, value.duration, value.simpleType, value.type, that.getUserById(value.user_id), value.user_id, value.created_at, value.updated_at, value.created_at_readable, value.comments, that.getTagsByIdArray(value.tagsIds), value.myLike, value.likes, value.dislikes);
                    $.each(m.comments, function (key1, value1) {
                        m.comments[key1].user = that.getUserById(value1.user_id);
                    });
                    m.comments = JSON.parse(JSON.stringify(m.comments)).sort(MediaSorter.byCreatedAtComments);
                    that.medias.push(m);
                }
                else {
                    var m = new Media(value.id, value.title, value.description, value.source, value.poster_source, value.duration, value.simpleType, value.type, that.getUserById(value.user_id), value.user_id, value.created_at, value.updated_at, value.created_at_readable, value.comments, that.getTagsByIdArray(value.tagsIds), value.myLike, value.likes, value.dislikes);
                    $.each(m.comments, function (key1, value1) {
                        m.comments[key1].user = that.getUserById(value1.user_id);
                    });
                    if (m != value) {
                        console.log("Media replaced " + value.title + " with " + m.title);
                        m.comments = JSON.parse(JSON.stringify(m.comments)).sort(MediaSorter.byCreatedAtComments);
                        that.medias[key] = m;
                    }
                }
            });
            if (data.links != undefined) {
                that.nextLink = data.links.next;
                that.lastLink = data.links.prev;
            }
            if (theVue == undefined) {
                that.initVue();
            }
            if (that.nextLink == null) {
                theVue.canloadmore = false;
            }
            theVue.users = that.users;
            that.medias = theMediaSorter.sort(that.medias);
            theVue.medias = that.medias;
            if (theVue.$route.params.profileId != undefined) {
                theVue.user = sm.getUserById(theVue.$route.params.profileId);
                theVue.medias = sm.getMediasByUser(theVue.$route.params.profileId);
            }
            if (theVue.$route.params.currentTitle != undefined) {
                if (that.findMediaByName(theVue.$route.params.currentTitle) == undefined) {
                    that.receiveMediaByName(theVue.$route.params.currentTitle);
                }
            }
            if (theVue.$route.params.editTitle != undefined) {
                if (that.findMediaByName(theVue.$route.params.editTitle) == undefined) {
                    that.receiveMediaByName(theVue.$route.params.editTitle);
                }
            }
            if ((theVue.$router.currentRoute.path == "/search")) {
                theVue.searching();
            }
        });
    };
    siteManager.prototype.getUserById = function (id) {
        var search = new User(0, "None", "/img/404/avatar.png", "/img/404/background.png", "None-profile", {});
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
