<template>
  <b-container class="table">
   <b-table striped :items="backQueue"></b-table>
  </b-container>
</template>

<script>
export default {
  name: 'BackQueue',
  data () {
    return {
      message: '',
      response: 'Server has not yet replied.',
      items: [{ file_name: '', size: '', created: '', priority: '' }]
    }
  },
  methods: {
    emitEvent () {
      // this.$socket.emit('hello_world', this.message)
    }
  },
  created () {
    this.jobs = this.$store.getters.getBackQueue

    setInterval(() => {
      console.log('GET BackQueue: ', this.$store.getters.getBackQueue)
    }, 10000)
  },
  watch: {
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
<style scoped>
.table {
  background-color:red;
}

</style>
