import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    connected: false,
    error: '',
    directoryQueues: {},
    orderQueue: [],
    ingestQueue: []
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
      state.directoryQueues = dirDict
    },
    SOCKET_ORDER_QUEUE (state, orderQueue) {
      state.orderQueue = orderQueue
    },
    SOCKET_INGEST_QUEUE (state, ingestQueue) {
      console.log('ingestQueue in socket store: ', ingestQueue)
      state.ingestQueue = ingestQueue
    }
  },
  getters: {
    getOrderQueue (state) {
      let queue = state.orderQueue[0] != null ? Object.values(state.orderQueue[0]) : []
      return queue
    },
    getIngestQueue (state) {
      let queue = state.ingestQueue[0] != null ? Object.values(state.ingestQueue[0]) : []
      return queue
    },
    getDirectoryQueue (state) {
      let dirQueues = state.directoryQueues
      console.log('dir queue in getDirQueue: ', dirQueues)
      let orderQueue = state.orderQueue[0] != null ? Object.values(state.orderQueue[0]) : []
      orderQueue.map(job => {
        dirQueues[job.directory].jobs.push(job)
      })
      return dirQueues
    }
  }
})
