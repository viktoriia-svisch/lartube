import Vue from 'vue';
import Vuex from 'vuex'
import { MediaSorter } from './tools'
Vue.use(Vuex)
export const eventBus = new Vue();
var mediaSorter=new MediaSorter()
export const store = new Vuex.Store({
      state: {
        filterTypes:["video","audio"],
        medias:[],
        categories:[],
        users:[],
        tags:[],
        notifications:[],
        blockGetRequest:false,
      },
      getters: {
        getMediasByTypes: (state) => () => {
          var m = state.medias.filter(media => state.filterTypes.includes(media.simpleType))
          return m
        },
        getMediaById: (state) => (id) => {
          var m = state.medias.find(media => media.id === id)
          if(m==undefined){
            if(state.blockGetRequest==false){
              state.blockGetRequest=true
              eventBus.$emit('loadMediaById',id);
            } else {
              state.blockGetRequest=false
            }
          }
          return m
        },
        getMediaByTitle: (state) => (title) => {
          title = encodeURIComponent(title)
          var m = state.medias.find(media => media.urlTitle === title)
          if(m==undefined){
            if(state.blockGetRequest==false){
              state.blockGetRequest=true
              eventBus.$emit('loadMedia',title);
            } else {
              state.blockGetRequest=false
            }
          }
          return m
        },
        getCategoryByTitle: (state) => (title) => {
          title = encodeURIComponent(title)
          var m = state.categories.find(cat => cat.urlTitle === title)
          return m
        }
      },
      mutations: {
        disableBlockRequest (state) {
          state.disableBlockRequest=false
        },
        updateMedia(state,replaceMedia){
          let theMedia = state.medias.find(media => media.id === replaceMedia.id)
          theMedia = replaceMedia
        },
        addMedia(state,media){
          if(state.medias.indexOf(media)==-1){
            state.medias.push(media)
            state.medias = mediaSorter.sort(state.medias)
          }
        },
        clearMedias(state){
          state.medias = []
        },
        sortMediasBy(state,sortBy){
          mediaSorter.setSortBy(sortBy)
          state.medias = mediaSorter.sort(state.medias)
        },
        setFilterTypes(state,types){
          state.filterTypes = types
          state.medias = mediaSorter.sort(state.medias)
        },
        setTags(state,tags){
          state.tags = tags
        },
        setCategories(state,categories){
          state.categories = categories
        },
      }
    })
