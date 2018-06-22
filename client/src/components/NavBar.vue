<template>
  <b-navbar type="dark" variant="dark" id="nav">
    <b-navbar-brand href="#">
      <img id="o2-logo" src="https://omar-rel.ossim.io/omar-ui/assets/o2-logo-61e1cb4d9a73f21683c6d15c66ec48c7.png" alt="">
        {{ name }}
    </b-navbar-brand>
  </b-navbar>
</template>

<script>
export default {
  data () {
    return {
      name: 'OMAR-DATA-MANANGER'
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

#nav {
  height:70%;
}


</style>
