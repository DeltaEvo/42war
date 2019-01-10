<template>
  <div id="app">
    <nav id="nav">
      <ul>
        <router-link
          v-for="(route, i) in $router.options.routes.filter(({ meta }) => meta && meta.link)"
          :key="i"
          tag="li"
          :to="route"
        >
          <icon class="icon" :icon="route.meta.icon"/>
        </router-link>
      </ul>
    </nav>
    <router-view/>
  </div>
</template>
<style lang="stylus">
@import "./stylus/theme.styl"

body {
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50
  background: $color.background
  min-height: 100vh
  display: flex
}

#nav {
  min-width: 75px;
  background: $color.primary;
  color: white;

  & > ul {
    list-style: none;
    padding: 0;
    margin: 0;

    & > li {
      height: @min-width;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        width: 25px;
        height: @width;
      }

      &:hover, &.router-link-active  {
        background-color: $color.secondary;
        cursor: pointer;
      }
    }
  }
}
</style>
