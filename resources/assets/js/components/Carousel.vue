<template>
  <v-carousel style="height: 90vh;">
    <v-carousel-item
      v-for="(item,i) in medias"
      :key="i"
      :src="item.poster_source"
    >
    <v-card
  class="mx-auto mt-4"
  cycle="false"
  dark
  max-width="60vw"
  style="opacity: 0.9"
>
  <v-card-title>
    <v-icon
      large
      left
    >
      perm_media
    </v-icon>
    <span class="title text-center font-weight-bold headline">{{ item.title }}</span>
  </v-card-title>
  <v-card-text class="" style="max-height: 40vh; overflow-x: auto;">
    <VueMarkdown :source="item.description"></VueMarkdown>
    <div style="overflow-y:auto;">
      <span v-for="tag in item.tags" >
        <router-link class="" :to="'/tags/'+tag.name" >
          <v-chip small>
            <v-avatar class="teal">
              <v-icon>tag</v-icon>
            </v-avatar>
            {{ tag.name }}
          </v-chip>
        </router-link>
      </span>
    </div>
  </v-card-text>
  <v-card-actions>
    <v-layout row wrap hidden-sm-and-down >
    <v-list-tile class="grow">
      <router-link :to="'/profile/'+item.user.id">
      <v-list-tile-avatar color="grey darken-3" >
        <v-img
          class="elevation-6"
          :src="item.user.avatar"
        ></v-img>
      </v-list-tile-avatar>
    </router-link>
    <v-badge small class="ml-3" left color="orange" overlap>
      <span slot="badge">{{ item.comments.length }}</span>
    <v-icon>comment</v-icon>
  </v-badge>
  <v-badge class="ml-3" small left color="orange" overlap>
    <span slot="badge">{{ item.likes }}</span>
  <v-icon>thumb_up</v-icon>
</v-badge>
<v-badge class="ml-3" small left color="orange" overlap>
  <span slot="badge">{{ item.dislikes }}</span>
<v-icon >thumb_down</v-icon>
</v-badge>
    </v-list-tile>
  </v-layout>
  <v-layout
    align-center
    justify-end
    wrap
    xs12 sm4
  >
    <v-btn hidden-sm-and-down :to="'/mediaedit/'+item.title" v-if="loggeduserid==item.user.id|currentuser.admin">
    <v-icon class="mr-1">settings</v-icon>
    <span class="subheading mr-2 hidden-sm-and-down" >{{ $t('Edit') }}</span>
  </v-btn>
    <v-btn :to="'/media/'+item.urlTitle">
    <v-icon class="mr-1">play_circle_filled</v-icon>
    <span class="subheading hidden-sm-and-down" >{{ $t('Play') }}</span>
  </v-btn>
  </v-layout>
  </v-card-actions>
</v-card>
    </v-carousel-item>
  </v-carousel>
</template>
<script>
  import { eventBus } from '../eventBus.js';
  import GalleryComponent from './GalleryComponent'
  import VueMarkdown from 'vue-markdown'
  export default {
    props: ['medias','loggeduserid','currentuser'],
    methods: {
    },
  components : {
      'gallery': GalleryComponent,
      VueMarkdown
  },
  mounted(){
  },
  data(){
    return {
    }
  }
  }
</script>
<style>
.v-carousel__prev, .v-carousel__next{
  background-color: black;
  opacity: 0.5;
  border-radius: 20px;
}
</style>
