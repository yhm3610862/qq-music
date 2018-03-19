<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" ref="bgImage" :style="bgStyle">
       <div class="play-wrapper">
         <div class="play" v-show="songs.length > 0" ref="playBtn" @click="random">
           <i class="icon-play"></i>
           <span class="text">随机播放全部</span>
         </div>
       </div>
       <div class="filter" ref="filter">
       </div>
    </div>
    <!-- 向上移div -->
    <div class="bg-layer" ref="layer">
    </div>
    <scroll @scroll="scroll"
            :listenScroll="listenScroll"
            :probeType="probeType"
            :data="songs" class="list" ref="list">
      <div class="song-list-wrapper">
        <SongList :songs="songs" @select="selectItem" :rank="rank"></SongList>
      </div>
      <!-- loading显示 -->
      <div class="loading-container" v-show="!songs.length">
        <loading />
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import SongList from 'base/song-list/song-list'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {prefixStyle} from 'common/js/dom'
  import {mapActions} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'

  const RESERVEN_HEIGHT = 40
  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('background-filter')

  export default {
    mixins: [playlistMixin],   // 组件里 同名的方法 会覆盖 mixin 里的方法
    props: {
      bgImage: {       // 图片
        type: String,
        default: ''
      },
      songs: {        //数组数据
        type: Array,
        default: []
      },
      title: {      //头部名字
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    computed: {
      bgStyle() {     //添加css 图
        return `background-image:url(${this.bgImage})`
      }
    },
    created() {
      this.probeType = 3    //子组件传值
      this.listenScroll = true   //子组件传值，绑定scroll事件
    },
    mounted() {
      this.imageHeight = this.$refs.bgImage.clientHeight
      //取 img 高度 减去 title高度
      this.minTransalteY = -this.imageHeight + RESERVEN_HEIGHT
      //向下偏移 图片的高度
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    methods: {
      handlePlaylist(playlist) {
        let bottom = this.playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      scroll(pos) {   //获取滚动 scrollY
        this.scrollY = pos.y
      },
      back() {
        this.$router.back()  //返回上一页
      },
      selectItem(item, index) {
        this.selectPlay({     //actions 开始播放
          list: this.songs,
          index
        })
      },
      random() {
        this.randomPlay({
          list: this.songs
        })
      },
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ])
    },
    watch: {
      scrollY(newY) {
        // 最大移动到 imageHeight
        let translateY = Math.max(this.minTransalteY, newY)
        let zIndex = 0
        let scale = 1
        let blur = 0
        //向上滚动 newY
        this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`
        //计算向下 偏移的百分比
        const percent = Math.abs(newY / this.imageHeight)
        if (newY > 0) {
          zIndex = 10
          scale = 1 + percent
        } else {
          // 最大 20，乘以 20 相当于 加 1
          blur = Math.min(20 * percent, 20)
        }
        this.$refs.filter.style[backdrop] = blur //ios blur
        //向上滚动 超出处理
        if (newY < this.minTransalteY) {
           zIndex = 10
           //列表超出 img 设置 height
           this.$refs.bgImage.style.paddingTop = 0
           this.$refs.bgImage.style.height = `${RESERVEN_HEIGHT}px`
           // 随机播放隐藏
           this.$refs.playBtn.style.display = 'none'
        } else {
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = ''
        }
        //img 设 index ,遮盖超出列表
        this.$refs.bgImage.style[transform] = `scale(${scale})`
        this.$refs.bgImage.style.zIndex = zIndex
      }
    },
    components: {
      Scroll,
      SongList,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
