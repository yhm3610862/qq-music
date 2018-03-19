<template>
 <transition name="slide">
   <MusicList :title="title" :bgImage="bgImage" :songs="songs" />
 </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from 'components/music-list/music-list'
  import {netSingerDetail} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  // import {mapGetters} from 'vuex'
  import {mapGetters} from 'vuex'

  export default {
      data() {
        return {
            songs: []
        }
      },
      created() {
          this._getDetail()
      },
      computed: {
        title() {
          return this.singer.name
        },
        bgImage(){
          return this.singer.avatar
        },
        //获取 vuex 数据
        ...mapGetters(["singer"])
      },
      methods: {
        _getDetail() {
          //判断没有 singer数据 返回歌手 列表页面
          if (!this.singer.id) {
            this.$router.push({path: '/singer'})
            return
          }
          //异步请求数据,根据 歌手Id 请求
          netSingerDetail(this.singer.id).then((res) => {
            if (res.code === ERR_OK) {
              this.songs = this._normalizeSinger(res.data.list)
              console.log(this.songs)
            }
          })
        },
        _normalizeSinger(list) {    //原数据处理方法
          let ret = []
          list.forEach((item) => {
            let {musicData} = item  //es6 变量解构赋值
            if (musicData.songid && musicData.albummid) {
              ret.push(createSong(musicData))   //执行工厂函数方法
            }
          })
          return ret
        }
      },
      components: {
        MusicList
      }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

  #div1
    position: fixed
    top: 0
    z-index: 100
    width: 100%
    height: 100%
    background: #000
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
