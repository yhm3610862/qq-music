<template>
   <Scroll class="listview"
           ref="listview"
           :listenScroll="listenScroll"
           :data="data"
           :probe-type="probeType"
           @scroll="scroll">
   	  <ul>
   	     <li v-for="group in data" class="list-group" ref="listGroup">
   	     	  <h2 class="list-group-title">{{ group.title }}</h2>
   	     	  <ul>
   	     	  	<li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
   	     	  		<img :src="item.avatar" class="avatar"/>
   	     	  		<span class="name">{{ item.name }}</span>
   	     	  	</li>
   	     	  </ul>
   	     </li>
   	  </ul>
   	  <div class="list-shortcut"
      @touchstart="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove">
   	  	<ul>
   	  		 <li v-for="(item, index) in shortchtList" class="item"
               :data-index = "index"
               :class="{'current': currentIndex === index}">
   	  		 	 {{ item }}
   	  		 </li>
   	  	</ul>
   	  </div>
      <div class="list-fixed" ref="fixed" v-show="fixedTitle">
        <div class="fixed-title">
          {{ fixedTitle }}
        </div>
      </div>
   </Scroll>
</template>

<script type="text/ecmascript-6">
	import Scroll from 'base/scroll/scroll'
	import {getData} from 'common/js/dom'

  const ANCHOR_HEIGHT = 18
  const TITLE_HEIGHT = 30

  export default {
  	created() {
  		this.touch = {}
      //scroll属性
      this.probeType = 3
      //height 集合数组
      this.listHeight = []
  	},
    props: {
    	data: {
    		type: Array,
    		default: []
    	}
    },
    data () {
      return {
        //传给子元素方法
        listenScroll: true,
        //字母 index 显示高亮，初始值0
        currentIndex: 0,
        //时时获取scrollY，初始值-1
        scrollY: -1,
        //title 顶出效果
        diff: -1
      }
    },
    computed: {
    	shortchtList() {
        //map循环，返回 一个克隆 数组
    		return this.data.map((group) => {
          //遍历数组取 对象 title,字符串第一个字母
    			return group.title.substr(0,1)
    		})
    	},
      // 头部 标题 A-Z
      fixedTitle() {
        if (this.scrollY > 0) {
          return ''
        }
        //返回第  index 个title
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    methods: {
      selectItem(item) {
         this.$emit('select', item)
      },
      scroll(pos) {
        this.scrollY = pos.y
      },
    	onShortcutTouchStart(e) {
        //执行dom方法getData,返回这个元素的 data-index属性的 值（index）
    		let anchorIndex = getData(e.target, 'index')
    		let firstTouch = e.touches[0]

    		this.touch.y1 = firstTouch.pageY
    		this.touch.anchorIndex = anchorIndex
        //执行函数，返回参数 index
        this._scrollTo(anchorIndex)
    	},
      //字母滑动函数
    	onShortcutTouchMove(e) {
         //滑动返回 指尖 点的距离对象集合
    		 let firstTouch = e.touches[0]
         //指尖 点的 pageY
    		 this.touch.y2 = firstTouch.pageY
         //点击点 到 滑动点的 距离 除以 字母元素高度 或 0(相当于Math.floor)
    		 let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
         //点击 index 加 移动了几个 字母
    		 let anchorIndex = parseInt(this.touch.anchorIndex) + delta
    		 this._scrollTo(anchorIndex)
    	},
      refresh() {
        this.$refs.listview.refresh()
      },
      //数组height集合
      _calculateHeight() {
        this.listHeight = []
        let height = 0
        const list = this.$refs.listGroup
        //第一个值0，初始位置
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeight.push(height)
        }
      },
    	_scrollTo(index) {
        //index未获取到
        if (!index && index !== 0) {
          return
        }
        //index小于0
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          //index大于最后一个，则减2 等于最后一个
          index = this.listHeight.length - 2
        }
        this.scrollY = -this.listHeight[index]
        //listview元素移动到相应的scrollY
    		this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 300)
    	}
    },
    watch: {
      data() {
        //监听listHeight，获取height 数组
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      //监听scrollY， 返回currentIndex，显示color
      scrollY(newY) {
        const listHeight = this.listHeight
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        for (let i = 0; i < listHeight.length; i++) {
          let height = listHeight[i]
          let height2 = listHeight[i+1]
          //判断小于后一个 height,大于前一个height,返回i
          if (-newY >= height && -newY < height2) {
            this.currentIndex = i
            //height2 减去 scrollY，得 相差距离
            this.diff = height2 + newY
            return
          }
        }
        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) {
        //减去TITLE_HEIGHT，得出负数 或 0
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        //0 等于 0 ，返回空
        if (this.fixedTop === fixedTop) {
            return
        }
        //赋值 0
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
      }
    },
    components:{
    	Scroll
    }
  }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
