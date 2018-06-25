<template>
  <div>
    <b-table :small="tsize" responsive head-variant="dark" striped :fields="tfields" :items="tdata"></b-table>
 </div>
</template>

<script>
export default {
  name: '',
  props: ['tsize', 'tdata', 'tfields'],
  data () {
    return {
      message: ''
    }
  },
  methods: {
  },
  created () {
  },
  watch: {
  },
  computed: {
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
