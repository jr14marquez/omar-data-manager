<template>
  <div class="h-100">
    <b-col class="h-100" cols="12" >
      <b-card no-body class="h-100">
        <b-tabs pills card vertical class="h-100" nav-wrapper-class="col-2" v-if="clientStatus.active.length > 0">
          <b-tab class="h-100" v-for="client,index in clientStatus.active">
            <template slot="title">
              {{client}}: <b-badge variant="dark">{{Object.keys(IngestQueues[client].jobs).length}}</b-badge>
            </template>
            <b-row class="h-100">
              <b-col md="6" cols="6" class="h-100">
                <b-row class="justify-content-center">
                  <h3>hello</h3>
                  <!--<h5><b-badge variant="seondary">Priority: {{DirectoryQueues[dir].priority}}</b-badge></h5>
                  <h5><b-badge variant="seondary">Extensions: {{DirectoryQueues[dir].extensions}}</b-badge></h5>-->
                </b-row>
                <stat-table style="height:90%;border:solid 1px #9e9e9e;" :tsize="'small'" :tdata="Object.values(IngestQueues[client].jobs)" :tfields="fields"></stat-table>
              </b-col>
              <b-col md="6" cols="4" class="h-100">
                <p>charts comming</p>
              </b-col>
            </b-row>
          </b-tab>
       </b-tabs>
      </b-card>
    </b-col> 
  </div>
</template>

<script>
import StatTable from './Table.vue'

export default {
  name: 'IngestQueue',
  components: {
    StatTable
  },
  data () {
    return {
      message: '',
      response: 'Server has not yet replied.',
      fields: ['filename', 'size', 'created', 'file_type', 'mission'],
      num: 5,
      items: [{ file_name: '', size: '', created: '', priority: '', file_type: '', mission: '' }]
    }
  },
  methods: {
  },
  mounted () {
  },
  watch: {
  },
  computed: {
    clientStatus () {
      let clients = this.$store.getters.getClientStatus
      return clients
    },
    IngestQueues: function () {
      let queues = this.$store.getters.getIngestQueue
      return queues
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.table-responsive {
  
}

</style>
