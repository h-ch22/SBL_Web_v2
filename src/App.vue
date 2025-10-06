<template>
  <v-app>
      <v-app-bar app color="transparent" style="backdrop-filter: blur(2px)">
        <v-toolbar-title>
          <v-img
            class="home-btn"
            @click="router.push({ name: 'home' })"
            :src="require(theme.current.value.dark ? '@/assets/SBL_Traditional_Symbol_Horizontal_English_White.svg' : '@/assets/SBL_Traditional_Symbol_Horizontal_English_Black.svg')"
            contain
            width="300"
            min-width="150">
          </v-img>
        </v-toolbar-title>

        <v-toolbar-items>
          <v-btn v-if="!isSignedIn" variant="plain" @click="showSignIn = !showSignIn">
            <font-awesome-icon v-if="showSignIn" icon="fa-solid fa-xmark"/>
            <font-awesome-icon v-else icon="fa-solid fa-user"/>
          </v-btn>

          <v-btn v-else variant="plain" @click="signOut()">
            <font-awesome-icon icon="fa-solid fa-right-from-bracket"/>
          </v-btn>

          <v-btn variant="plain" @click="switchTheme()">
            <font-awesome-icon
              v-if="theme.current.value.dark"
              icon="fa-solid fa-sun"
            ></font-awesome-icon>

            <font-awesome-icon
              v-else
              icon="fa-solid fa-moon"
            ></font-awesome-icon>
          </v-btn>

          <v-btn variant="plain" @click="showMenu = !showMenu">
            <font-awesome-icon v-if="showMenu" icon="fa-solid fa-xmark"/>
            <font-awesome-icon v-else icon="fa-solid fa-bars"/>
          </v-btn>
        </v-toolbar-items>
      </v-app-bar>
    <v-layout>

    <v-main>
      <router-view/>
      <transition name="fade">
        <div
          v-if="showMenu"
          class="overlay-menu rounded-xl elevation-14 opacity-90"
          :style="{ background: theme.current.value.colors.background, backdropFilter: 'blur(5px)' }"
        >
          <v-row>
            <v-col v-for="item in menuItems" :key="item.title">
              <div
                class="menuBtn"
                @click="showMenu = false; $router.push({ name: item.href })"
              >
                <font-awesome-icon :icon="['fa-solid', item.icon]"/>
                <div>{{ item.title }}</div>
              </div>
            </v-col>
          </v-row>
        </div>
      </transition>

      <div
        v-if="showSignIn"
        class="signin-menu rounded-xl elevation-14 opacity-90"
        :style="{
          background: theme.current.value.colors.background,
          width: detectMobile() ? '80vw' : '25vw',
          backdropFilter: 'blur(5px)'
        }"
      >
        <v-col>
          <v-text-field
            class="sign-in-field"
            v-model="email"
            label="E-Mail"
            type="email"
            prepend-icon="mdi-email"
            color="primary"
            :style="{ width: detectMobile() ? '70vw' : '22vw' }"
          ></v-text-field>

          <v-text-field
            class="sign-in-field"
            v-model="password"
            label="Password"
            type="password"
            prepend-icon="mdi-key"
            color="primary"
            :style="{ width: detectMobile() ? '70vw' : '22vw' }"
          ></v-text-field>

          <v-btn v-if="!showProgress" variant="tonal" @click="signIn">Sign In</v-btn>
          <v-progress-circular
            v-else
            indeterminate
            color="primary"
          />
        </v-col>
      </div>

      </v-main>
    </v-layout>

    <v-footer color="#363636">
      <v-container>
        <v-row>
          <v-col class="footer-text">
            <p>tsgo@jbnu.ac.kr</p>
            <p>337, College of Engineering Building 1, Jeonbuk National University, 567, Baekje-daero, Deokjin-gu, Jeonju-si, Jeonbuk State 54896 Republic of Korea</p>
            <p>&copy; 2022-2025 Jeonbuk National University Smart Biophotonics Lab. All rights reserved.</p>
            <p>Developed by <span :href="'https://github.com/h-ch22'">Changjin Ha</span></p>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<style>
