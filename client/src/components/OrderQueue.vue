<template>
  <div class="queue-table">
   <stat-table style="height:90%;border:solid 1px #9e9e9e;" :tsize="'small'" :tdata="orderQueue" :tfields="fields"></stat-table>
 </div>
</template>

<script>
import StatTable from './Table.vue'

export default {
  name: 'OrderQueue',
  components: {
    StatTable
  },
  data () {
    return {
      message: '',
      response: 'Server has not yet replied.',
      fields: ['filename', 'size', 'created', 'priority', 'file_type', 'mission'],
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
    orderQueue: function () {
      let jobs = this.$store.getters.getOrderQueue.length !== 0 ? this.$store.getters.getOrderQueue : this.items
      return jobs
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.queue-table {
  height: 100%;
  overflow-y: auto;
}

.table-responsive {
  height:100%;
}

</style>
