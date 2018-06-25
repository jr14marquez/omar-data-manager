<template>
  <div>
    <b-table bg-primary small responsive head-variant="dark" striped :items="backQueue">
   </b-table>
   <b-pagination align="center" size="md" :total-rows="jobLength" v-model="currentPage" :per-page="8">
   </b-pagination>
 </div>
</template>

<script>
export default {
  name: 'BackQueue',
  data () {
    return {
      message: '',
      response: 'Server has not yet replied.',
      currentPage: 1,
      jobsPerPage: 8,
      jobLength: 8,
      items: [{ file_name: '', size: '', created: '', priority: '', file_type: '', mission: '' }],
      testData: [
        { file_name: '02MAR1722111234.txt', size: '1GB', created: 'Today', priority: '10' },
        { file_name: '03DEC1722111234.txt', size: '2GB', created: 'Yesterday', priority: '10' },
        { file_name: '04JUN1722111234.txt', size: '3GB', created: 'Tomorrow', priority: '1' },
        { file_name: '01MAY1722111234.txt', size: '10GB', created: 'Now', priority: '5' },
        { file_name: '08APR1722111234.txt', size: '12GB', created: 'Today', priority: '8' },
        { file_name: '04JUN1722111234.txt', size: '3GB', created: 'Tomorrow', priority: '1' },
        { file_name: '01MAY1722111234.txt', size: '10GB', created: 'Now', priority: '5' },
        { file_name: '02MAR1722111234.txt', size: '1GB', created: 'Today', priority: '10' },
        { file_name: '03DEC1722111234.txt', size: '2GB', created: 'Yesterday', priority: '10' },
        { file_name: '04JUN1722111234.txt', size: '3GB', created: 'Tomorrow', priority: '1' }
      ]
    }
  },
  methods: {
  },
  created () {
  },
  watch: {
  },
  computed: {
    backQueue: function () {
      let jobs = this.$store.getters.getBackQueue.length !== 0 ? this.$store.getters.getBackQueue : this.items
      this.jobLength = jobs.length - 1
      let start = (this.currentPage - 1) * this.jobsPerPage
      let defaultEnd = this.currentPage * this.jobsPerPage
      let end = defaultEnd < this.jobLength ? defaultEnd : this.jobLength
      let paginationJobs = []
      for (var i = start; i < end; i++) {
        paginationJobs.push(jobs[i])
      }
      // return jobs
      console.log('pageinationJobs', paginationJobs)
      return paginationJobs
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.table {
  
}

.table-responsive {
  height:100%;
}

</style>
