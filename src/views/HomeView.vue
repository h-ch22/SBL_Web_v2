<template>
  <div>
    <div id="banner-section">
      <video
        v-if="bannerURL !== '' && bannerType === 'Video'"
        id="banner-video"
        :src="bannerURL"
        autoplay
        loop
        muted
        controls="false"
        playsinline="true"
        controlslist="nodownload nofullscreen noremoteplayback"
        webkit-playsinline
        ></video>

      <v-img v-else-if="bannerURL !== '' && bannerType === 'Image'" :src="bannerURL" id="banner-video" />

      <v-progress-linear v-else indeterminate color="primary" :height="1"/>

      <v-btn
        v-if="bannerURL !== '' && bannerType === 'Video'"
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

              <div class="news-title" @click="
                selectedNews = news,
                showWindow = true
              ">
                {{ news.title }}
              </div>
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

        <v-btn variant="text" @click="openMap">
          <font-awesome-icon icon="fa-solid fa-location-pin" class="mr-1"/>
        </v-btn>
      </div>

      <div class="center-aligned-div mt-2" @click="router.push('/contact')">
        <v-btn variant="tonal">Details</v-btn>
      </div>

    </v-container>
  </div>

  <v-dialog v-if="showWindow && selectedNews !== undefined" v-model="showWindow" :style="{ backdropFilter: 'blur(5px)' }">
    <v-card class="pa-5">
      <v-card-title class="rounded-xl" style="word-break: break-word; white-space: pre-wrap; position: sticky; top: 0; background-color: transparent; z-index: 1000;">
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <div class="rounded-xl pa-2" style="max-width: 70%; word-break: break-word; white-space: pre-wrap; backdrop-filter: blur(5px);">
            {{ selectedNews.title }}
          </div>
          <v-btn style="margin-left: 16px; flex-shrink: 0;" color="red" variant="tonal" @click="selectedNews = undefined; showWindow = false;">
            <font-awesome-icon icon="fa-solid fa-xmark"/>
          </v-btn>
        </div>
      </v-card-title>

      <v-card-subtitle>
        {{ selectedNews.date }}
      </v-card-subtitle>

      <v-card-text>
        <div v-if="selectedNews.image !== '' && selectedNews.image !== undefined && selectedNews.image !== null">
          <v-img
            :src="selectedNews.image"
            height="40vh"
          />
        </div>

        <QuillEditor
          class="mt-2"
          v-model:content=" selectedNews.contentsDelta"
          :options="{ readOnly: true, theme: 'bubble', modules: { toolbar: false } }"/>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn v-if="isSignedIn" @click="{
          showWindow = false;
          router.push({
            name: 'modifyPost',
            state: {
              post: {
                id: selectedNews.id,
                contents: selectedNews.contents,
                title: selectedNews.title,
                date: selectedNews.date,
                category: 'News'
              }
            }
          });
        }">
          <font-awesome-icon icon="fa-solid fa-edit"></font-awesome-icon>
        </v-btn>

        <v-btn v-if="isSignedIn" color="red" @click="deleteItem(selectedNews)">
          <font-awesome-icon icon="fa-solid fa-trash"></font-awesome-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<style>
#banner-video::-webkit-media-controls {
  display: none !important;
  opacity: 0;
}

#banner-video::-webkit-media-controls-start-playback-button {
  display: none !important;
}

#banner-section {
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
}

#banner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.9);
  pointer-events: none;
}

#play-pause-button {
  width: 30px;
  height: 30px;
  position: absolute;
  left: 50%;
  top: 85vh;
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

.news-title:hover{
  text-decoration: underline;
  cursor: pointer;
}

