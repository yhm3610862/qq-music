import storage from 'good-storage'

const SEARCH_KEY = '_search_'
const SEARCH_MAX_LENGTH = 15

function insertArray(arr, val, compare, maxLen) {
  // 查找 这个 数据，返回 index
  const index = arr.findIndex(compare)
  // 如何是第一个 直接 return
  if (index === 0) {
    return
  }
  // 如何有这个数据，并不是第一个
  if (index > 0) {
    // 删除 重复那个
    arr.splice(index, 1)
  }
  // 插入到 数组 第一个
  arr.unshift(val)
  // 如歌 数组 长度 大于 限制 长度
  if (maxLen && arr.length > maxLen) {
    // 删除最后一个
    arr.pop()
  }
}

function deleteFromArray (arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

export function saveSearch(query) {
  // get 一个数组
  let searches = storage.get(SEARCH_KEY, [])
  // 执行函数，query插入数组， item 为 findIndex遍历值
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LENGTH)
  // 重新 set 数组
  storage.set(SEARCH_KEY, searches)
  return searches
}
export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])

  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearSearch () {
  storage.remove(SEARCH_KEY)
  return []
}
