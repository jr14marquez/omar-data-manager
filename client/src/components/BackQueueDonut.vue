<template>
  <canvas id="donut-chart"></canvas></b-col>
</template>

<script>
import Chart from 'chart.js'

export default {
  data () {
    return {
      stat_labels: [{ name: 'BackQueue' }, { name: 'Queues' }, { name: 'Ingest' }, { name: 'Failed' }],
      selected: 'BackQueue',
      items: [{ file_name: '', size: '', created: '', priority: '', file_type: '', mission: '' }],
      mission_chart: {},
      chart_data: {
        datasets: [{
          data: [],
          backgroundColor: ['#FF0000', '#FFFF00', '#84FF63', '#4422dd', '#000000']
        }],
        labels: []
      }
    }
  },
  methods: {
    createChart (chartId, chartData) {
      console.log('create chart called')
      const ctx = document.getElementById(chartId)
      this.mission_chart = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {}
      })
    }
  },
  created () {
    let jobs = this.$store.getters.getBackQueue.length !== 0 ? this.$store.getters.getBackQueue : this.items
    console.log('jobs in donut: ', jobs)
  },
  mounted () {
    this.createChart('donut-chart', this.chart_data)
  },
  watch: {
    backQueue (jobs) {
      console.log('in watch')
      var counts = {}
      jobs.map(job => { counts[job.mission] = (counts[job.mission] || 0) + 1 })
      Object.keys(counts).map(mission => {
        this.chart_data.datasets[0].data.push(counts[mission])
        this.chart_data.labels.push(mission)
      })
      // this.mission_chart.destroy()
      this.createChart('donut-chart', this.chart_data)
    }
  },
  computed: {
    backQueue: function () {
      let jobs = this.$store.getters.getBackQueue.length !== 0 ? this.$store.getters.getBackQueue : this.items
      return jobs
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.stat-widget {
  height: 80%;
}

.stat-widget-col {
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 10px;
  padding-bottom: 10px; 

}

.nav-stat {
  height: 15%;
  line-height: 3em;
}

.nav-stat-label {
  width: 50%;
  margin-left: auto;
  margin-right: auto;
}

.highlighted {
  border-bottom: solid;
}


</style>
