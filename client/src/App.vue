<template>
  <div id="app">
    <b-navbar type="dark" variant="dark">
      <b-navbar-brand href="#">
        <img id="o2-logo" src="https://omar-rel.ossim.io/omar-ui/assets/o2-logo-61e1cb4d9a73f21683c6d15c66ec48c7.png" alt="">
          OMAR-DATA-MANAGER
      </b-navbar-brand>
    </b-navbar>
    <!--<router-view></router-view>-->
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#o2-logo {
  height:32px;
  width:32px;
}
</style>
