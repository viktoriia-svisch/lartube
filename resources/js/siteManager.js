var baseUrl;
import Vue from 'vue';
import Vuex from 'vuex';
import Router from 'vue-router';
import VueCroppie from 'vue-croppie';
import { eventBus, store } from './eventBus';
import translation from './translation';
import dateTranslation from './dateTranslation';
import { MediaSorter, Search } from './tools';
import { User, Media, Tag, Category, Notification } from './models';
import VueApexCharts from 'vue-apexcharts';
import 'material-icons/iconfont/material-icons.css';
import 'plyr/dist/plyr.css';
import VuePlyr from 'vue-plyr';
import VueI18n from 'vue-i18n';
import Treeselect from '@riophae/vue-treeselect';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
Vue.use(Vuetify, {
    theme: {
        primary: '#3f51b5',
        secondary: '#b0bec5',
        accent: '#8c9eff',
        success: 'green',
        error: '#b71c1c'
    }
});
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
Vue.use(Vuex);
Vue.use(Router);
Vue.use(VueCroppie);
Vue.use(VueApexCharts);
Vue.use(VuePlyr);
Vue.use(VueI18n);
Vue.component('treeselect', Treeselect);
Vue.component('apexchart', VueApexCharts);
var theVue;
var searchDelay;
var theMediaSorter = new MediaSorter();
var i18n;
class siteManager {
    constructor(env) {
        store.commit("setEnv", env);
        this.init();
    }
    init() {
        store.commit("reset");
        this.blockScrollExecution = false;
        this.catchedTagMedias = [];
        this.usedSearchTerms = [];
        this.usedCatRequests = [];
        this.loadedLangs = ['en'];
        this.nextMedias = [];
        this.initReceive();
    }
    initReceive() {
        let that = this;
        this.updateCSRF(function () {
            that.receiveUsers(function () {
                that.receiveTags(function () {
                    that.receiveCategories(function () {
                        that.initVue();
                        that.receiveMedias("/internal-api/media" + that.getIgnoreParam(), false, function () {
                            that.receiveNotifications();
                        });
                        if (that.notificationTimer != undefined) {
                            clearInterval(that.notificationTimer);
                        }
                        that.notificationTimer = setInterval(function () {
                            console.log("check for new notifications");
                            that.receiveNotifications();
                        }, 120000);
                    });
                });
            });
        });
    }
    initVue() {
        var overview = Vue.component('overview', require("./components/OverviewComponent.vue"));
        var player = Vue.component('player', require("./components/MediaComponent.vue"));
        var profileComp = Vue.component('profile', require("./components/ProfileComponent.vue"));
        var editProfileComp = Vue.component('editprofile', require("./components/settings/EditProfile.vue"));
        var tagComp = Vue.component('tags', require("./components/Tags.vue"));
        var registerComp = Vue.component('register', require("./components/auth/Register.vue"));
        var personalAccessTokensComp = Vue.component('PersonalAccessTokens', require("./components/passport/PersonalAccessTokens.vue"));
        var clientsComp = Vue.component('Clients', require("./components/passport/Clients.vue"));
        var authorizedClientsComp = Vue.component('AuthorizedClients', require("./components/passport/AuthorizedClients.vue"));
        var faLoginComp = Vue.component('twofaLogin', require("./components/auth/twofaLogin.vue"));
        var uploadComp = Vue.component('upload', require("./components/UploadComponent.vue"));
        var searchComp = Vue.component('search', require("./components/SearchComponent.vue"));
        var chartsComp = Vue.component('search', require("./components/ChartsComponent.vue"));
        var editVideoComp = Vue.component('search', require("./components/EditVideo.vue"));
        var aboutComp = Vue.component('search', require("./components/About.vue"));
        var sidebarComp = Vue.component('thesidebar', require("./components/Navigation.vue"));
        var catComp = Vue.component('thesidebar', require("./components/Categories.vue"));
        var uaComp = Vue.component('thesidebar', require("./components/admin/UserAdmin.vue"));
        var roles = Vue.component('roles', require("./components/admin/Roles.vue"));
        var myVideosComp = Vue.component('thesidebar', require("./components/MyVideos.vue"));
        var notiComp = Vue.component('thesidebar', require("./components/Notifications.vue"));
        var ccComp = Vue.component('thesidebar', require("./components/CreateCategory.vue"));
        var ceComp = Vue.component('thesidebar', require("./components/EditCategory.vue"));
        var singleCatComp = Vue.component('thesidebar', require("./components/Category.vue"));
        var friendsComp = Vue.component('friends', require("./components/settings/Friends.vue"));
        let that = this;
        const routes = [
            { path: '/', component: overview },
            { path: '/media/:currentTitle', component: player },
            { path: '/profile/:profileId', component: profileComp },
            { path: '/tags', component: tagComp },
            { path: '/settings/friends', component: friendsComp },
            { path: '/tags/:tagName', component: tagComp },
            { path: '/passport/clients', component: clientsComp },
            { path: '/passport/personalaccess', component: personalAccessTokensComp },
            { path: '/settings/profile', component: editProfileComp },
            { path: '/settings/apps', component: authorizedClientsComp },
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
            { path: '/admin/roles', component: roles },
            { path: '/mediaedit/:editTitle', component: editVideoComp }
        ];
        eventBus.$on('alert', a => {
            console.log("received create alert");
            theVue.alert(a.text, a.type);
        });
        eventBus.$on('getNotifications', url => {
            that.receiveNotifications(url, function () {
                theVue.alert(theVue.$t("New") + " " + theVue.$t("notifications") + " " + theVue.$t("received"));
            });
        });
        eventBus.$on('getNewMedias', title => {
            that.receiveMedias("/internal-api/media" + that.getIgnoreParam(), false, function () {
                theVue.alert(theVue.$t("New") + " " + theVue.$t("medias") + " " + theVue.$t("received"));
            });
        });
        eventBus.$on('languageChange', lang => {
            that.getLang(lang);
        });
        eventBus.$on('userEdited', id => {
            that.receiveUsers(function () {
                that.updateCSRF();
                theVue.alert(theVue.$t("User") + " " + theVue.$t("edited"));
                if (id != '' && id != undefined) {
                    theVue.$router.push("/profile/" + id);
                }
            });
        });
        eventBus.$on('refreshMedias', title => {
            theVue.canloadmore = true;
            that.catchedTagMedias = [];
            this.usedSearchTerms = [];
            this.usedCatRequests = [];
            that.receiveMedias("/internal-api/media" + that.getIgnoreParam(), true, function () {
                that.updateCSRF();
            });
        });
        eventBus.$on('closeAlarm', title => {
            theVue.alertshown = false;
        });
        eventBus.$on('loadAllMedias', title => {
            that.receiveMedias("/internal-api/medias/all" + that.getIgnoreParam(), false, function () {
                theVue.canloadmore = false;
                that.updateCSRF();
            });
        });
        eventBus.$on('autoplayNextVideo', id => {
            console.log("received autoplay");
            var tmpv = store.getters.nextMediasList(id);
            if (tmpv.length > 0) {
                console.log("got values!" + tmpv[0].title);
                theVue.$router.push('/media/' + tmpv[0].urlTitle);
                that.nextMedias = store.getters.nextMediasList(tmpv[0].id);
                if (that.nextMedias == null || that.nextMedias == undefined) {
                    console.log("do load more cause nextvideos is empty");
                    that.loadMorePages(function () {
                        that.loadMorePages();
                        console.log("received by callback from nextvideo-empty");
                    });
                }
            }
            else {
                that.loadMorePages(function () {
                    theVue.$router.push('/media/' + that.nextMedias[0].urlTitle);
                    if (that.nextMedias == null || that.nextMedias == undefined) {
                        that.loadMorePages(function () {
                            that.loadMorePages();
                        });
                    }
                });
            }
        });
        eventBus.$on('login', settings => {
            store.commit("setLoginId", settings.user_id);
            that.receiveUsers(function () {
                theVue.$router.push('/');
                that.updateCSRF();
                theVue.alert("Welcome back, " + store.getters.getUserById(store.state.loginId).name, "success", "exit_to_app");
            });
        });
        eventBus.$on('logout', settings => {
            store.commit("setLoginId", 0);
            theVue.alert("Logged out", "danger", "power_settings_new");
            theVue.$router.push('/');
            that.updateCSRF();
        });
        eventBus.$on('loginFailed', settings => {
            theVue.alert("Login failed", "danger", "error");
        });
        eventBus.$on('loadUserVideos', userid => {
            that.receiveMedias("/internal-api/medias/by/" + userid + this.getIgnoreParam());
        });
        eventBus.$on('sortBy', sortBy => {
            theMediaSorter.setSortBy(sortBy);
            store.commit("sortMediasBy", sortBy);
            if (theVue.$router.currentRoute.path == "/search") {
                theVue.search.mediaResult = theMediaSorter.sort(theVue.search.mediaResult);
            }
        });
        eventBus.$on('commentCreated', json => {
            that.receiveMediaById(json.data.media_id, function () {
                that.updateCSRF();
                theVue.alert(theVue.$t("Comment") + " " + theVue.$t("created"), "success");
            });
        });
        eventBus.$on('refreshMedia', id => {
            that.receiveMediaById(id, function () {
                that.updateCSRF();
            });
        });
        eventBus.$on('loadMediaById', id => {
            that.receiveMediaById(id);
            that.updateCSRF();
            if (theVue != undefined) {
                theVue.alert("Media load by id", "success");
            }
        });
        eventBus.$on('loadMediaByCommentId', id => {
            that.receiveMediaByCommentId(id, function () {
                that.updateCSRF();
                if (theVue != undefined) {
                    theVue.alert("Media load by comment", "success");
                }
            });
        });
        eventBus.$on('loadMedia', title => {
            that.receiveMediaByName(encodeURIComponent(title), function (id) {
                that.updateCSRF();
                store.commit("disableBlockRequest");
                if (theVue != undefined) {
                    console.log("[loadMedia] update the vue after receive media");
                }
            });
        });
        eventBus.$on('videoDeleted', title => {
            theVue.alert("Video " + title + " deleted", "success");
            store.commit("deleteMediaByTitle", title);
            theVue.$router.push('/');
            that.updateCSRF();
        });
        eventBus.$on('videoCreated', json => {
            that.receiveTags();
            theVue.alert("Video " + json.data.title + " created", "success");
            that.updateCSRF();
        });
        eventBus.$on('categoriesRefreshed', json => {
            that.receiveCategories(function () {
                theVue.alert("Categories refreshed", "success");
                that.updateCSRF();
                theVue.$router.push("/categories");
            });
        });
        eventBus.$on('videoEdited', json => {
            store.commit("updateOrAddMedia", this.jsonToMedia(json[1].data));
            theVue.$router.push('/media/' + json[0]);
            theVue.alert("Video " + json[1].data.title + " edited", "success");
            that.updateCSRF();
        });
        eventBus.$on('checkTag', tagName => {
            if (tagName != '') {
                if (that.catchedTagMedias.includes(tagName) == false) {
                    that.catchedTagMedias.push(tagName);
                    that.receiveMedias("/internal-api/tags/" + tagName, false, function () {
                    });
                }
            }
        });
        eventBus.$on('loadMore', title => {
            that.loadMorePages();
        });
        $(window).scroll(function () {
            if ($(window).scrollTop() + $(window).height() > $(document).height() - 50) {
                if (theVue.canloadmore && that.blockScrollExecution == false) {
                    if (theVue.$router.currentRoute.path == "/" || theVue.$router.currentRoute.path == "/tags") {
                        console.log("near bottom, do a request and block until request done!");
                        that.blockScrollExecution = true;
                        that.loadMorePages(function () {
                            console.log("done, allow next request");
                            that.blockScrollExecution = false;
                        });
                    }
                }
            }
        });
        eventBus.$on('refreshSearch', title => {
            theVue.searching();
        });
        eventBus.$on('getMediasByCatId', id => {
            if (that.usedCatRequests.includes(id) == false) {
                that.usedCatRequests.push(id);
                that.receiveMedias("/internal-api/medias/byCatId/" + id + that.getIgnoreParam(), false, function () {
                    eventBus.$emit('mediasByCatIdReceived', id);
                });
            }
        });
        eventBus.$on('filterTypes', types => {
            store.commit("setFilterTypes", types);
            if (theVue.$router.currentRoute.path == "/search") {
                theVue.searching();
            }
        });
        var lang = "en";
        if (localStorage.getItem("language") != '' && localStorage.getItem("language") != undefined) {
            lang = localStorage.getItem("language");
        }
        i18n = new VueI18n({
            locale: 'en',
            fallbackLocale: 'en',
            messages: translation,
            dateTimeFormats: dateTranslation
        });
        if (lang != "en") {
            this.getLang(lang);
        }
        theVue = new Vue({
            i18n,
            data: {
                search: undefined,
                treecatptions: undefined,
                canloadmore: true,
                baseUrl: baseUrl,
                alertshown: false,
                alerttext: '',
                alertcolor: 'success'
            },
            components: {
                'thesidebar': sidebarComp
            },
            computed: {
                medias: function () {
                    return store.getters.getMediasByTypes();
                }
            },
            router: new Router({ routes,
                scrollBehavior(to, from, savedPosition) {
                    return { x: 0, y: 0 };
                }
            }),
            methods: {
                alert(msg, type = "green", icon = '') {
                    console.log("alert-method");
                    this.alertshown = true;
                    this.alerttext = msg;
                    this.alertcolor = type;
                },
                openLoading() {
                },
                searching() {
                    var s = $("#theLiveSearch").val();
                    if (theVue.$router.currentRoute.path != "/search" && s != '') {
                        theVue.$router.push('/search');
                    }
                    if (theVue.$router.currentRoute.path == "/search" && s == '') {
                        theVue.$router.go(-1);
                    }
                    if (s != '') {
                        if (that.usedSearchTerms.includes(s.toString()) == false && s.toString() != "") {
                            if (searchDelay != undefined) {
                                clearTimeout(searchDelay);
                            }
                            searchDelay = setTimeout(function () {
                                that.usedSearchTerms.push(s);
                                that.receiveMedias("/internal-api/medias/search/" + s + that.getIgnoreParam(), false, function () {
                                    var so = new Search(s.toString(), store.getters.getMediasByTypes(), store.state.tags, store.state.users);
                                    theVue.search = so;
                                    theVue.userResult = so.userResult;
                                });
                            }, 300);
                        }
                        var so = new Search(s.toString(), store.getters.getMediasByTypes(), store.state.tags, store.state.users);
                        theVue.search = so;
                        console.log(so.userResult);
                        theVue.userResult = so.userResult;
                    }
                }
            },
            mounted() {
            },
            watch: {
                $route(to, from) {
                    if (from.path == "/search" && to.path != "/search") {
                        $("#theLiveSearch").val('');
                    }
                    if (to.path == "/login" || to.path == "/register") {
                        if (store.state.loginId != 0) {
                            theVue.$router.push('/');
                        }
                    }
                }
            }
        }).$mount('#app');
        theVue.$router.beforeResolve((to, from, next) => {
            next();
        });
        theVue.$router.afterEach((to, from) => {
        });
        if (localStorage.getItem('cookiePolicy') != "read") {
        }
    }
    loadMorePages(callback = undefined) {
        if (store.state.totalMedias > store.state.medias.length) {
            console.log("loadMorePages go for");
            this.receiveMedias('/internal-api/media?' + this.getIgnoreParam(false), false, callback);
            theVue.canloadmore = true;
        }
        else {
            console.log("loadMorePages end reached");
            theVue.canloadmore = false;
        }
    }
    fillUser(comment) {
        let that = this;
        $.each(comment.childs, function (key, value) {
            if (value.childs.length > 0) {
                comment.childs[key] = that.fillUser(value);
            }
            comment.childs[key].user = store.getters.getUserById(value.user_id);
        });
        comment.childs = comment.childs.sort(MediaSorter.byCreatedAtComments);
        return comment;
    }
    getLang(lang) {
        if (this.loadedLangs.includes(lang) == false) {
            this.loadedLangs.push(lang);
            $.getJSON('/lang/' + lang + ".json").done(function (data) {
                i18n.setLocaleMessage(lang, data.default);
                i18n.locale = lang;
            });
        }
        else {
            i18n.locale = lang;
        }
    }
    updateCSRF(callback = undefined) {
        let that = this;
        $.getJSON('/internal-api/refresh-csrf').done(function (data) {
            store.commit("setCSRF", data.csrf);
            store.commit("setTotalMedias", data.totalMedias);
            if (theVue != undefined) {
                if (store.state.totalMedias > store.state.medias.length) {
                    theVue.canloadmore = true;
                }
            }
            if (callback != undefined) {
                callback();
            }
        });
    }
    receiveUsers(callback = undefined) {
        $.getJSON("/internal-api/users", function name(data) {
            var tmpUsers = [];
            $.each(data.data, function (key, value) {
                var u = new User(value);
                tmpUsers.push(u);
            });
            store.commit("setUsers", tmpUsers);
            if (callback != undefined) {
                callback();
            }
        });
    }
    getIgnoreParam(first = true) {
        var content = "&i=0";
        if (first) {
            content = "?i=0";
        }
        $.each(store.state.medias, function (key, value) {
            content += "," + value.id;
        });
        return content + "&types=" + store.state.filterTypes.join() + "&sortBy=" + theMediaSorter.sortBy;
    }
    mkTreeCat(data, l = 0) {
        var result = [];
        if (l == 0) {
            result = [{ id: 0, label: 'None' }];
        }
        let that = this;
        $.each(data, function (key, value) {
            if (value.children.length > 0) {
                result.push({ id: value.id, label: value.title, children: that.mkTreeCat(value.children, 1) });
            }
            else {
                result.push({ id: value.id, label: value.title });
            }
        });
        return result;
    }
    receiveCategories(callback = undefined) {
        let that = this;
        $.getJSON("/internal-api/categories", function name(data) {
            var tmpCategories = [];
            $.each(data.data, function (key, value) {
                tmpCategories.push(new Category(value.id, value.title, value.description, value.avatar, value.background, value.parent_id, value.children));
            });
            that.treecatptions = that.mkTreeCat(data.data);
            store.commit("setCategories", tmpCategories);
            if (theVue != undefined) {
                theVue.treecatptions = that.treecatptions;
            }
            if (callback != undefined) {
                callback();
            }
        });
    }
    receiveNotifications(url = '/internal-api/notifications', callback = undefined) {
        let that = this;
        if (store.state.loginId != 0) {
            $.getJSON(url, function name(data) {
                var theNotifications = [];
                $.each(data, function (key, value) {
                    if (value.data != undefined) {
                        if (value.data.media_id != null && value.data.media_id != 0) {
                            that.findMediaById(value.data.media_id, function () {
                                console.log("push media-like-notification " + value.id);
                                theNotifications.push(new Notification(value.id, value.type, value.data, value.read_at, value.created_at));
                            });
                        }
                        else if (value.data.comment_id != null && value.data.comment_id != 0) {
                            console.log("load a comment");
                            that.getCommentById2(value.data.comment_id, function () {
                                console.log("push comment-like-notification " + value.id);
                                theNotifications.push(new Notification(value.id, value.type, value.data, value.read_at, value.created_at));
                            });
                        }
                    }
                });
                store.commit("setNotifications", theNotifications);
                if (callback != undefined) {
                    callback();
                }
            });
        }
        else {
            if (callback != undefined) {
                callback();
            }
        }
    }
    getCategoryById(category_id, data = undefined) {
        var res;
        let that = this;
        var idata = store.state.categories;
        if (data != undefined) {
            idata = data;
        }
        $.each(idata, function (key, value) {
            if (value.children.length > 0) {
                var t = that.getCategoryById(category_id, value.children);
                if (t != undefined) {
                    res = t;
                }
            }
            if (value.id == category_id) {
                res = value;
            }
        });
        return res;
    }
    receiveTags(callback = undefined) {
        $.getJSON("/internal-api/tags", function name(data) {
            var tmpTags = [];
            $.each(data.data, function (key, value) {
                tmpTags.push(new Tag(value.id, value.name, value.slug, value.count));
            });
            store.commit("setTags", tmpTags);
            if (callback != undefined) {
                callback();
            }
        });
    }
    getCommentById2(id, callback = undefined) {
        if (id == null || id == 0) {
            return;
        }
        var theComment = undefined;
        let that = this;
        store.state.medias.forEach(function (val, key) {
            val.comments.forEach(function (comment, key2) {
                if (comment.id == id) {
                    theComment = comment;
                }
            });
        });
        if (theComment == undefined) {
            that.receiveMediaByCommentId(id, callback);
        }
        else {
            if (callback != undefined) {
                callback();
            }
        }
        return theComment;
    }
    receiveMediaByCommentId(cid, callback = undefined) {
        let that = this;
        $.getJSON("/internal-api/medias/byCommentId/" + cid, function name(data) {
            data = data.data;
            var m = that.jsonToMedia(data);
            store.commit("updateOrAddMedia", m);
            if (callback != undefined) {
                callback();
            }
        });
    }
    receiveMediaById(mediaName, callback = undefined) {
        let that = this;
        $.getJSON("/internal-api/medias/byId/" + mediaName, function name(data) {
            data = data.data;
            var m = that.jsonToMedia(data);
            store.commit("updateOrAddMedia", m);
            if (callback != undefined) {
                callback();
            }
        });
    }
    receiveMediaByName(mediaName, callback = undefined) {
        let that = this;
        $.getJSON("/internal-api/media/" + mediaName, function name(data) {
            data = data.data;
            var m = that.jsonToMedia(data);
            store.commit("updateOrAddMedia", m);
            if (callback != undefined) {
                callback(data.id);
            }
        });
    }
    getTagsByIdArray(arr) {
        var tmpTags = [];
        let that = this;
        $.each(arr, function (key, value) {
            tmpTags.push(that.findTagById(value));
        });
        return tmpTags;
    }
    findTagById(id) {
        var returner = undefined;
        $.each(store.state.tags, function (key, value) {
            if (value.id == id) {
                returner = value;
            }
        });
        return returner;
    }
    findMediaById(id, callback = undefined, getIfUndefined = true) {
        var returnMedia = undefined;
        let that = this;
        console.warn("[findMediaById] deprecated function");
        $.each(store.state.medias, function (key, value) {
            if (value.id == id) {
                returnMedia = value;
            }
        });
        if (returnMedia == undefined) {
            if (getIfUndefined) {
                that.receiveMediaById(id, callback);
            }
        }
        else {
            if (callback != undefined) {
                callback();
            }
        }
        return returnMedia;
    }
    jsonToMedia(value) {
        let that = this;
        var m = new Media(value.id, value.title, value.description, value.sources, value.base_type, value.chapters, value.view, value.totalView, value.poster_source, value.duration, store.getters.getUserById(value.user_id), value.user_id, value.created_at, value.updated_at, value.created_at_readable, value.comments, this.getTagsByIdArray(value.tagsIds), value.myLike, value.likes, value.dislikes, value.tracks, value.category_id);
        $.each(m.comments, function (key1, value1) {
            m.comments[key1] = that.fillUser(value1);
            m.comments[key1].user = store.getters.getUserById(value1.user_id);
        });
        m.comments = m.comments.sort(MediaSorter.byCreatedAt);
        m.comments.sort(MediaSorter.byCreatedAtComments);
        return m;
    }
    receiveMedias(url = "/internal-api/media" + this.getIgnoreParam(), forceUpdate = false, callback = undefined) {
        let that = this;
        var loadCount = 0, replaceCount = 0;
        if (forceUpdate) {
            store.commit("clearMedias");
        }
        if (store.state.totalMedias > store.state.medias.length) {
            $.getJSON(url, function name(data) {
                console.log("[receiveMedias]", url, data);
                $.each(data.data, function (key, value) {
                    var m = that.jsonToMedia(value);
                    store.commit("updateOrAddMedia", m);
                });
                if (that.treecatptions != undefined) {
                    theVue.treecatptions = that.treecatptions;
                }
                if ((theVue.$router.currentRoute.path == "/search")) {
                    theVue.searching();
                }
                if (loadCount == 0 && replaceCount == 0) {
                    if (store.state.totalMedias == store.state.medias.length) {
                        theVue.alert("All medias are loaded", "info");
                    }
                }
                else {
                    theVue.alert("Load " + loadCount + " and " + replaceCount + " medias already existed.");
                }
                if (callback != undefined) {
                    callback();
                }
            });
        }
    }
}
;
if (sm == undefined) {
    var sm;
}
export function init(env) {
    sm = new siteManager(env);
}
