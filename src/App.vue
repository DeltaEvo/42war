<template>
  <div id="app">
    <nav id="nav">
      Lol
    </nav>
    <router-view/>
  </div>
</template>
<style lang="stylus">
body
  margin 0
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
  background #f0f2f2
  min-height 100vh
  display: flex

#nav
  width: 100px;
  background: red;
</style>
