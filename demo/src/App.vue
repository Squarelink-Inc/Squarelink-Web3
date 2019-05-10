<template>
  <div id="app">
    <img alt="Vue logo" width="400" src="https://squarelink.com/img/logo.png">
    <h3>Squarelink Sign In Example</h3>
    <a href="https://github.com/Squarelink-Inc/Sign-In-Example/blob/master/src/components/SampleApp.vue" target="_blank">View the code</a>
    <SampleApp/>
  </div>
</template>

<script>
import SampleApp from './components/SampleApp.vue'

export default {
  name: 'app',
  components: {
    SampleApp
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
  margin-top: 60px;
}
</style>
