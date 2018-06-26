<template>
    <b-table :small="tsize" outlined responsive head-variant="dark" striped :fields="tfields" :items="tdata"></b-table>
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

.table-responsive {
  height:100%;
}

</style>
