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

      <HomeBoardListItem
        :itemList="newsList"
        @on:itemClick="onItemClick"
      ></HomeBoardListItem>

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
        <div class="mb-2" :style="{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
        }">
          <div class="ml-2 pub-title">
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
      >SBL MOMENT</div>

      <HomeBoardListItem
        :itemList="galleryList"
        @on:itemClick="onItemClick"
      ></HomeBoardListItem>

      <div class="center-aligned-div mt-2">
        <v-btn variant="tonal" @click="router.push('/gallery')">Show All</v-btn>
      </div>

      <div
        class="text-h5 font-weight-bold center-aligned-div mt-6 mb-2"
        :style="{
          color: theme.current.value.colors.primary
        }"
      >CONTACT
      </div>

      <HomeContactItem v-if="phone !== ''"
        :icon="'fa-solid fa-phone'"
        :label="phone"
        @on:click="call" />

      <HomeContactItem v-if="email !== ''"
        :icon="'fa-solid fa-envelope'"
        :label="email"
        @on:click="mailTo" />

      <HomeContactItem v-if="address !== ''"
        :icon="'fa-solid fa-location-pin'"
        :label="address"
        @on:click="openMap" />

      <div class="center-aligned-div mt-2" @click="router.push('/contact')">
        <v-btn variant="tonal">Details</v-btn>
      </div>

    </v-container>
  </div>

  <v-dialog v-if="showWindow && selectedItem !== undefined" v-model="showWindow" :style="{ backdropFilter: 'blur(5px)' }">
    <BoardItemModal
      :selected-item="selectedItem"
      @on:close="onCloseWindow"
      @on:update="modifyItem"
      @on:delete="deleteItem" />
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

.pub-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
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
import { Delta } from '@vueup/vue-quill'
import { onAuthStateChanged } from 'firebase/auth'
import { CommonBoardItem } from '@/types/CommonBoardItem'

import '@vueup/vue-quill/dist/vue-quill.bubble.css'
import router from '@/router'
import HomeBoardListItem from '@/components/home/HomeBoardListItem.vue'
import BoardItemModal from '@/components/board/BoardItemModal.vue'
import HomeContactItem from '@/components/home/HomeContactItem.vue'

const theme = useTheme()

const isPlaying = ref(true)
const isSignedIn = ref(false)
const showWindow = ref(false)
const isLoading = ref(false)

const selectedItem = ref<CommonBoardItem | undefined>(undefined)

const newsQuery = query(collection(db, 'News'), orderBy('date', 'desc'), limit(5))
const publicationsQuery = query(collection(db, 'Publications'), orderBy('year', 'desc'), limit(5))
const galleryQuery = query(collection(db, 'Gallery'), orderBy('date', 'desc'), limit(5))
const contactRef = doc(db, 'Contact', 'Introduction')

const newsList = ref<CommonBoardItem[]>([])
const galleryList = ref<CommonBoardItem[]>([])
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
        showContents: false,
        category: 'News'
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

  getDocs(galleryQuery)
    .then((docs) => {
      galleryList.value = docs.docs.map((doc) => ({
        ...(doc.data() as CommonBoardItem),
        id: doc.id,
        contentsDelta: doc.data().contents === '' || doc.data().contents === undefined ? undefined : new Delta(JSON.parse(doc.data().contents || '{}')),
        showContents: false,
        category: 'Gallery'
      }))
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

function onItemClick (item: CommonBoardItem) {
  selectedItem.value = item
  showWindow.value = true
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

function onCloseWindow () {
  selectedItem.value = undefined
  showWindow.value = false
}

function modifyItem (item: CommonBoardItem) {
  showWindow.value = false
  router.push({
    name: 'modifyPost',
    state: {
      post: {
        id: item.id,
        contents: item.contents,
        title: item.title,
        date: item.date,
        category: item.category
      }
    }
  })
}

function deleteItem (item: CommonBoardItem) {
  if (confirm(`Are you sure you want to delete post ${item.title}?\nThis action cannot be undone.`)) {
    showWindow.value = false
    isLoading.value = true
    deleteDoc(doc(db, item.category, item.id as string))
      .then(() => {
        if (item.image !== '' && item.image !== undefined && item.image !== null) {
          deleteObject(storageRef(storage, `${item.category.toLowerCase()}/img/${item.id}.${item.image.split('.').pop()?.split('?')[0]}`))
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
    selectedItem.value = undefined
  }
})
</script>
