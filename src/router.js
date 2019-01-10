import Vue from "vue";
import Router from "vue-router";
import Tournament from "./views/Tournament.vue";
import Run from "./views/Run.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    { path: "/", redirect: "/tournament" },
    {
      path: "/tournament",
      name: "TournamentPage",
      component: Tournament,
      meta: {
        link: true,
        icon: "trophy",
        name: "Tournament"
      }
    },
    {
      path: "/run",
      name: "RunPage",
      meta: {
        link: true,
        icon: "play",
        name: "Run"
      }
    },
    {
      path: "/run/:id",
      name: "run",
      component: Run,
      props: true
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    }
  ]
});
