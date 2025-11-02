import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'
import { QuillEditor } from '@vueup/vue-quill'

import {
  faMagnifyingGlass,
  faPhone,
  faFile,
  faNewspaper,
  faUser,
  faBars,
  faMoon,
  faSun,
  faPlayCircle,
  faPauseCircle,
  faXmark,
  faImages,
  faTrophy,
  faChalkboardTeacher,
  faProjectDiagram,
  faEnvelope,
  faKey,
  faRightFromBracket,
  faLink,
  faAdd,
  faGraduationCap,
  faStar,
  faUserTie,
  faIdCardClip,
  faDownload,
  faTrash,
  faEdit,
  faChevronDown,
  faChevronUp,
  faLocationPin,
  faArrowUpRightFromSquare,
  faCheck,
  faList,
  faClipboard,
  faClipboardCheck,
  faWarning,
  faArrowLeft,
  faHome,
  faChevronLeft,
  faChevronCircleLeft,
  faCalendar,
  faBuilding,
  faMoneyBill,
  faWindowMaximize,
  faGear,
  faArrowRight,
  faSignIn,
  faEyeSlash,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons'
import { faLine } from '@fortawesome/free-brands-svg-icons'

const firebaseConfig = {
  apiKey: 'AIzaSyBcxoVyEHrPCEfebnsOOcsUhybG2cp0zwc',
  authDomain: 'sbl-web.firebaseapp.com',
  projectId: 'sbl-web',
  storageBucket: 'sbl-web.appspot.com',
  messagingSenderId: '364712268844',
  appId: '1:364712268844:web:e880b875f1c4fb3054ad89',
  measurementId: 'G-GBRQX4LTZB'
}

library.add(
  faNewspaper,
  faUser,
  faMagnifyingGlass,
  faFile,
  faPhone,
  faBars,
  faMoon,
  faSun,
  faPlayCircle,
  faPauseCircle,
  faXmark,
  faImages,
  faTrophy,
  faChalkboardTeacher,
  faProjectDiagram,
  faEnvelope,
  faKey,
  faRightFromBracket,
  faLink,
  faAdd,
  faGraduationCap,
  faStar,
  faUserTie,
  faIdCardClip,
  faUser,
  faDownload,
  faTrash,
  faEdit,
  faChevronDown,
  faChevronUp,
  faChevronLeft,
  faChevronCircleLeft,
  faLocationPin,
  faCheck,
  faLine,
  faList,
  faClipboard,
  faClipboardCheck,
  faWarning,
  faArrowLeft,
  faHome,
  faCalendar,
  faBuilding,
  faMoneyBill,
  faArrowUpRightFromSquare,
  faWindowMaximize,
  faGear,
  faArrowRight,
  faSignIn,
  faEyeSlash,
  faInfoCircle,
  faCheck,
  faXmark
)

loadFonts()

const app = createApp(App)
const firebaseApp = initializeApp(firebaseConfig)
const analytics = getAnalytics(firebaseApp)
const firestore = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)
const auth = getAuth(firebaseApp)

app.use(router)
app.use(vuetify)
app.component('font-awesome-icon', FontAwesomeIcon)
app.component('QuillEditor', QuillEditor)
app.mount('#app')

export { analytics, firestore, storage, auth }