v-main {
  min-height: 100vh;
}

v-footer {
  bottom: 0;
  position: sticky;
}

.home-btn:hover {
  cursor: pointer;
}

.menuBtn {
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  justify-content: center;
  transition-property: color;
  transition-duration: 0.8s;
  transition-timing-function: ease-in-out;
}

.menuBtn:hover {
  cursor: pointer;
}

.footer {
  background-color: '#363636';
}

.footer-text {
  font-size: 0.8em;
  color: lightgray;
}

.overlay-menu {
  position: fixed;
  top: 72px;
  right: 10px;
  width: 50vw;
  z-index: 2000;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.signin-menu {
  position: fixed;
  top: 72px;
  right: 10px;
  z-index: 2000;
  padding: 10px;
  display: flex;
  align-self: center;
}

.overlay-menu .menu-content {
  padding: 40px 20px 20px 40px;
  background: transparent;
  color: white;
  min-width: 250px;
}

</style>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useTheme } from 'vuetify'
import { useRouter } from 'vue-router'
import { auth } from './main'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'

const theme = useTheme()
const showMenu = ref(false)
const showSignIn = ref(false)
const isSignedIn = ref(false)
const showProgress = ref(false)
const router = useRouter()

const menuItems = ref([
  {
    href: 'awards',
    title: 'Awards',
    icon: 'fa-trophy'
  },
  {
    href: 'members',
    title: 'Members',
    icon: 'fa-user'
  },
  {
    href: 'news',
    title: 'News',
    icon: 'fa-newspaper'
  },
  {
    href: 'research',
    title: 'Research',
    icon: 'fa-magnifying-glass'
  },
  {
    href: 'lectures',
    title: 'Lectures',
    icon: 'fa-chalkboard-teacher'
  },
  {
    href: 'publications',
    title: 'Publications',
    icon: 'fa-file'
  },
  {
    href: 'gallery',
    title: 'Gallery',
    icon: 'fa-images'
  },
  {
    href: 'contact',
    title: 'Contact',
    icon: 'fa-phone'
  },
  {
    href: 'downloads',
    title: 'Downloads',
    icon: 'fa-download'
  }
])

const email = ref('')
const password = ref('')

function detectMobile () {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function switchTheme () {
  theme.toggle()
  localStorage.setItem('theme', theme.current.value.dark ? 'dark' : 'light')
}

function signIn () {
  if (email.value === '' || password.value === '') {
    alert('Please enter both email and password.')
    return
  }

  showProgress.value = true

  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      showSignIn.value = false
    })
    .catch((error: Error) => {
      alert(`An error occurred while processing sign in.\nPlease check your E-Mail and password, or try again later.\n(${error.message}`)
    })
    .finally(() => {
      showProgress.value = false
    })
}

function signOut () {
  if (confirm('Are you sure you want to sign out?')) {
    auth.signOut()
      .then(() => {
        alert('Signed out successfully.')
      })
      .catch((error: Error) => {
        alert(`An error occurred while processing sign out.\nPlease try again later.\n(${error.message})`)
      })
  }
}

watch(showMenu, (newVal) => {
  if (newVal) {
    showSignIn.value = false
  }
})

watch(showSignIn, (newVal) => {
  if (newVal) {
    showMenu.value = false
  }
})

onkeyup = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && showSignIn.value) {
    signIn()
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    isSignedIn.value = true
  } else {
    isSignedIn.value = false
  }
})

onMounted(() => {
  if (localStorage.getItem('theme') === 'dark' && !theme.current.value.dark) {
    switchTheme()
  } else if (localStorage.getItem('theme') === 'light' && theme.current.value.dark) {
    switchTheme()
  }
})

</script>
