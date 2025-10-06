<template>
  <div>
    <div id="banner-section">
      <video
        id="banner-video"
        :src="require('@/assets/Intro_Banner.mp4')"
        autoplay
        loop
        muted
        controls="false"
        playsinline="true"
        controlslist="nodownload nofullscreen noremoteplayback"
        webkit-playsinline
        ></video>

      <v-btn
        id="play-pause-button"
        @click="togglePlayPause"
        variant="text"
        color="white"
      >
        <font-awesome-icon
          v-if="isPlaying"
          icon="fa-solid fa-pause-circle"
        ></font-awesome-icon>

        <font-awesome-icon
          v-else
          icon="fa-solid fa-play-circle"
        ></font-awesome-icon>
      </v-btn>
    </div>

    <v-container class="mt-2">
      <div
        class="text-h5 font-weight-bold center-aligned-div mb-2"
        :style="{
          color: theme.current.value.colors.primary
        }"
      >SBL TODAY</div>

      <div class="news-scroll-row">
        <div v-for="news in newsList" :key="news.id">
          <v-card class="ml-3 mt-2 pa-2 rounded-xl" variant="outlined" :style="{ width: '250px' }">
            <v-card-title>
              <v-img
                :src="news.image"
                width="200px"
                height="300px"/>

                {{ news.title }}
            </v-card-title>
            <v-card-subtitle> {{ news.date }} </v-card-subtitle>
          </v-card>
        </div>
      </div>

      <div class="center-aligned-div mt-2">
        <v-btn variant="tonal" @click="router.push('/news')">Show All</v-btn>
      </div>

      <div
        class="text-h5 font-weight-bold center-aligned-div mt-6 mb-2"
        :style="{
          color: theme.current.value.colors.primary
        }"
      >LATEST PUBLICATIONS
      </div>

      <div v-for="pub in publicationList" :key="pub.id">
        <div class="mb-2" :style="{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }">
          <div class="ml-2">
            {{ pub.contents }}
          </div>

          <v-btn variant="text" :href="pub.link">
            <font-awesome-icon icon="fa-solid fa-link" class="mr-1"/>
          </v-btn>
        </div>
      </div>

      <div class="center-aligned-div mt-2" @click="router.push('/publications')">
        <v-btn variant="tonal">Show All</v-btn>
      </div>

      <div
        class="text-h5 font-weight-bold center-aligned-div mt-6 mb-2"
        :style="{
          color: theme.current.value.colors.primary
        }"
      >CONTACT
      </div>

      <div v-if="phone !== ''" class="mb-2" :style="{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }">
        <div :style="{ display: 'flex', flexDirection: 'row', alignContent: 'flex-start', alignItems: 'center' }">
          <font-awesome-icon icon="fa-solid fa-phone"/>
          <div class="ml-2">
            {{ phone }}
          </div>
        </div>

        <v-btn variant="text" @click="call">
          <font-awesome-icon icon="fa-solid fa-phone" class="mr-1"/>
        </v-btn>
      </div>

      <div v-if="email !== ''" class="mb-2" :style="{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }">
        <div :style="{ display: 'flex', flexDirection: 'row', alignContent: 'flex-start', alignItems: 'center' }">
          <font-awesome-icon icon="fa-solid fa-envelope"/>
          <div class="ml-2">
            {{ email }}
          </div>
        </div>

        <v-btn variant="text" @click="mailTo">
          <font-awesome-icon icon="fa-solid fa-envelope" class="mr-1"/>
        </v-btn>
      </div>

      <div v-if="address !== ''" class="mb-2" :style="{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }">
        <div :style="{ display: 'flex', flexDirection: 'row', alignContent: 'flex-start', alignItems: 'center' }">
          <font-awesome-icon icon="fa-solid fa-location-pin"/>
          <div class="ml-2">
            {{ address }}
          </div>
        </div>

        <v-btn variant="text">
          <font-awesome-icon icon="fa-solid fa-location-pin" class="mr-1"/>
        </v-btn>
      </div>

      <div class="center-aligned-div mt-2" @click="router.push('/contact')">
        <v-btn variant="tonal">Details</v-btn>
      </div>

    </v-container>
  </div>

</template>

<style>
video::-webkit-media-controls {
  display: none !important;
  opacity: 0;
}

video::-webkit-media-controls-start-playback-button {
  display: none !important;
}

#banner-section {
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
}

#banner-section video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.9);
}

#play-pause-button {
  width: 30px;
  height: 30px;
  position: absolute;
  left: 50%;
  top: 75vh;
  transform: translateX(-50%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
}

.news-scroll-row {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;
}

.center-aligned-div {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<script setup lang="ts">
import { collection, doc, DocumentSnapshot, getDocs, getDoc, limit, orderBy, query } from 'firebase/firestore'
import { ref, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { firestore as db } from '@/main'
import { News } from '@/types/News'
import { Publication } from '@/types/Publication'
import router from '@/router'
const theme = useTheme()

const isPlaying = ref(true)

let videoElement: HTMLVideoElement | null = null
const newsQuery = query(collection(db, 'News'), orderBy('date', 'desc'), limit(5))
const publicationsQuery = query(collection(db, 'Publications'), orderBy('year', 'desc'), limit(5))
const contactRef = doc(db, 'Contact', 'Introduction')

const newsList = ref<News[]>([])
const publicationList = ref<Publication[]>([])
const phone = ref('')
const email = ref('')
const address = ref('')

onMounted(() => {
  videoElement = document.getElementById('banner-video') as HTMLVideoElement
  if (videoElement) {
    videoElement.addEventListener('play', () => { isPlaying.value = true })
    videoElement.addEventListener('pause', () => { isPlaying.value = false })
  }

  getDocs(newsQuery)
    .then((docs) => {
      docs.forEach((doc) => {
        newsList.value.push({
          id: doc.id,
          contents: doc.data().contents,
          date: doc.data().date,
          image: doc.data().image,
          title: doc.data().title
        })
      })
    })
    .catch((e: Error) => {
      console.log(e.message)
    })

  getDocs(publicationsQuery)
    .then((docs) => {
      docs.forEach((doc) => {
        publicationList.value.push({
          id: doc.id,
          contents: doc.data().contents,
          link: doc.data().link,
          type: doc.data().type,
          year: doc.data().year
        })
      })
    })
    .catch((e: Error) => {
      console.log(e.message)
    })

  getDoc(contactRef)
    .then((doc: DocumentSnapshot) => {
      if (doc.exists()) {
        const data = doc.data()
        phone.value = data.tel
        email.value = data.email
        address.value = data.address
      }
    })
    .catch((e: Error) => {
      console.log(e.message)
    })
})

function togglePlayPause () {
  if (!videoElement) return
  if (videoElement.paused) {
    videoElement.play()
  } else {
    videoElement.pause()
  }
}

function call () {
  document.location.href = `tel:${phone.value}`
}

function mailTo () {
  document.location.href = `mailto:${email.value}`
}
</script>
