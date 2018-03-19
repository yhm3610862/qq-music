<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper"
            @touchstart.prevent="progressTouchStart"
            @touchmove.prevent="progressTouchMove"
            @touchend="progressTouchEnd"
            ref="progressBtn">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'

  const progressBtnWidth = 16
  const transform = prefixStyle('transform')

  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created() {
      this.touch = {}     //自定义touch 对象
    },
    methods: {
      progressTouchStart(e) {
      this.touch.initiated = true
      // 点击 的 left
      this.touch.startX = e.touches[0].pageX
      // 进度条宽度
      this.touch.left = this.$refs.progress.clientWidth
      },
      progressTouchMove(e) {
       if (!this.touch.initiated) {
         return
       }
       // 拖动 left - 点击 left = 拖动的 width
       const deltaX = e.touches[0].pageX - this.touch.startX
       // 最多拖动 progressBar 的 width  最小 0
       const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
       // 执行动画
       this._offset(offsetWidth)
      },
      progressTouchEnd() {
       this.touch.initiated = false
       // 执行 emit
       this._triggerPercent()
      },
      progressClick(e) {
        //this._offset(e.offsetX)
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        this._triggerPercent()
      },
      _triggerPercent() {
          // progressBar的 width 减去 圆球的 width
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          // 进度条 width 除以 progressBar的 width = 进度的百分比
          const percent = this.$refs.progress.clientWidth / barWidth
          // 向父组件 传值
          this.$emit('percentChange', percent)
      },
      _offset(offsetWidth) {
        // 进度条 width
        this.$refs.progress.style.width = `${offsetWidth}px`
        // 圆球进度
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      }
    },
    watch: {
      percent(newPervent) {
        if (newPervent >= 0 && !this.touch.initiated) {
          //获取 进度条宽度
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
         // 进度百分比 乘以 总宽度 = 当前播放的进度（width）
          const offsetWidth = newPervent * barWidth
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
