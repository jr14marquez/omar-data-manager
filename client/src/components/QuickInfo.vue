<template>
  <b-container fluid>
    <b-row align-h="around" id="quick-info">
      <b-col p-1 cols="3" class="bg-primary h-75 widget">Submitted</b-col>
      <b-col p-1 cols="3" class="bg-warning h-75 widget">Running</b-col>
      <b-col p-1 cols="3" class="bg-danger h-75 widget">Failed</b-col>
      <b-col p-1 cols="3" class="bg-primary h-75 widget">Workers</b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: 'QuickInfo',
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

#quick-info {
  padding-top: 30px;
  padding-bottom: 30px;
  height:200px;
}

.widget {
}


</style>
