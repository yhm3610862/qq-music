// 异步修改
import * as types from './mutation-types'
import {playMode} from 'common/js/conflg'
import {shuffle} from 'common/js/util'
import {saveSearch, deleteSearch, clearSearch} from 'common/js/cache'

function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

// 修改 多个 mutations, 进行封装
export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  // 判断随机
  if (state.mode === playMode.random) {
    let randomlist = shuffle(list)
    //随机播放列表
    commit(types.SET_PLAYLIST, randomlist)
    index = findIndex(randomlist, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURREMT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomlist = shuffle(list)
  commit(types.SET_PLAYLIST, randomlist)
  commit(types.SET_CURREMT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // song 插入的歌曲 findIndex 返回列表的 index
  let fpIndex = findIndex(playlist, song)
  // 插入 当前歌曲 index 加 1
  currentIndex++
  // song 添加到 数组
  playlist.splice(currentIndex, 0, song)
  // 如果以 包含 这首歌
  if (fpIndex > -1) {
    // 如果 song 在 fpIndex 的 后面
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      // 加 1 是 song 已添加到 数组前面
      playlist.splice(fpIndex + 1, 1)
    }
  }
  // 当前播放歌曲 index + 1
  let currentsIndex = findIndex(sequenceList, currentSong) + 1
  // 列表中 song 的 index
  let fsIndex = findIndex(sequenceList, song)
  // song 添入 列表
  sequenceList.splice(currentsIndex, 0, song)
  // 如何 列表有 song
  if (fsIndex > -1) {
    // song 的 index 大于 列表中 song
    if (currentsIndex > fsIndex) {
      // 删除 fsIndex
      sequenceList.splice(fsIndex, 1)
    } else {
      // 加 1 是 song 已添加到 数组前面
        sequenceList.splice(fsIndex + 1, 1)
    }
  }
  console.log(currentIndex)
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURREMT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const saveRearchHistory = function({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deteleSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function ({commit}) {
  // 清除 搜索 历史
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex

  // 当前触发歌曲 在 歌曲列表 里 的
  let pIndex = findIndex(playlist, song)
  // 删除 列表里的 歌曲
  playlist.splice(pIndex, 1)

  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)
  // 如果 播放歌曲 index 大于 删除 歌曲的 index
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    // 当前播放歌曲 index 减 1
    currentIndex--
  }
  // mutation  更改 数据
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURREMT_INDEX, currentIndex)
  // 如果 列表 没有 歌曲
  const playingState = playlist.length > 0
  commit(types.SET_PLAYING_STATE, playingState)
}
// 播放列表清空
export const deleteSongList = function ({commit}) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURREMT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}
