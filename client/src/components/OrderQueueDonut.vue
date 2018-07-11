<template>
  <canvas id="donut-chart"></canvas></b-col>
</template>

<script>
import Chart from 'chart.js'

export default {
  data () {
    return {
      stat_labels: [{ name: 'OrderQueue' }, { name: 'Queues' }, { name: 'Ingest' }, { name: 'Failed' }],
      selected: 'OrderQueue',
      items: [{ file_name: '', size: '', created: '', priority: '', file_type: '', mission: '' }],
      mission_chart: {},
      chart_data: {
        datasets: [{
          data: [],
          backgroundColor: [
            '#2A2B2A', '#20FC8F', '#ADC698', '#E9D758', '#297373',
            '#FF8552', '#E6E636', '#3E000C', '#FFCBDD', '#D10000',
            '#5299D3', '#0B5563', '#BBBE64', '#7D8491', '#E8985E',
            '#DEC0F1', '#7161EF', '#3B252C', '#353831', '#HFF1053',
            '#66C7F4', '#E3E4DB', '#011936', '#EFD780', '#3E1929'
          ]
        }],
        labels: []
      }
    }
  },
  methods: {
    createChart (chartId, chartData) {
      const ctx = document.getElementById(chartId)
      this.mission_chart = new Chart(ctx, {
        type: 'doughnut',
        data: this.chart_data,
        options: {}
      })
    }
  },
  created () {
  },
  mounted () {
    this.createChart('donut-chart', this.chart_data)
  },
  watch: {
    orderQueue (jobs) {
      var counts = {}
      jobs.map(job => { counts[job.mission] = (counts[job.mission] || 0) + 1 })
      this.chart_data.datasets[0].data = Object.values(counts)
      this.chart_data.labels = Object.keys(counts)
      this.mission_chart.update()
    }
  },
  computed: {
    orderQueue: function () {
      let jobs = this.$store.getters.getOrderQueue.length !== 0 ? this.$store.getters.getOrderQueue : this.items
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
