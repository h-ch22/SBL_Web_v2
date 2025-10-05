import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MembersView from '@/views/MembersView.vue'
import BoardView from '@/views/BoardView.vue'
import PublicationsView from '@/views/PublicationsView.vue'
import LecturesView from '@/views/LecturesView.vue'
import ContactView from '@/views/ContactView.vue'
import DownloadsView from '@/views/DownloadsView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/members',
    name: 'members',
    component: MembersView
  },
  {
    path: '/awards',
    name: 'awards',
    component: BoardView
  },
  {
    path: '/news',
    name: 'news',
    component: BoardView
  },
  {
    path: '/publications',
    name: 'publications',
    component: PublicationsView
  },
  {
    path: '/lectures',
    name: 'lectures',
    component: LecturesView
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: BoardView
  },
  {
    path: '/downloads',
    name: 'downloads',
    component: DownloadsView
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
