import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MoveablePlayer from '../views/MoveablePlayer.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/moveable-player',
      name: 'moveable-player',
      component: MoveablePlayer
    }
  ]
})

export default router
