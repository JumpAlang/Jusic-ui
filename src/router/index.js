import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'music',
    component: () => import(/* webpackChunkName: "music" */ '../views/Music.vue')
  }
];

const router = new VueRouter({
  // mode: 'history',
  base: '/',
  routes
});

export default router;
