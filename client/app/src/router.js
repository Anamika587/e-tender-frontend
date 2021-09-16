import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
function loadView (view) {
  return () => import(/* webpackChunkName: "view-[request]" */ `@/views/${view}.vue`)
}
export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: loadView('Home'),
      meta: { title: 'Home', icon : 'mdi mdi-home-outline' }
    },
    {
      path: '/mqlRequestDemo',
      name: 'mqlRequestDemo',
      component: loadView('MQLRequestDemo'),
      meta: { title: 'MQLRequestDemo', icon : 'mdi mdi-presentation-play' }
    },
    {
      path: '/cdnUpload',
      name: 'cdnUpload',
      component: loadView('CdnUpload'),
      meta: { title: 'Cdn Upload' , icon : 'mdi mdi-upload'}
    },
    {
      path: '/MqlAssetFDBDemo',
      name: 'MqlAssetFDBDemo',
      component: loadView('MqlAssetFDBDemo'),
      meta: { title: 'Mql Request For Asset FDB Demo', icon : 'mdi mdi-database-plus' }
    }
  ]
})
