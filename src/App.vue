<template>
  <div class="app-container" ref="appContainer">
    <header class="header">
      <h1 class="title">melody</h1>
      <ul class="type-wrapper">
        <li
          v-for="type in types"
          :data-type="type"
          :class="{ actived: type === animationType }"
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
          <img class="back-img" ref="backImg" alt="back-image" src="" />
        </div>
        <div class="cd-img-wrapper play" ref="cdWrapper" :style="isShowCd">
          <img class="cd-img" ref="cdImg" alt="cd-image" src="" />
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
        musicList: [],
        player: null,
        canvas: null,
        showCds: [animationTypes.circle],
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
        cdImg: this.$refs.cdImg,
      });

      this.canvas = new Canvas({
        el: this.$refs.canvasItem,
        width: this.$refs.right.clientWidth,
        height: this.$refs.right.clientHeight,
        size: this.player.size,
      });

      // resize时重置canvas画布的大小
      window.addEventListener('resize', () => {
        const width = this.$refs.right.clientWidth;
        const height = this.$refs.right.clientHeight;

        if (this.$refs.appContainer.clientWidth >= 1000) {
          this.setCdWidth(width, height);

          this.canvas.resize({
            width: this.$refs.right.clientWidth,
            height: this.$refs.right.clientHeight,
          });
        }
      });

      // 设置cd的大小
      this.setCdWidth(this.$refs.right.clientWidth, this.$refs.right.clientHeight);
    },
    computed: {
      ...mapGetters([
        'animationType',
        'currentSong',
      ]),
      isShowCd() {
        return this.showCds.includes(this.animationType) ? { zIndex: 1 } : { zIndex: -1 };
      }
    },
    methods: {
      ...mapMutations({
        setAnimationType: 'SET_ANIMATION_TYPE',
        setCurrentSong: 'SET_CURRENT_SONG',
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
        this.setCurrentSong(song);

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
        this.canvas.reRender();
      },
      setVolume() {
        this.player.setVolume(this.$refs.volume.value);
      },
      setCdWidth(w, h) {
        const size = ((Math.min(w, h) / 2) * (3 / 4) - 6) * 2 - 40;
        this.$refs.cdWrapper.style.width = `${size}px`;
        this.$refs.cdWrapper.style.height = `${size}px`;
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
    min-width 1000px
    height 100%
    min-height 400px
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
        display inline-flex
        margin 5px auto 10px
        height 40px
        border $color-666 solid 1px
        border-radius 10px
        color $color-ccc
        overflow hidden
        li
          flex 0 0 80px
          line-height 36px
          list-style none
          text-align center
          cursor pointer
          width 80px
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
        .cd-img-wrapper
          position absolute
          left 50%
          top 50%
          border-radius 50%
          border $color-opacity-01 solid 10px
          overflow hidden
          z-index -1
          &.play
            animation rotate 20s linear infinite
          .cd-img
            width 100%
            height 100%
            border-radius 50%
            object-fit cover

  @keyframes rotate
    0%
      transform: translate3d(-50%, -50%, 0) rotate(0)
    100%
      transform: translate3d(-50%, -50%, 0) rotate(360deg)
</style>
