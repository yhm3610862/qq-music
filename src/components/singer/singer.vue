<template>
    <div class="singer" ref="singers">
      <listView @select="selectSinger" :data="singers" ref="list"></listView>
      <router-view></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
  import {getSingerList} from 'api/singer'
  import listView from 'base/listview/listview'
  import Singer from 'common/js/singer'
  import {mapMutations} from 'vuex'  //vuex 语法糖
  import {playlistMixin} from 'common/js/mixin'

  const HOST_NAME = '热门'
  const HOT_SINGER_LEN = 10

  export default {
    mixins: [playlistMixin],
       data() {
       	 return {
       	 	 singers: []
       	 }
       },
       created() {
       	 this._getSingerList()
       },
       methods: {
         handlePlaylist(playlist) {
           //判断底部播放栏，true 即向上偏移 60px
           const bottom = playlist.length > 0 ? '60px' : ''
           this.$refs.singers.style.bottom = bottom
           this.$refs.list.refresh()
         },
         selectSinger(singer) {
           this.$router.push({
             path: `/singer/${singer.id}`
           })
           this.setSinger(singer)
         },
       	 _getSingerList() {
           // 异步请求 数据
       	 	 getSingerList().then((res) => {
             // singers赋值，对原始数据重新处理
       	 	 	  this.singers = this._normalizeSinger(res.data.list)
       	 	 })
       	 },
         //提取 原始 数据
       	 _normalizeSinger(list) {
           //新数据对象
       	 	  let map ={
       	 	  	hot: {
       	 	  		title: HOST_NAME,
       	 	  		items: []
       	 	  	}
       	 	  }
            //原始数据 循环
       	 	  list.forEach((item, index) => {
              //取 10 个
       	 	  	if(index < HOT_SINGER_LEN) {
                // push到 items数组里，取ID和name
       	 	  		  map.hot.items.push(new Singer({
       	 	  		  id: item.Fsinger_mid,
       	 	  		  name: item.Fsinger_name
       	 	  	  }))
       	 	  	}

       	 	  	const key = item.Findex
              //key 赋值
    			 	  if (!map[key]) {
                map[key] = {
      			 	  	title: key,
      			 	  	items: []
      		      }
              }
              //key 个 赋值 id name
    			 	  map[key].items.push(new Singer({
    			 	  	id: item.Fsinger_mid,
    			 	  	name: item.Fsinger_name
    			 	  }))
       	 	  })
       	 	  let ret = []
       	 	  let hot = []
            //循环 map
       	 	  for(let key in map) {
       	 	  	let val = map[key]
              //正则 判断 a-z push
       	 	  	if(val.title.match(/[a-zA-Z]/)) {
       	 	  		 ret.push(val)
       	 	  	}else if(val.title === HOST_NAME) {  //等于字符串 ‘热门’
       	 	  		hot.push(val)
       	 	  	}
       	 	  }
            console.log(ret)
            //数组字符串排序 a-z
       	 	  ret.sort((a, b) => {
       	 	  	return a.title.charCodeAt(0) - b.title.charCodeAt(0)
       	 	  })
            //连接 两个数组
       	 	  return hot.concat(ret)
       	 },
         ...mapMutations({
           setSinger: 'SET_SINGER'
         })
       },
       components: {
       	 listView
       }
  }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
