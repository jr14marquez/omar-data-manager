<template>
  <div class="col-12" v-bind:style="{ 'background-color': backgroundColor, height: height }">
    <div class="text-center">{{ classification }}</div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      classification: process.env.CLASSIFICATION_TYPE,
      backgroundColor: process.env.BACKGROUND_COLOR,
      height: '30%'
    }
  },
  mounted () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
