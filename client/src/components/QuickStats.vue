<template>
  <b-row id="quick-stat-row">

    <b-col cols="3" md="3" class="widget-col-left">
      <div class="widget quick-stat-widget">
        <div class="widget-body">
          <div class="quick-stat-widget-inner">
            <div class="quick-stat">
              <b-col class="quick-stat-number">{{orderQueue}}</b-col>
              <b-col class="quick-stat-name">Ordered</b-col>
            </div>
          </div>
        </div>
      </div>
    </b-col>

    <b-col cols="3" md="3" class="widget-col-center">
      <div class="widget quick-stat-widget">
        <div class="widget-body">
          <div class="quick-stat-widget-inner">
            <div class="quick-stat">
              <b-col class="quick-stat-number">{{ingestQueue}}</b-col>
              <b-col class="quick-stat-name">Ingesting</b-col>
            </div>
          </div>
        </div>
      </div>
    </b-col>

    <b-col cols="3" md="3" class="widget-col-center">
      <div class="widget quick-stat-widget">
        <div class="widget-body">
          <div class="quick-stat-widget-inner">
            <div class="quick-stat">
              <b-col class="quick-stat-number">{{clientStatus}}</b-col>
              <b-col class="quick-stat-name">Clients</b-col>
            </div>
          </div>
        </div>
      </div>
    </b-col>

     <b-col cols="3" md="3" class="widget-col-right">
      <div class="widget quick-stat-widget">
        <div class="widget-body">
          <div class="quick-stat-widget-inner">
            <div class="quick-stat">
              <b-col class="quick-stat-number">0</b-col>
              <b-col class="quick-stat-name">Failed</b-col>
            </div>
          </div>
        </div>
      </div>
    </b-col>

  </b-row>
            
</template>

<script>
export default {
  name: 'QuickStats',
  data () {
    return {
      message: ''
    }
  },
  methods: {
  },
  created () {
  },
  watch: {
  },
  computed: {
    orderQueue () {
      // console.log('in orderQueue for quick stats')
      let jobs = this.$store.getters.getOrderQueue.length
      return jobs
    },
    ingestQueue () {
      // let queues = this.$store.getters.getIngestQueue != null ? this.$store.getters.getIngestQueue.length : 0
      let queues = this.$store.getters.getIngestQueue
      var runningTotal = 0
      Object.keys(queues).map(queue => {
        runningTotal = runningTotal + Object.keys(queues[queue].jobs).length
      })
      // console.log('ingestQueues in quick stats', queues)
      return runningTotal
    },
    clientStatus () {
      let clients = this.$store.getters.getClientStatus
      // console.log('client status', clients)
      return clients.active.length
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

#quick-stat-row {
  height: 20%;
  padding-bottom: 25px;
}

.widget-col-left {
  padding-right: 10px;
}

.widget-col-center {
  padding-right: 10px;
  padding-left: 10px;
}

.widget-col-right {
  padding-left: 10px;
}

.widget-body {
  height: 100%;
  padding: 1.5rem;
}

.quick-stat-widget, 
.quick-stat-widget-inner,
.quick-stat {
  height: 100%;
}

.quick-stat-number {
  font-size: 5vh;
  height: 70%;
  padding-bottom: .5rem;
}

.quick-stat-name {
  height: 30%;
}

</style>
