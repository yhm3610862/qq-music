import {playMode} from 'common/js/conflg'
import {loadSearch} from 'common/js/cache'

const state = {
  singer: {},
  playing: false,      // 控制播放
  fullScreen: false,   // 收起 打开
  playlist: [],        //播放列表
  sequenceList: [],    //顺序播放列表
  mode: playMode.sequence, //播放顺序控制
  currentIndex: -1,      //播放列表的索引
  disc: {},
  topList: {},
  searchHistory: loadSearch()
}

export default state
