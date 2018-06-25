<template>
  <div class="widget stat-widget">

    <b-nav justified pills class="nav-stat">
      <b-nav-item v-for="label in stat_labels">
        <div class="nav-stat-label" 
            :class="{highlighted:label.name == selected}"
            @click="selected = label.name">{{ label.name }}
        </div>
      </b-nav-item>

      <!--<b-nav-item><div class="nav-stat-label highlighted">Submitted</div></b-nav-item>
      <b-nav-item><div class="nav-stat-label">Submitted</div></b-nav-item>
      <b-nav-item><div class="nav-stat-label">Submitted</div></b-nav-item>
      <b-nav-item><div class="nav-stat-label">Submitted</div></b-nav-item>-->
    </b-nav>

    <!--CHART AND TABLE-->
    <b-row v-show="'BackQueue' == selected" class="justify-content-center" style="height:85%;">
      <!--<b-col md="6" cols="6" style=""><line-example></line-example></b-col>-->
      <b-col md="6" cols="6" class="stat-widget-col"><canvas id="donut-chart"></canvas></b-col>
      <b-col md="6" cols="6" class="stat-widget-col"><backQueue></backQueue></b-col>
    </b-row>

    <b-row v-show="'Queues' == selected" class="justify-content-center" style="height:85%;">
      <!--<b-col class="stat-widget-col"><canvas id="donut-chart"></canvas></b-col>-->
      <b-col class="stat-widget-col"><backQueueDonut></backQueueDonut></b-col>
      <b-col md="6" cols="6" class="stat-widget-col"><backQueue></backQueue></b-col>
    </b-row>

  </div>
</template>

<script>
import BackQueue from './BackQueue.vue'
import BackQueueDonut from './BackQueueDonut.vue'

export default {
  name: 'Stats',
  components: {
    BackQueue,
    BackQueueDonut
  },
  data () {
    return {
      stat_labels: [{ name: 'BackQueue' }, { name: 'Queues' }, { name: 'Ingest' }, { name: 'Failed' }],
      selected: 'BackQueue'
    }
  },
  methods: {
  },
  created () {
  },
  mounted () {
    // var data = {
    //   datasets: [{
    //     data: [10, 20, 30],
    //     backgroundColor: [
    //       '#FF0000',
    //       '#FFFF00',
    //       '#84FF63'
    //     ]
    //   }],
    //   labels: ['Red', 'Yellow', 'Blue']
    // }
    // const ctx = document.getElementById('donut-chart')
    // var myDoughnutChart = new Chart(ctx, {
    //   type: 'doughnut',
    //   data: data,
    //   options: {}
    // })

    // this.createChart('donut-chart', myDoughnutChart)
  },
  watch: {
  },
  computed: {
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
