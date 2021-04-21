var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var baseUrl;
import Vue from 'vue';
import { eventBus } from './eventBus.js';
var theComp = Vue.component('exco', require("./components/ExampleComponent.vue"));
var theVue;
var siteManager =  (function () {
    function siteManager(base) {
        baseUrl = base + "/";
        this.currentPage = "overview";
        this.sites = [];
        this.currentSite = new overviewSite();
    }
    siteManager.prototype.getCurrentSite = function () {
        return this.currentPage;
    };
    siteManager.prototype.changeSite = function (site, theValue) {
        console.log("changeSite: " + site);
        if (site == "player") {
            this.currentSite = new playerSite(theValue);
        }
        else {
            this.currentSite = new overviewSite();
        }
    };
    siteManager.prototype.buildSite = function () {
    };
    return siteManager;
}());
;
var site =  (function () {
    function site(title) {
        this.title = title;
    }
    site.prototype.build = function () {
    };
    site.prototype.destroy = function () {
    };
    return site;
}());
;
var overviewSite =  (function (_super) {
    __extends(overviewSite, _super);
    function overviewSite() {
        var _this = _super.call(this, "Overview") || this;
        _this.receiveMedias();
        return _this;
    }
    overviewSite.prototype.receiveMedias = function (forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        var that = this;
        $.getJSON("/api/media", function name(data) {
            if ((sm.medias == undefined) || (forceUpdate)) {
                sm.medias = [];
                $.each(data.data, function (key, value) {
                    sm.medias.push(new Media(value.title, value.description, value.source, value.poster_source, value.simpleType, value.type, value.user, value.created_at, value.created_at_readable, value.comments));
                });
                theVue.medias = sm.medias;
            }
        });
    };
    return overviewSite;
}(site));
;
var playerSite =  (function (_super) {
    __extends(playerSite, _super);
    function playerSite(title) {
        var _this = _super.call(this, title) || this;
        _this.receiveMedias();
        return _this;
    }
    playerSite.prototype.receiveMedias = function (forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        var that = this;
        if ((sm.medias == undefined) || (forceUpdate)) {
            $.getJSON("/api/media/" + that.title, function name(data) {
                sm.medias = [];
                $.each(data, function (key, value) {
                    sm.medias.push(new Media(value.title, value.description, value.source, value.poster_source, value.simpleType, value.type, value.user, value.created_at, value.created_at_readable, value.comments));
                });
                theVue.medias = sm.medias;
            });
        }
    };
    playerSite.prototype.createContent = function (data) {
        $("#mainContent").html("");
        var carouselHtml = '';
        var first = true;
        var finalCarouselHtml;
    };
    return playerSite;
}(site));
;
var Media =  (function () {
    function Media(title, description, source, poster_source, simpleType, type, user, created_at, created_at_readable, comments) {
        this.title = title;
        this.description = description;
        this.source = source;
        this.poster_source = poster_source;
        this.type = type;
        this.simpleType = simpleType;
        this.user = user;
        this.comments = comments;
        this.created_at = created_at;
        this.created_at_readable = created_at_readable;
    }
    Media.prototype.getMediaTag = function () {
        var tmpHtml = "";
        if (this.type == "localVideo" || this.type == "directVideo" || this.type == "torrentVideo") {
            tmpHtml += '<video class="col-12" id="player" poster="{{ url($media->poster()) }}" playsinline controls>';
            if (this.type == "localVideo" || this.type == "directVideo") {
                tmpHtml += '<source src="' + baseUrl + this.source + '" >';
            }
            return tmpHtml + "</video>";
        }
        if (this.type == "localAudio" || this.type == "directAudio" || this.type == "torrentAudio") {
            tmpHtml += '<audio class="col-12" id="player" poster="{{ url($media->poster()) }}" playsinline controls>';
            if (this.type == "localAudio" || this.type == "directAudio") {
                tmpHtml += '<source src="' + baseUrl + this.source + '" >';
            }
            return tmpHtml + "</audio>";
        }
    };
    Media.prototype.createEditModal = function (containerId) {
        var tmpHtml = "";
    };
    return Media;
}());
;
if (sm == undefined) {
    var sm;
}
export function init(baseUrl) {
    sm = new siteManager(baseUrl);
    var overview = Vue.component('overview', require("./components/OverviewComponent.vue"));
    var player = Vue.component('player', require("./components/MediaComponent.vue"));
    theVue = new Vue({
        el: '#app1',
        data: { title: "Overview",
            currentComponent: 'overview', medias: sm.medias, currentTitle: '', baseUrl: baseUrl },
        components: { theComp: theComp, overview: overview, player: player },
        template: '<div><div :is="currentComponent" v-bind:medias="medias" v-bind:currentTitle="currentTitle" :swapComponent="swapComponent"></div></div>',
        computed: {
            reversedMessage: function () {
                return this.aFirst.split('').reverse().join('');
            },
        },
        methods: {
            swapComponent: function (component) {
                this.currentComponent = component;
            }
        }
    });
    eventBus.$on('playerBackClick', function (title) {
        console.log("chaNGE BACK");
        theVue.swapComponent("overview");
    });
    eventBus.$on('overviewPlayClick', function (title) {
        theVue.currentTitle = title;
        theVue.title = title;
        theVue.swapComponent("player");
    });
}
