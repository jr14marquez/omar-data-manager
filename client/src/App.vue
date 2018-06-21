<template>
  <div id="app">
    <div class="container-fluid" style="padding:0px;margin:0px;height:8%;">
        <div class="col-12" style="background-color:#f4ed7c;height:30%;"><div class="text-center">CLASSIFICATION</div></div>

        <b-navbar type="dark" variant="dark" style="height:70%">
          <b-navbar-brand href="#">
            <img id="o2-logo" src="https://omar-rel.ossim.io/omar-ui/assets/o2-logo-61e1cb4d9a73f21683c6d15c66ec48c7.png" alt="">
              OMAR-DATA-MANAGER
          </b-navbar-brand>
        </b-navbar>
    </div>
    

     <div class="container-fluid" style="height:92%;background-color:#00b2a0;margin-right:0px;margin-left:0px;">
        <!--QUICK INFO-->
        <div class="row no-gutters" style="height:25%;padding-top:15px;padding-bottom:15px;">

            <div class="col-md-3" style="padding-right:10px;">
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

            <div class="col-md-3" style="padding-left:10px;padding-right:10px;">
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

            <div class="col-md-3" style="padding-left:10px;padding-right:10px;">
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

            <div class="col-md-3" style="padding-left:10px;">
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
            
           
            
        </div>

        <!--STAT WIDGET-->
        <div style="background-color:#ffd691;height:75%;padding-bottom:15px;">
            <!--NAV PILLS-->
            <b-nav justified pills style="height:15%;line-height:3em;">
              <b-nav-item><div style="width: 50%;margin-left: auto;margin-right: auto;border-bottom: solid;">Submitted</div></b-nav-item>
              <b-nav-item><div style="width: 50%;margin-left: auto;margin-right: auto;border-bottom: solid;">Active</div></b-nav-item>
              <b-nav-item><div style="width: 50%;margin-left: auto;margin-right: auto;border-bottom: solid;">Failed</div></b-nav-item>
              <b-nav-item><div style="width: 50%;margin-left: auto;margin-right: auto;border-bottom: solid;">Clients</div></b-nav-item>
            </b-nav>

            <!--CHART AND TABLE-->
            <b-row no-gutters class="justify-content-center" style="height:85%;">
              <b-col md="6" cols="6" style="background-color:red;"></b-col>
              <b-col md="6" cols="6" style="background-color:black;"></b-col>
            </b-row>
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
