<template>
  <div class="app-container">
    <header class="header">
      <h1 class="title">melody</h1>
      <ul class="type-wrapper">
        <li
          v-for="type in types"
          :data-type="type"
          :class="{ actived: animationType === type }"
          @click="setType(type)"
        >
          {{ type }}
        </li>
      </ul>
      <div class="volume-wrapper">
        Volume
        <input
          ref="volume"
          class="volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value="0.5"
          @mousemove="setVolume"
          @click="setVolume"
        >
      </div>
    </header>
    <div class="content">
      <div class="left">
        <ul class="list">
          <li
            v-for="song in musicList"
            :class="['item', { actived: song === currentSong }]"
            :title="song"
            @click="playSong(song)"
          >
            {{ song }}
          </li>
        </ul>
      </div>
      <div class="right" ref="right">
        <canvas class="canvas" ref="canvasItem">不支持</canvas>
        <div class="back-img-wrapper">
          <img class="back-img" ref="backImg" alt="image" src="">
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import { getSongsList } from './api/file';
  import { ERR_OK } from './api/config';
  import { animationTypes } from './common/js/constants';
  import Player from './common/js/class/player';
  import Canvas from './common/js/class/canvas';
  import { mapGetters, mapMutations } from 'vuex';

  export default {
    data() {
      return {
        types: Object.values(animationTypes),
        currentSong: '',
        musicList: [],
        player: null,
        canvas: null,
      }
    },
    created() {
      this._getSongsList();
    },
    mounted() {
      this.player = new Player({
        currentSong: null,
        volume: this.$refs.volume.value,
        imageItem: this.$refs.backImg,
      });

      this.canvas = new Canvas({
        el: this.$refs.canvasItem,
        width: this.$refs.right.clientWidth,
        height: this.$refs.right.clientHeight,
        size: this.player.size,
      });

      // resize时重置canvas画布的大小
      window.addEventListener('resize', () => {
        this.canvas.resize({
          width: this.$refs.right.clientWidth,
          height: this.$refs.right.clientHeight,
        });
      });
    },
    computed: {
      ...mapGetters([
        'animationType',
      ])
    },
    methods: {
      ...mapMutations({
        setAnimationType: 'SET_ANIMATION_TYPE',
      }),
      _getSongsList() {
        getSongsList().then(res => {
          if (res.code === ERR_OK) {
            this.musicList = res.data.musicList;
          }
        }).catch(err => {
          console.log(err);
        })
      },
      playSong(song) {
        this.currentSong = song;

        const player = this.player;

        // 这里，如果用户还没有和页面交互就初始化了一个AudioContext，是不会play的，所以初始化时机写在点击事件里
        if (!player.ac) {
          player.createAc();
          player.createGainNode(this.$refs.volume.value);
          player.createAnalyser();
          player.visualizer(this.canvas);
        }

        player.playSong(song).then((songName) => {
          console.log('当前歌曲:', songName);
        });
      },
      setType(type) {
        this.setAnimationType(type);
        this.canvas.reRender(type);
      },
      setVolume() {
        this.player.setVolume(this.$refs.volume.value);
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .app-container
    display: flex
    flex-direction: column
    width 100%
    height 100%
    background: $color-222
    color: $color-ccc
    .header
      height 150px
      border $color-666 solid 1px
      margin 10px
      text-align center
      .title
        margin 15px 0
        font-size 22px
        font-weight 500
      .type-wrapper
        display flex
        margin 10px auto
        width 180px
        height 40px
        border $color-666 solid 1px
        border-radius 10px
        color $color-ccc
        overflow hidden
        li
          flex 1
          line-height 36px
          list-style none
          text-align center
          cursor pointer
          &:not(:last-child)
            border-right $color-666 solid 1px
          &.actived
            background $color-ccc
            color $color-222
      .volume-wrapper
        .volume
          margin-left 5px
          vertical-align middle
    .content
      flex 1
      display flex
      .left
        width 300px
        border $color-666 solid 1px
        margin 0 10px 10px 10px
        padding-left 10px
        padding-top 10px
        padding-bottom 10px
        .item
          list-style-type none
          margin-bottom 10px
          overflow hidden
          white-space nowrap
          text-overflow ellipsis
          cursor: pointer
          &.actived
            color $color-red
      .right
        flex 1
        border $color-666 solid 1px
        margin 0 10px 10px 0
        overflow hidden
        position relative
        .back-img-wrapper
          position absolute
          left 0
          top 0
          width 100%
          height 100%
          pointer-events none
          .back-img
            position absolute
            display none
            object-fit fill
            width 100%
            height 100%
            filter blur(30px)
            opacity .3
</style>
