<template>
  <div id="app">
    <div class="container-fluid" id="classification" style="padding-right:0px;padding-left:0px;height:3%;">
        <div class="col-12" style="background-color:#f4ed7c;height:100%;"><div class="text-center">CLASSIFICATION</div></div>
    </div>
    <b-navbar type="dark" variant="dark">
      <b-navbar-brand href="#">
        <img id="o2-logo" src="https://omar-rel.ossim.io/omar-ui/assets/o2-logo-61e1cb4d9a73f21683c6d15c66ec48c7.png" alt="">
          OMAR-DATA-MANAGER
      </b-navbar-brand>
    </b-navbar>
     <div class="container-fluid" style="height:88%;background-color:#00b2a0;margin-right:0px;margin-left:0px;">
        <div class="row no-gutters" style="height:180px;padding-top:15px;padding-bottom:15px;">
            <div class="col-md-3" style="padding-left:15px;padding-right:15px;">
              <div class="widget info-widget" style="background-color:#930042;height:100%"><!--use this class for margin-bottom, box shadows-->
                <div class="widget-body" style="height:100%;padding:1.5rem">
                  <div class="info-widget-inner" style="height:100%;">
                    <div class="stats" style="height:100%;">
                      <b-col cols="" class="bg-primary" style="font-size:2.625rem;height:55%;padding-top:.5rem;padding-bottom:.5rem">29</b-col>
                      <b-col cols="" class="bg-primary" style="height:45%;">Submitted</b-col>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3" style="background-color:#00386b;padding-left:15px;">

            </div>
            <div class="col-md-3" style="background-color:#009e60;">

            </div>
            <div class="col-md-3" style="background-color:#d81e05;">

            </div>
        </div>

        <div style="background-color:#ffd691;height:73%;">
            <b-nav justified pills style="line-height:5em;">
              <b-nav-item><div style="width: 50%;margin-left: auto;margin-right: auto;border-bottom: solid;">Submitted</div></b-nav-item>
              <b-nav-item><div style="width: 50%;margin-left: auto;margin-right: auto;border-bottom: solid;">Active</div></b-nav-item>
              <b-nav-item><div style="width: 50%;margin-left: auto;margin-right: auto;border-bottom: solid;">Failed</div></b-nav-item>
              <b-nav-item><div style="width: 50%;margin-left: auto;margin-right: auto;border-bottom: solid;">Clients</div></b-nav-item>
            </b-nav>
        </div>
    </div>
    <!--<quickInfo></quickInfo>-->
    <!--<backQueue></backQueue>-->
    <!--<router-view></router-view>-->
  </div>
</template>

<script>
import BackQueue from './components/BackQueue.vue'
import QuickInfo from './components/QuickInfo.vue'

export default {
  name: 'app',
  components: {
    BackQueue,
    QuickInfo
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
  /*background-color: #eee;*/
  height:100%;
}

.info-labels{
    border-bottom: solid;
    height: 80%;
    width: 80%;
    margin-left: auto;
    margin-right: auto;
}
</style>
