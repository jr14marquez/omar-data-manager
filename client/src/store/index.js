import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    connected: false,
    error: '',
    directoryQueues: {},
    orderQueue: [],
    ingestQueue: [],
    clientStatus: { active: [], removed: [] }
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
        // dirDict[dir].jobs = []
        dirDict[dir].jobs = {}
      })
      state.directoryQueues = dirDict
    },
    SOCKET_ORDER_QUEUE (state, orderQueue) {
      state.orderQueue = orderQueue
    },
    SOCKET_INGEST_QUEUE (state, ingestQueue) {
      state.ingestQueue = ingestQueue[0]
    },
    SOCKET_CLIENT_STATUS (state, clientStatus) {
      // Client status comes in before everything else so we prepare our data
      clientStatus[0].active.map(client => {
        state.ingestQueue[client] = {jobs: {}}
      })
      state.clientStatus = clientStatus[0]
    }
  },
  getters: {
    getOrderQueue (state) {
      let queue = state.orderQueue[0] != null ? Object.values(state.orderQueue[0]) : []
      return queue
    },
    getIngestQueue (state) {
      return state.ingestQueue
    },
    getClientStatus (state) {
      return state.clientStatus
    },
    getDirectoryQueue (state) {
      let dirQueues = state.directoryQueues
      let orderQueue = state.orderQueue[0] != null ? Object.keys(state.orderQueue[0]) : []
      if (orderQueue.length > 0) {
        orderQueue.map(jobId => {
          let directory = state.orderQueue[0][jobId].directory
          dirQueues[directory].jobs[jobId] = state.orderQueue[0][jobId]
        })
        return dirQueues
      } else {
        dirQueues = []
        return dirQueues
      }
    }
  }
})
