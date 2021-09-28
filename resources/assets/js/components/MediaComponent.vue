<template>
  <div v-if="currentmedia!=undefined">
      <div class="row" >
        <div class="col-xs-12 col-sm-12 col-md-12">
          <h3> {{ currentmedia.title }} </h3>
          <audio id="player" v-if="currentmedia.simpleType=='audio'" controls :poster="currentmedia.poster_source">
            <source :src="currentmedia.source" type="audio/mp3"></source>
          </audio>
          <video class="col-12" id="player" v-if="currentmedia.simpleType=='video'" controls :poster="currentmedia.poster_source">
            <source :src="currentmedia.source" type="video/mp4"></source>
          </video>
          <video class="col-12" id="player" v-if="currentmedia.simpleType=='torrent'" controls :poster="currentmedia.poster_source">
          </video>
        </div>
      </div>
      <div class="col-xs-12 col-sm-12 col-md-12"></div>
      <div class="card">
        <div class="card-header">
          <span class='h3'>{{ currentmedia.title }}</span>
          <div class="float-right">
            <span class="btn btn-info mr-1">{{ currentmedia.created_at_readable }}</span>
              <b-btn v-b-modal.torrentmodal class="mr-1" v-if="currentmedia.type=='torrentAudio'|currentmedia.type=='torrentVideo'" >Torrent-info</b-btn>
              <router-link class="btn btn-primary" :to="'/profile/'+currentmedia.user.id">
                <img v-if="currentmedia.user.avatar==''" class="mx-auto rounded-circle img-fluid" src="/img/404/avatar.png" alt="avatar" style="max-height: 20px;" />
                <img v-else class="mx-auto rounded-circle img-fluid" :src="'/'+currentmedia.user.avatar" alt="avatar" style="max-height: 20px;" />
              </router-link>
            <span v-if="loggeduserid==currentmedia.user.id" class=""><router-link class="btn btn-sm btn-info float-right" :to="'/mediaedit/'+currentmedia.title">Edit</router-link></span>
          </div>
          <div class="card-body">{{ currentmedia.description }}</div>
          <div class="card-footer">Tags:<span v-for="tag in currentmedia.tags"> <router-link class="btn btn-xs btn-info mr-1"  :to="'/tags/'+tag.name" >{{ tag.name }} ({{ tag.count }}x)</router-link></span>
          </div>
        </div>
      </div>
      <div class="comments">
        <h4>Comments</h4>
        <form class="form-inline" id="commentForm">
          <input id="medias_id" name="medias_id" type="hidden" :value="currentmedia.id">
          <input id="medias_title" name="medias_title" type="hidden" :value="currentmedia.title">
          <input placeholder="Comment..." class="col-9" id="medias_body" name="body" type="text">
          <input type="button" class="ml-1" value="Send comment!" @click="sendComment();" />
        </form>
        <div v-for="comment in currentmedia.comments" class="comment mb-2 row" :id='"cid"+comment.id'>
            <div class="comment-avatar col-md-1 col-sm-2 text-center pr-1">
                <a href=""><img class="mx-auto rounded-circle img-fluid" :src="'/'+comment.user.avatar" alt="avatar" /></a>
            </div>
            <div class="comment-content col-md-11 col-sm-10">
                <h6 class="small comment-meta"><router-link class="btn btn-primary mr-2" :to="'/profile/'+comment.user.id">{{ comment.user.name }}</router-link> {{ comment.created_at }}
                </h6>
                <div class="comment-body">
                    <p>
                        {{ comment.body }}
                        <br>
                        <a href="" class="text-right small"><i class="ion-reply"></i> Reply</a>
                    </p>
                </div>
            </div>
          </div>
      </div>
      <b-modal id="torrentmodal" title="Torrent-infos">
        <p>Peers: {{ peers }}</p>
        <p>Downloadspeed: {{ downloadspeed }}</p>
        <p>Uploadspeed: {{ uploadspeed }}</p>
        <p>Downloadpercent: {{ downloadpercent }}</p>
      </b-modal>
  </div>
</template>
<script>
  import { eventBus } from '../eventBus.js';
  export default {
    props: ['medias','currentTitle','baseUrl','loggeduserid'],
    methods: {
      prettyBytes(num) {
        var exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        if (neg) num = -num;
        if (num < 1) return (neg ? '-' : '') + num + ' B';
        exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
        num = Number((num / Math.pow(1000, exponent)).toFixed(2));
        unit = units[exponent];
        return (neg ? '-' : '') + num + ' ' + unit;
      },
      emitBackClicked(title) {
        eventBus.$emit('playerBackClick',title);
      },
      sendComment(){
        console.log(new FormData($("#commentForm")[0]))
        $.ajax({
            url: '/comment',
            type: 'POST',
            data: new FormData($("#commentForm")[0]),
            cache: false,
            contentType: false,
            processData: false,
            complete : function(res) {
              if(res.status==200){
                              }
              console.log(res.responseJSON)
              eventBus.$emit('commentCreated',res.responseJSON);
            }
        });
      }
    },
    computed: {
            currentmedia: function () {
                let that = this;
        var theMedia;        this.medias.forEach(function(val,key){
          if(val.title==that.$route.params.currentTitle){
            theMedia = val;
          }
        });
        return theMedia;
      }
    },
    updated: function () {
      this.$nextTick(function () {
    if((this.currentmedia!=undefined)&&(this.inited==false)){
      this.inited=true
    if(this.currentmedia.type=="torrentAudio"||this.currentmedia.type=="torrentVideo"){
      var WebTorrent = require('webtorrent')
      var client = new WebTorrent();
      let that = this;
      client.add(this.currentmedia.source, function (torrent) {
                    var file = torrent.files.find(function (file) {
            return file.name.endsWith('.mp4')
          })
            torrent.on('done', onDone);
            setInterval(onProgress, 500);
            onProgress();
            file.getBlobURL(function (err, url) {
              if (err){
                console.log(err.message);
              }
                          });
                        function onProgress () {
                            that.peers = torrent.numPeers + (torrent.numPeers === 1 ? ' peer' : ' peers');
                            var percent = Math.round(torrent.progress * 100 * 100) / 100;
              that.downloadpercent = that.prettyBytes(torrent.downloaded) + " / " + that.prettyBytes(torrent.length) + " ("+percent+"%)";
                            that.downloadspeed = that.prettyBytes(torrent.downloadSpeed) + '/s (down)';
              that.uploadspeed = that.prettyBytes(torrent.uploadSpeed) + '/s (up)';
            }
            function onDone () {
              onProgress();
            }
          file.renderTo('#player');
        });
    }
  } });
    },
    mounted(){
  },
  data(){
    return {
      inited: false,
      peers: '',
      downloadspeed: '',
      downloadpercent: '',
      uploadspeed: '',
    }
  }
  }
</script>
