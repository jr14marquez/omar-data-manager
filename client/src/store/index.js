import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    connected: false,
    error: '',
    backqueue: ''
  },
  mutations: {
    SOCKET_CONNECT (state) {
      state.connected = true
    },
    SOCKET_DISCONNECT (state) {
      state.connected = false
    },
    SOCKET_ERROR (state, message) {
      state.error = message.error
    },
    SOCKET_BACKQUEUE (state, backqueue) {
      state.backqueue = backqueue
    }
  },
  getters: {
    getBackQueue (state) {
      let queue = state.backqueue[0] != null ? Object.values(state.backqueue[0]) : []
      return queue
    }
  }
})