.center-aligned-div {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<script setup lang="ts">
import { collection, doc, DocumentSnapshot, getDocs, getDoc, limit, orderBy, query, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, getDownloadURL, deleteObject } from 'firebase/storage'
import { ref, onMounted, watch } from 'vue'
import { useTheme } from 'vuetify'
import { firestore as db, storage, auth } from '@/main'
import { Publication } from '@/types/Publication'
import { Delta, QuillEditor } from '@vueup/vue-quill'
import { onAuthStateChanged } from 'firebase/auth'
import { CommonBoardItem } from '@/types/CommonBoardItem'

import '@vueup/vue-quill/dist/vue-quill.bubble.css'
import router from '@/router'

const theme = useTheme()

const isPlaying = ref(true)
const isSignedIn = ref(false)
const showWindow = ref(false)
const isLoading = ref(false)

const selectedNews = ref<CommonBoardItem | undefined>(undefined)

const newsQuery = query(collection(db, 'News'), orderBy('date', 'desc'), limit(5))
const publicationsQuery = query(collection(db, 'Publications'), orderBy('year', 'desc'), limit(5))
const contactRef = doc(db, 'Contact', 'Introduction')

const newsList = ref<CommonBoardItem[]>([])
const publicationList = ref<Publication[]>([])
const phone = ref('')
const email = ref('')
const address = ref('')
const bannerURL = ref('')
const bannerType = ref<'Image' | 'Video'>('Video')

onMounted(() => {
  getDoc(doc(db, 'Banner', 'Contents'))
    .then((doc: DocumentSnapshot) => {
      if (doc.exists()) {
        const data = doc.data()
        bannerType.value = data.type

        getDownloadURL(storageRef(storage, `banner/${data.fileName}`))
          .then((url) => {
            bannerURL.value = url
          })
          .catch((e: Error) => {
            console.log(e.message)
          })
      }
    })
    .catch((e: Error) => {
      console.log(e.message)
    })

  getDocs(newsQuery)
    .then((docs) => {
      newsList.value = docs.docs.map((doc) => ({
        ...(doc.data() as CommonBoardItem),
        id: doc.id,
        contentsDelta: doc.data().contents === '' || doc.data().contents === undefined ? undefined : new Delta(JSON.parse(doc.data().contents || '{}')),
        showContents: false
      }))
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
  const videoElement = document.getElementById('banner-video') as HTMLVideoElement
  if (videoElement) {
    videoElement.addEventListener('play', () => { isPlaying.value = true })
    videoElement.addEventListener('pause', () => { isPlaying.value = false })
  }

  if (!videoElement) return
  if (videoElement.paused) {
    videoElement.play()
  } else {
    videoElement.pause()
  }

  videoElement.removeEventListener('play', () => { isPlaying.value = true })
  videoElement.removeEventListener('pause', () => { isPlaying.value = false })
}

function call () {
  document.location.href = `tel:${phone.value}`
}

function mailTo () {
  document.location.href = `mailto:${email.value}`
}

function openMap () {
  const query = encodeURIComponent(address.value)
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
}

function deleteItem (item: CommonBoardItem) {
  if (confirm(`Are you sure you want to delete post ${item.title}?\nThis action cannot be undone.`)) {
    showWindow.value = false
    isLoading.value = true
    deleteDoc(doc(db, 'News', item.id as string))
      .then(() => {
        if (item.image !== '' && item.image !== undefined && item.image !== null) {
          deleteObject(storageRef(storage, `news/img/${item.id}.${item.image.split('.').pop()?.split('?')[0]}`))
            .catch((e: Error) => {
              alert(`An error occurred while deleting image.\nPlease try again later.\n(${e.message})`)
            })
            .finally(() => {
              alert('Post deleted successfully.')
              newsList.value = newsList.value.filter(i => i.id !== item.id)
              isLoading.value = false
            })
        } else {
          alert('Post deleted successfully.')
          newsList.value = newsList.value.filter(i => i.id !== item.id)
          isLoading.value = false
        }
      })
      .catch((e: Error) => {
        alert(`An error occurred while deleting post.\nPlease try again later.\n(${e.message})`)
        isLoading.value = false
      })
  }
}

onAuthStateChanged(auth, () => {
  isSignedIn.value = auth.currentUser !== null
})

watch(showWindow, () => {
  if (!showWindow.value) {
    selectedNews.value = undefined
  }
})
</script>
