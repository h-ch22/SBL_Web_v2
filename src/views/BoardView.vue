<template>
<div class="container">
  <v-container>
    <div class="global-container">
      <div>
        <HeaderComponent
          :title="getRouteName()"
          :show-secondary-trailing-btn="true"
          :secondary-trailing-icon="isExpandedAll() ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          @on-click="router.push('/create-post')"
          @on-secondary-btn-click="expandAll()"
        ></HeaderComponent>
      </div>

      <v-text-field
        class="mt-5 search-bar"
        v-model="searchText"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        color="primary"
        clear-icon="mdi-close"
        clearable
        @click:clear="searchText = ''"
      ></v-text-field>

      <div class="contents-container">
          <CommonProgress v-if="isLoading" />

          <div
              v-else-if="!isLoading && filteredList.length === 0"
              class="mt-5 no-items-container"
          >
            <font-awesome-icon icon="fa-solid fa-xmark"/>
            {{ 'No items found' }}
          </div>

          <v-row v-else>
            <v-col xs="12" sm="12" md="6" lg="4" xl="3" xxl="3" class="mt-5" v-for="item in filteredList" :key="item.id">
                <div>
                  <v-card class="rounded-xl" variant="outlined">
                    <v-card-title
                      class="text-h4 font-weight-medium mt-2 rounded-xl item-title-container"
                    >
                      <v-img
                        v-if="item.image !== '' && item.image !== undefined && item.image !== null"
                        :src="item.image"
                        height="40vh"
                      />

                    <div class="text-h5 mt-2 title-container">
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

                      <v-btn variant="text" @click="{
                        selectedItem = item;
                        showWindow = true;
                      }">
                        <font-awesome-icon icon="fa-solid fa-window-maximize"></font-awesome-icon>
                      </v-btn>

                      <v-btn variant="text" :href="item.image">
                        <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square"></font-awesome-icon>
                      </v-btn>

                      <v-btn v-if="isSignedIn && isAdmin" @click="router.push({
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

                      <v-btn v-if="isSignedIn && isAdmin" color="red" @click="deleteItem(item)">
                        <font-awesome-icon icon="fa-solid fa-trash"></font-awesome-icon>
                      </v-btn>
                    </v-card-actions>
                </v-card>
              </div>
            </v-col>
          </v-row>
      </div>
    </div>

    <v-dialog v-if="showWindow && selectedItem !== null" v-model="showWindow" :style="{ backdropFilter: 'blur(5px)' }">
      <BoardItemModal
        :selected-item="selectedItem"
        :is-signed-in="isSignedIn"
        :is-admin="isAdmin"
        @on:close="showWindow = false"
        @on:update="onModifyItem"
        @on:delete="deleteItem" />
    </v-dialog>
  </v-container>
</div>
</template>

<script lang="ts" setup>
import '@vueup/vue-quill/dist/vue-quill.bubble.css'
import '@/styles/global.scss'
import HeaderComponent from '@/components/home/HeaderComponent.vue'
import { firestore as db, storage } from '@/main'
import { CommonBoardItem } from '@/types/CommonBoardItem'
import { Delta, QuillEditor } from '@vueup/vue-quill'
import { collection, getDocs, query, orderBy, Query, deleteDoc, doc } from 'firebase/firestore'
import { ref as storageRef, deleteObject } from 'firebase/storage'
import { onMounted, ref, watch } from 'vue'
import { RouteLocationNormalizedLoadedGeneric, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStateStore'
import { storeToRefs } from 'pinia'
import BoardItemModal from '@/components/board/BoardItemModal.vue'
import CommonProgress from '@/components/common/CommonProgress.vue'

const router = useRouter()
const itemsList = ref<CommonBoardItem[]>([])
const filteredList = ref<CommonBoardItem[]>([])
const isLoading = ref(true)
const searchText = ref('')
const { isSignedIn, isAdmin } = storeToRefs(useAuthStore())
const selectedItem = ref<CommonBoardItem | null>(null)
const showWindow = ref(false)

let itemsQuery: Query | undefined

function isExpandedAll () {
  return filteredList.value.every(item => item.showContents)
}

function expandAll () {
  const expand = !isExpandedAll()
  filteredList.value.forEach(item => {
    item.showContents = expand
  })
}

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
          showContents: false,
          category: getRouteName()
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

function onModifyItem (item: CommonBoardItem) {
  showWindow.value = false
  router.push({
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
  })
}

function deleteItem (item: CommonBoardItem) {
  if (confirm(`Are you sure you want to delete post ${item.title}?\nThis action cannot be undone.`)) {
    showWindow.value = false
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
              filteredList.value = filteredList.value.filter(i => i.id !== item.id)
              isLoading.value = false
            })
        } else {
          alert('Post deleted successfully.')
          itemsList.value = itemsList.value.filter(i => i.id !== item.id)
          filteredList.value = filteredList.value.filter(i => i.id !== item.id)
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

watch(showWindow, () => {
  if (!showWindow.value) {
    selectedItem.value = null
  }
})
</script>
