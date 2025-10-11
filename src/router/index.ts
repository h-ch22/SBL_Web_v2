import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { auth } from '@/main'
import HomeView from '../views/HomeView.vue'
import MembersView from '@/views/MembersView.vue'
import BoardView from '@/views/BoardView.vue'
import PublicationsView from '@/views/PublicationsView.vue'
import LecturesView from '@/views/LecturesView.vue'
import ContactView from '@/views/ContactView.vue'
import DownloadsView from '@/views/DownloadsView.vue'
import CreateMemberView from '@/views/CreateMemberView.vue'
import CreatePostView from '@/views/CreatePostView.vue'
import ModifyContactView from '@/views/ModifyContactView.vue'
import ResearchView from '@/views/ResearchView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import SettingsView from '@/views/SettingsView.vue'

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
    path: '/research',
    name: 'research',
    component: ResearchView
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
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-member',
    name: 'createMember',
    component: CreateMemberView,
    meta: { requiresAuth: true }
  },
  {
    path: '/modify-member',
    name: 'modifyMember',
    component: CreateMemberView,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-post',
    name: 'createPost',
    component: CreatePostView,
    meta: { requiresAuth: true }
  },
  {
    path: '/modify-post',
    name: 'modifyPost',
    component: CreatePostView,
    meta: { requiresAuth: true }
  },
  {
    path: '/modify-contact',
    name: 'modifyContact',
    component: ModifyContactView,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  },
  {
    path: '/404',
    name: 'notFound',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        left: 0,
        top: 0
      }
    } else {
      return {
        top: 0,
        left: 0
      }
    }
  }
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && auth.currentUser === null) {
    alert('You must be signed in to access this page.')
    next('/')
  } else {
    next()
  }
})

export default router
