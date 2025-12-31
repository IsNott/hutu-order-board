import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue')
  },
  {
    path: '/board',
    name: 'Aoard',
    component: () => import('@/views/board/index.vue')
  },

]

export default createRouter({
  history: createWebHistory(),
  routes
})

