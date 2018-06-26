<template>
  <div class="widget stat-widget">

    <b-nav justified pills class="nav-stat">
      <b-nav-item v-for="label in stat_labels">
        <div class="nav-stat-label" :class="{highlighted:label.name == selected}" @click="selected = label.name">{{ label.name }}</div>
      </b-nav-item>
    </b-nav>

    <!--CHART AND TABLE-->
    <b-row v-show="'OrderQueue' == selected" class="justify-content-center" style="height:85%;">
      <!--<b-col md="6" cols="6" style=""><line-example></line-example></b-col>-->
      <b-col md="6" cols="6" class="stat-widget-col"><orderQueueDonut></orderQueueDonut></b-col>
      <b-col md="6" cols="6" class="stat-widget-col"><orderQueue></orderQueue></b-col>
    </b-row>

    <b-row v-show="'Queues' == selected" class="justify-content-center" style="height:85%;">
      <b-col class="stat-widget-col"><directoryQueue></directoryQueue></b-col>
    </b-row>

    <b-row v-show="'Ingest' == selected" class="justify-content-center" style="height:85%;">
      <b-col class="stat-widget-col"><ingestQueue></ingestQueue></b-col>
    </b-row>

  </div>
</template>

<script>
import OrderQueue from './OrderQueue.vue'
import OrderQueueDonut from './OrderQueueDonut.vue'
import DirectoryQueue from './DirectoryQueue.vue'
import IngestQueue from './IngestQueue.vue'

export default {
  name: 'Stats',
  components: {
    OrderQueue,
    OrderQueueDonut,
    DirectoryQueue,
    IngestQueue
  },
  data () {
    return {
      stat_labels: [{ name: 'OrderQueue' }, { name: 'Queues' }, { name: 'Ingest' }, { name: 'Failed' }],
      selected: 'OrderQueue'
    }
  },
  methods: {
  },
  created () {
  },
  mounted () {
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
