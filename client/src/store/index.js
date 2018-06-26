import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    connected: false,
    error: '',
    directoryQueue: {},
    orderQueue: [],
    clientQueue: []
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
    SOCKET_MONITORED_DIRECTORIES (state, directories) {
      let dirDict = {}
      Object.keys(directories[0]).map(dir => {
        dirDict[dir] = directories[0][dir]
        dirDict[dir].jobs = []
      })
      state.directories = dirDict
    },
    SOCKET_ORDER_QUEUE (state, orderQueue) {
      state.orderQueue = orderQueue
    },
    SOCKET_CLIENT_QUEUE (state, clientQueue) {
      state.clientQueue = clientQueue
    }
  },
  getters: {
    getOrderQueue (state) {
      let queue = state.orderQueue[0] != null ? Object.values(state.orderQueue[0]) : []
      return queue
    },
    getClientQueue (state) {
      let queue = state.clientQueue[0] != null ? Object.values(state.clientQueue[0]) : []
      return queue
    },
    getDirectoryQueue (state) {
      let dirQueue = state.directoryQueue
      console.log('dir queue in getDirQueue: ', dirQueue)
      let orderQueue = state.orderQueue[0] != null ? Object.values(state.orderQueue[0]) : []
      orderQueue.map(job => {
        dirQueue[job.directory].jobs.push(job)
      })
      return dirQueue
    }
  }
})
