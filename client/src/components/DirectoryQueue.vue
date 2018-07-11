<template>
  <div class="h-100">
    <b-col class="h-100" cols="12" >
      <b-card no-body class="h-100">
        <b-tabs pills card vertical class="h-100" nav-wrapper-class="col-2">
          <b-tab class="h-100" v-for="dir,index in Object.keys(DirectoryQueues)" :key="dir">
            <template slot="title">
              {{dir}}: <b-badge variant="dark">{{Object.values(DirectoryQueues[dir].jobs).length}}</b-badge>
            </template>
            <b-row class="h-100">
              <b-col md="6" cols="6" class="h-100">
                <b-row class="justify-content-center">
                  <h5><b-badge variant="seondary">Priority: {{DirectoryQueues[dir].priority}}</b-badge></h5>
                  <h5><b-badge variant="seondary">Extensions: {{DirectoryQueues[dir].extensions}}</b-badge></h5>
                </b-row>
                <stat-table style="height:90%;border:solid 1px #9e9e9e;" :tsize="'small'" :tdata="Object.values(DirectoryQueues[dir].jobs)" :tfields="fields"></stat-table>
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
  name: 'DirectoryQueue',
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
    jobLength: function (dir) {
      let length = this.DirectoryQueues[dir].jobs.length
      console.log('length: ', length)
      return length
    }
  },
  created () {
  },
  watch: {
  },
  computed: {
    DirectoryQueues: function () {
      // Returns DirecotoryQueue in form {'/directory/name': { extensions: [], priority: 10, jobs: { jobId: {details} }}}
      let dirQueues = this.$store.getters.getDirectoryQueue
      return dirQueues
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
