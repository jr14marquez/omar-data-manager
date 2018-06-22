<template>
  <div id="app">
    <div class="container-fluid" style="padding:0px;margin:0px;height:8%;">
      <classification></classification>
      <navBar></navBar>
    </div>
    
     <div class="container-fluid" style="height:92%;background-color:#eee;margin-right:0px;margin-left:0px;padding:25px;">
      <quickStats></quickStats>
      <stats></stats>
    </div>

    <!--<router-view></router-view>-->
  </div>
</template>

<script>
import QuickStats from './components/QuickStats.vue'
import Classification from './components/ClassificationBanner.vue'
import NavBar from './components/NavBar.vue'
import Stats from './components/Stats.vue'

export default {
  name: 'app',
  components: {
    QuickStats,
    Classification,
    NavBar,
    Stats
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height:100%;
}

#o2-logo {
  height:32px;
  width:32px;
}

html,body {
  height:100%;
}

.widget{
  background: #fff;
  box-shadow: 0 4px 70px -18px #707070;
}


</style>
