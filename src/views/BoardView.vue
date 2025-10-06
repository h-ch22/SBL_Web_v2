<template>
<div style="top: 72px; margin-bottom: 72px; position: relative;">
  <v-container>
    <div :style="{
      minHeight: '100vh'
    }">
      <div>
        <HeaderComponent
          :title="getRouteName()"
          @on-click="router.push('/create-post')"
        ></HeaderComponent>
      </div>

      <v-text-field
        class="mt-5"
        v-model="searchText"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        color="primary"
        :style="{ maxWidth: '100vw' }"
      ></v-text-field>

      <div
          :style="{
              display: 'flex',
              flexDirection: 'row',
      }">
          <div
              v-if="isLoading"
              :style="{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100vw'
              }"
          >
              <v-progress-circular
                  indeterminate
                  color="primary"
              />
          </div>

          <div
              v-else-if="!isLoading && itemsList.length === 0"
              class="mt-5"
              :style="{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100vw'
              }
          ">
            <font-awesome-icon icon="fa-solid fa-xmark"/>
            {{ 'No items found' }}
          </div>

          <v-row v-else>
            <v-col class="mt-5" v-for="item in filteredList" :key="item.id">
                <div>
                  <v-card class="rounded-xl" variant="outlined">
                    <v-card-title
                      class="text-h4 font-weight-medium mt-2"
                    >
                      <v-img
                        v-if="item.image !== '' && item.image !== undefined && item.image !== null"
                        :src="item.image"
                        height="40vh"
                      />

                    <div :style="{ alignContent: 'center', width: '40vw', maxWidth: '100vw' }" class="text-h5 mt-2">
                        {{ item.title }}
                      </div>
                    </v-card-title>

                    <v-card-subtitle>
                      {{ item.date }}
                    </v-card-subtitle>

                    <v-card-text v-if="item.showContents">
                      <div class="font-weight-medium">{{ item.title }}</div>

                      <QuillEditor
                        class="mt-2"
                        v-model:content="item.contentsDelta"
                        :options="{ readOnly: true, theme: 'bubble', modules: { toolbar: false } }"/>
                    </v-card-text>

                    <v-card-actions>
                      <v-btn @click="item.showContents = !item.showContents" variant="text">
                        <font-awesome-icon
                          v-if="!item.showContents"
                          icon="fa-solid fa-chevron-down"
                        ></font-awesome-icon>
                        <font-awesome-icon
                          v-else
                          icon="fa-solid fa-chevron-up"
                        ></font-awesome-icon>
                      </v-btn>

                      <v-btn variant="text" :href="item.image">
                        <font-awesome-icon icon="fa-solid fa-expand"></font-awesome-icon>
                      </v-btn>

                      <v-btn v-if="isSignedIn" @click="router.push({
                          name: 'modifyPost',
                          state: {
                            post: {
                              id: item.id,
                              contents: item.contents,
                              title: item.title,
                              date: item.date,
                              category: getRouteName()
                            }
                          }
                        })">
                        <font-awesome-icon icon="fa-solid fa-edit"></font-awesome-icon>
                      </v-btn>

                      <v-btn v-if="isSignedIn" color="red" @click="deleteItem(item)">
                        <font-awesome-icon icon="fa-solid fa-trash"></font-awesome-icon>
                      </v-btn>
                    </v-card-actions>
                </v-card>
              </div>
            </v-col>
          </v-row>
      </div>
    </div>
  </v-container>
</div>
</template>

<script lang="ts" setup>
import HeaderComponent from '@/components/HeaderComponent.vue'
import { firestore as db, auth, storage } from '@/main'
import { CommonBoardItem } from '@/types/CommonBoardItem'
import { Delta, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.bubble.css'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, query, orderBy, Query, deleteDoc, doc } from 'firebase/firestore'
import { ref as storageRef, deleteObject } from 'firebase/storage'
import { onMounted, ref, watch } from 'vue'
import { RouteLocationNormalizedLoadedGeneric, useRouter } from 'vue-router'

const router = useRouter()
const itemsList = ref<CommonBoardItem[]>([])
const filteredList = ref<CommonBoardItem[]>([])
const isLoading = ref(true)
const searchText = ref('')
const isSignedIn = ref(false)
let itemsQuery: Query | undefined

function getRouteName (newRoute: RouteLocationNormalizedLoadedGeneric | undefined = undefined) {
  switch (newRoute ? newRoute.path : router.currentRoute.value.path) {
    case '/awards':
      return 'Awards'
    case '/news':
      return 'News'
    case '/gallery':
      return 'Gallery'
    default:
      return 'Awards'
  }
}

function setQuery () {
  switch (router.currentRoute.value.path) {
    case '/awards':
      itemsQuery = query(collection(db, 'Awards'), orderBy('date', 'desc'))
      break
    case '/news':
      itemsQuery = query(collection(db, 'News'), orderBy('date', 'desc'))
      break
    case '/gallery':
      itemsQuery = query(collection(db, 'Gallery'), orderBy('date', 'desc'))
      break
    default:
      itemsQuery = query(collection(db, 'Awards'), orderBy('date', 'desc'))
      break
  }
}

function getItems () {
  setQuery()
  isLoading.value = true
  itemsList.value = []

  if (itemsQuery) {
    getDocs(itemsQuery)
      .then((querySnapshot) => {
        itemsList.value = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as CommonBoardItem),
          id: doc.id,
          contentsDelta: doc.data().contents === '' || doc.data().contents === undefined ? undefined : new Delta(JSON.parse(doc.data().contents || '{}')),
          showContents: false
        }))

        filteredList.value = itemsList.value
      })
      .catch((error: Error) => {
        console.log(error.message)
      })
      .finally(() => {
        isLoading.value = false
      })
  }
}

function deleteItem (item: CommonBoardItem) {
  if (confirm(`Are you sure you want to delete post ${item.title}?\nThis action cannot be undone.`)) {
    isLoading.value = true
    deleteDoc(doc(db, getRouteName(), item.id as string))
      .then(() => {
        if (item.image !== '' && item.image !== undefined && item.image !== null) {
          deleteObject(storageRef(storage, `${getRouteName().toLowerCase()}/img/${item.id}.${item.image.split('.').pop()?.split('?')[0]}`))
            .catch((e: Error) => {
              alert(`An error occurred while deleting image.\nPlease try again later.\n(${e.message})`)
            })
            .finally(() => {
              alert('Post deleted successfully.')
              itemsList.value = itemsList.value.filter(i => i.id !== item.id)
              isLoading.value = false
            })
        } else {
          alert('Post deleted successfully.')
          itemsList.value = itemsList.value.filter(i => i.id !== item.id)
          isLoading.value = false
        }
      })
      .catch((e: Error) => {
        alert(`An error occurred while deleting post.\nPlease try again later.\n(${e.message})`)
        isLoading.value = false
      })
  }
}

onMounted(() => {
  getItems()
})

onAuthStateChanged(auth, () => {
  isSignedIn.value = auth.currentUser !== null
})

watch(router.currentRoute, () => {
  getItems()
})

watch(searchText, () => {
  if (searchText.value === '') {
    filteredList.value = itemsList.value
  } else {
    filteredList.value = itemsList.value.filter(item => item.title.toLowerCase().includes(searchText.value.toLowerCase()) || (item.contents !== undefined && item.contents.toLowerCase().includes(searchText.value.toLowerCase())))
  }
})
</script>
