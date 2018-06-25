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
      items: [{ file_name: '', size: '', created: '', priority: '', file_type: '', mission: '' }]
    }
  },
  methods: {
  },
  created () {
    let jobs = this.$store.getters.getBackQueue.length !== 0 ? this.$store.getters.getBackQueue : this.items
    console.log('jobs in donut: ', jobs)
  },
  mounted () {
    var data = {
      datasets: [{
        data: [10, 20, 30],
        backgroundColor: [
          '#FF0000',
          '#FFFF00',
          '#84FF63'
        ]
      }],
      labels: ['Red', 'Yellow', 'Blue']
    }
    const ctx = document.getElementById('donut-chart')
    var myDoughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {}
    })

    this.createChart('donut-chart', myDoughnutChart)
  },
  watch: {
  },
  computed: {
    backQueue: function () {
      let jobs = this.$store.getters.getBackQueue.length !== 0 ? this.$store.getters.getBackQueue : this.items
      console.log('jobs in donut: ', jobs)
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
