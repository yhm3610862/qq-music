import {mapGetters} from 'vuex'
import {playMode} from 'common/js/conflg'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted () {
    this.handlePlaylist(this.playlist)
  },
  activated () {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist (newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist () {
      throw new Error('component must implement handlePlaylist methods')
    }
  }
}

export const playerMixin = {
  computed: {
    iconMode () {
      console.log(this.mode)
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode ===
      playMode.loop ? 'icon-loop' : 'icon-random'
    }
  }
}
