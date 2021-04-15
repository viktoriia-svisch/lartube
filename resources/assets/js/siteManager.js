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
        _this.receiveMedias(_this.createContent);
        return _this;
    }
    overviewSite.prototype.receiveMedias = function (createContentCallback) {
        if (createContentCallback === void 0) { createContentCallback = null; }
        var that = this;
        $.getJSON("/api/media", function name(data) {
            sm.medias = [];
            $.each(data.data, function (key, value) {
                sm.medias.push(new Media(value.title, value.description, value.source, value.poster_source, value.simpleType, value.type, value.user_id, value.created_at, value.created_at_readable));
            });
            createContentCallback(sm.medias);
            theVue.medias = sm.medias;
        });
    };
    overviewSite.prototype.createContent = function (data) {
        $("#mainContent").html("");
        var carouselHtml = "";
        var carouselIndicatorsHtml = "";
        var items = "";
        var first = true;
        var firstHtml = " active ";
        $.each(data, function (key, val1) {
            carouselHtml += '<div class="carousel-item bg-dark ' + firstHtml + '"><img src="' + baseUrl + val1.poster_source + '" alt="' + val1.title + '"><div class="carousel-caption" style="color: black; background: lightgrey; opacity:0.9;"><h3>' + val1.title + ' (' + val1.created_at_readable + ')</h3><p>' + val1.description + '<span class="float-right"><a id="' + key + 'CaroselPlay" class="btn btn-primary mr-2" >Play</a></span></p></div></div>';
            carouselIndicatorsHtml += '<li data-target="#demo" data-slide-to="0" class="' + firstHtml + '"></li>';
            items += '<div style="min-width: 300px;" class="col-lg-4 col-md-4 col-xs-6 card"><a href="/media/' + val1.title + '" class="d-block h-100"><img class="card-img-top" src="' + baseUrl + val1.poster_source + '" alt=""><div class="card-img-overlay"><h4 class="card-title bg-secondary text-info" style="opacity: 0.9;">' + val1.title + '</h4></div></a></div>';
            if (first) {
                firstHtml = "";
                first = false;
            }
        });
        var finalCarouselHtml = '<h3>Newest videos</h3><div id="demo" class="carousel slide" data-ride="carousel"><ul class="carousel-indicators" id="carouselIndicatorsBody">' + carouselIndicatorsHtml + '</ul><div class="carousel-inner" id="carouselInnerBody">' + carouselHtml + '</div><a class="carousel-control-prev bg-dark" href="#demo" data-slide="prev"><span class="carousel-control-prev-icon"></span></a><a class="carousel-control-next bg-dark" href="#demo" data-slide="next"><span class="carousel-control-next-icon"></span></a></div>';
        $("#mainContent").html(finalCarouselHtml);
        $.each(data, function (key, val1) {
            $('#' + key + 'CaroselPlay').on("click", function () {
                sm.changeSite("player", val1.title);
            });
        });
    };
    return overviewSite;
}(site));
;
var playerSite =  (function (_super) {
    __extends(playerSite, _super);
    function playerSite(title) {
        var _this = _super.call(this, title) || this;
        _this.receiveMedias(_this.createContent);
        return _this;
    }
    playerSite.prototype.receiveMedias = function (createContentCallback) {
        if (createContentCallback === void 0) { createContentCallback = null; }
        var that = this;
        $.getJSON("/api/media/" + that.title, function name(data) {
            sm.medias = [];
            $.each(data, function (key, value) {
                sm.medias.push(new Media(value.title, value.description, value.source, value.poster_source, value.simpleType, value.type, value.user_id, value.created_at, value.created_at_readable));
            });
            createContentCallback(sm.medias);
            theVue.medias = sm.medias;
        });
    };
    playerSite.prototype.createContent = function (data) {
        $("#mainContent").html("");
        var carouselHtml = '';
        var first = true;
        var finalCarouselHtml;
        $.each(data, function (key, val1) {
            if (first) {
                var tmpSourceBase = baseUrl;
                if (val1.source.substr(0, 4) == "http") {
                    tmpSourceBase = "";
                }
                if (val1.simpleType == "audio") {
                    carouselHtml += '<audio width="320" height="240" controls poster="' + baseUrl + val1.poster_source + '"><source src="' + tmpSourceBase + val1.source + '" type="audio/mp3"></audio>';
                }
                else if (val1.simpleType == "video") {
                    carouselHtml += '<video width="320" height="240" controls poster="' + baseUrl + val1.poster_source + '"><source src="' + tmpSourceBase + val1.source + '" type="video/mp4"></video>';
                }
                finalCarouselHtml = '<h3>' + val1.title + '</h3><div>' + carouselHtml + '</div>';
                $("#mainContent").html(finalCarouselHtml);
                $("#mainMenu").html('<a class="btn btn-primary" id="returnBtn">Go back</a>');
                $("#returnBtn").on("click", function () {
                    sm.changeSite("overview", "");
                });
            }
            if (first) {
                first = false;
            }
        });
    };
    return playerSite;
}(site));
;
var Media =  (function () {
    function Media(title, description, source, poster_source, simpleType, type, user_id, created_at, created_at_readable) {
        this.title = title;
        this.description = description;
        this.source = source;
        this.poster_source = poster_source;
        this.type = type;
        this.simpleType = simpleType;
        this.user_id = user_id;
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
        el: '#app',
        data: { aFirst: "halloooo du",
            currentComponent: 'overview', medias: sm.medias },
        components: { theComp: theComp, overview: overview, player: player },
        template: '<div><h1>MAin: {{reversedMessage}} {{currentComponent}}</h1><exco :swapComponent="swapComponent" :aSubFirst="aFirst"></exco><div :is="currentComponent" v-bind:medias="medias"></div></div>',
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
    console.log(theVue);
    theVue.aFirst = "Replaced!";
}
