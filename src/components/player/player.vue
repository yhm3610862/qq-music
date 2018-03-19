<template>
  <div class="player" v-show="playlist.length">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
    <div class="normal-player" v-show="fullScreen">
      <!-- 背景大图模糊效果 -->
      <div class="background">
        <img :src="currentSong.image" alt="" width="100%" height="100%">
      </div>
      <div class="top">
        <!-- 返回 -->
        <div class="back" @click="back">
          <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="currentSong.name"></h1>
        <h2 class="subtitle" v-html="currentSong.singer"></h2>
      </div>
      <!-- 中间转动大图 -->
      <div class="middle" @touchstart="middleTouchStart"
                          @touchmove="middleTouchMove"
                          @touchend="middleTouchEnd">
        <div class="middle-l" ref="middleL">
          <div class="cd-wrapper" ref="cdWrapper">
            <div class="cd" :class="cdCls">
              <img :src="currentSong.image" alt="" class="image">
            </div>
          </div>
          <div class="playing-lyric-wrapper">
            <div class="playing-lyric">{{ playingLyric }}</div>
          </div>
        </div>
        <Scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
          <div class="lyric-wrapper">
            <div v-if="currentLyric">
              <p ref="lyricLine"
                class="text"
                :class="{'current': currentLineNum === index}"
                v-for="(line, index) in currentLyric.lines"
              >{{ line.txt }}</p>
            </div>
          </div>
        </Scroll>
      </div>
      <!-- 底部控制栏 -->
      <div class="bottom">
        <div class="dot-wrapper">
          <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
          <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
        </div>
        <div class="progress-wrapper">
          <span class="time time-l">{{ format(currentTime) }}</span>
         <div class="progress-bar-wrapper">
           <progress-bar @percentChange="onProgressChange" :percent="percent"/>
         </div>
         <span class="time time-r">{{ format(currentSong.duration) }}</span>
        </div>
        <div class="operators">
          <div class="icon i-left" @click="changeMode">
            <i :class="iconMode"></i>
          </div>
          <div class="icon i-left" :class="disableCls">
            <i class="icon-prev" @click="prev"></i>
          </div>
          <div class="icon i-center" :class="disableCls">
            <i @click="togglePlaying" :class="playIcon"></i>
          </div>
          <div class="icon i-right" :class="disableCls">
            <i class="icon-next" @click="next"></i>
          </div>
          <div class="icon i-right">
            <i class="icon-not-favorite icon"></i>
          </div>
        </div>
      </div>
    </div>
    </transition>
    <!-- 播放缩小栏 -->
    <transition name="mini">
    <div @click="open" class="mini-player" v-show="!fullScreen">
      <div class="icon">
        <img :class="cdCls" :src="currentSong.image" alt="" width="40" height="40">
      </div>
      <div class="text">
        <h2 class="name" v-html="currentSong.name"></h2>
        <p class="desc" v-html="currentSong.singer"></p>
      </div>
      <div class="control" >
        <ProgressCircle :radius="num" :percent="percent">
          <i @click.stop="togglePlaying" :class="minIcon" class="icon-mini"></i>
        </ProgressCircle>
      </div>
      <div class="control" @click.stop="showPlaylist">
        <i class="icon-playlist"></i>
      </div>
    </div>
    </transition>
    <Playlist ref="playlist"></Playlist>
    <audio ref="audio" :src="currentSong.url"
                       @canplay="ready"
                       @error="error"
                       @timeupdate="updataTime"
                       @ended="end">
    </audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from 'common/js/dom'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import {playMode} from 'common/js/conflg'
  import {shuffle} from 'common/js/util.js'
  import Lyric from 'lyric-parser'
  import Scroll from 'base/scroll/scroll'
  import {playerMixin} from 'common/js/mixin'
  import Playlist from 'components/playlist/playlist'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    mixins: [playerMixin],
    data() {
      return {
        songReady: false,   //控制快速切换
        currentTime: 0,      //歌曲时间
        num: 32,
        currentLyric: null,
        currentLineNum: 0,
        currentShow: 'cd',
        playingLyric: ''
      }
    },
    created() {
      this.touch = {}
    },
    computed: {
      cdCls() {
        //cd 旋转
        return this.playing ? 'play' : 'play pause'
      },
      playIcon() {
        //播放 暂停 图标
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      minIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      disableCls() {
        return this.songReady ? '' : 'disable'
      },
      percent() {
        // 当前时间 到 总长播放时间的 百分比
        return this.currentTime / this.currentSong.duration
      },
      ...mapGetters([
        'fullScreen',   //boolean 判断 小播放栏
        'playlist',     //{}数据 播放列表
        'currentSong',  //{}数据 当前播放列表
        'playing',
        'currentIndex',
        'mode',
        'sequenceList'
      ])
    },
    methods: {
      back() {
        this.setFullScreen(false)
      },
      open() {
        this.setFullScreen(true)
      },
      enter(el, done) {
         const {x, y, scale} = this._getPosAndScale()
         //css 动画
         let animation = {
           0: {
             transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
           },
           60: {
             transform: `translate3d(0, 0, 0) scale(1.1)`
           },
           100: {
             transform: `translate3d(0, 0, 0) scale(1)`
           }
         }
        //执行 animations 动画插件
         animations.registerAnimation({
           name: 'move',
           animation,
           presets: {
             duration: 400,
             easing: 'linear'
           }
         })
         //执行动画
         animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        //清除动画
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        //移出动画
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        //大图 移动缩放 动画效果
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        //清除动画
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      togglePlaying() {
        this.setPlayingState(!this.playing)
        if (this.currentLyric) {
          this.currentLyric.togglePlay()  //歌词 播放 切换
        }
      },
      end() {
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        if (this.currentLyric) {
          this.currentLyric.seek(0)  //歌词 播放 切换
        }
      },
      next() {
        if (!this.songReady) {  //还未进入到下一首
          return
        }
        if (this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex + 1
          if (index === this.playlist.length) {
            //到第一首
            index = 0
          }
          //下一首
          this.setCurrentIndex(index)
          //暂停 切换 播放
          if (!this.playing) {
            this.togglePlaying()
          }
        }
         this.songReady = false
      },
      prev() {
        if (!this.songReady) {  //还未进入到下一首
          return
        }
        if (this.playlist === 1) {
          this.loop()
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            //到最后一首
            index = this.playlist.length - 1
          }
          //上一首
          this.setCurrentIndex(index)
          //暂停 切换 播放
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      ready() {
        //进入到下一首
        this.songReady = true
      },
      error() {
        this.songReady = true
      },
      updataTime(e) {
        //获取当前歌曲的 播放时间
        this.currentTime = e.target.currentTime
      },
      format(interval) {
        //向下取整
        interval = interval | 0
        //除以 60 ，向下取整
        const minute = this._pad(interval / 60 | 0)
        // 60 取余
        const second = this._pad(interval % 60)
        // 分  和 秒
        return `${minute}:${second}`
      },
      onProgressChange(percent) { //percent 子组件 传递
        const currrentTime = this.currentSong.duration * percent
        // 歌曲播放 到 拖动的进度  当前歌曲时间 * 拖动的百分比
        this.$refs.audio.currentTime = currrentTime
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentLyric) {
          this.currentLyric.seek(currrentTime * 1000)
        }
      },
      changeMode() {   //切换播放模式
        const mode = (this.mode + 1) % 3
        this.setPlayMode(mode)
        let list = null
        if (mode === playMode.random) {
          //随机播放
          list = shuffle(this.sequenceList)
        } else {
          list = this.sequenceList
        }
        // 切换
        this.resetCurrentIndex(list)
        this.setPlayList(list)
      },
      resetCurrentIndex(list) {    //继续播放当前歌曲
        let index = list.findIndex((item) => {
          return item.id === this.currentSong.id
        })
        this.setCurrentIndex(index)
      },
      getLyric() {    // 获取歌词
        this.currentSong.getLyric().then((lyric) => {
          // 执行 Lyric 插件，对歌词 处理
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          console.log(this.currentLyric)
          if (this.playing) {  // 歌词播放
            this.currentLyric.play()  // 歌词播放
          }
        }).catch(() => {
          this.currentLyric = null // 歌词 为 null
          this.playingLyric = ''   // 当前歌词 为空
          this.currentLineNum = 0  // 歌词列表 第几行
        })
      },
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum  // 歌曲到播放第几行
        // 歌词到第五行 开始滚动
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          // 开始滚动到歌词播放 那一行，动画一秒
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        // 当前播放的 歌词
        this.playingLyric = txt
      },
      middleTouchStart(e) {
         this.touch.initiated = true
         // touches 触摸点 touch 数组集合
         let touch = e.touches[0]
         this.touch.startX = touch.pageX
         this.touch.startY = touch.pageY
      },
      middleTouchMove(e) {
         if (!this.touch.initiated) {
           return
         }
         const touch = e.touches[0]
         // 滑动点 减去 触摸点 = 滑动的 width
         const deltaX = touch.pageX - this.touch.startX
         const deltaY = touch.pageY - this.touch.startY
         // y 大于 x
         if (Math.abs(deltaY) > Math.abs(deltaX)) {
           return
         }
         const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
         // 取滑动 的 负  值
         const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        // 取 拖动的 width 除以 window.innerWidth 的 积
         this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
         // lyric 容器 X位移 滑动的 width
         this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
         // 转动图 opacity = 1 - percent
         this.$refs.middleL.style.opacity = 1 - this.touch.percent
         // transition 的 time 设为 0
         this.$refs.lyricList.$el.style[transitionDuration] = '0ms'
      },
      showPlaylist() {
        // 播放列表 显示
        this.$refs.playlist.show()
      },
      middleTouchEnd() {
         let offsetWidth
         let opacity
         if (this.currentShow === 'cd') {
           // 滑动 百分之 10
            if (this.touch.percent > 0.1) {
              offsetWidth = -window.innerWidth
              opacity = 0
              this.currentShow = 'lyric'
            } else {
              offsetWidth = 0
            }
         } else {
           if (this.touch.percent < 0.9) {
              offsetWidth = 0
              opacity = 1
              this.currentShow = 'cd'
           } else {
             offsetWidth = -window.innerWidth
             opacity = 0
           }
         }
         const time = 300
         this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
         this.$refs.middleL.style.opacity = opacity
         this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      },
      _pad(num, n = 2) {
        let len = num.toString().length
        //遍历字符串 加 0
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      _getPosAndScale() {    //计算 小图 坐标
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        //大图宽度
        const width = window.innerWidth * 0.8
        //缩小比例
        const scale = targetWidth / width
        // 一半 减去 left 等于 小图中心点，偏移的 X
        const x = -(window.innerWidth / 2 - paddingLeft)
        // 高度 减去 上偏移80 减去 大图一半 减去 小图 bottom
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',      //booleam值 小播放栏控制
        setPlayingState: 'SET_PLAYING_STATE',  //booleam值 音乐播放 暂停
        setCurrentIndex: 'SET_CURREMT_INDEX',   //当前播放音乐的 index
        setPlayMode: 'SET_PLAY_MODE',
        setPlayList: 'SET_PLAYLIST'
      })
    },
    watch: {
      currentSong(newSong, oldSong) {
        if (!newSong.id) {
          return
        }
        if (newSong.id === oldSong.id) {
          return
        }
        if (this.currentLyric) {
          this.currentLyric.stop()
        }
        setTimeout(() => {
          this.$refs.audio.play()  //音乐播放
          this.getLyric()   //class类 继承方法
        }, 1000)
      },
      playing(newPlaying) {        //监听音乐播放关闭
        const audio = this.$refs.audio
        this.$nextTick(() => {
          //ture 播放 false 暂停
          newPlaying ? audio.play() : audio. pause()
        })
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              position: absolute
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0
  .disable
    color: $color-theme-d
  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
