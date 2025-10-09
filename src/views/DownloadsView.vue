<template>
<div style="top: 72px; margin-bottom: 72px; position: relative;">
  <v-container>
    <div :style="{
      minHeight: '100vh'
    }">
      <div>
        <HeaderComponent
          :title="'Downloads'"
          :show-secondary-trailing-btn="true"
          :secondary-trailing-icon="isExpandedAll() ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          @on-click="router.push('/create-post')"
          @on-secondary-btn-click="expandAll()"
        ></HeaderComponent>
      </div>

      <v-text-field
        class="mt-5"
        v-model="searchText"
        label="Search Downloads"
        color="primary"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        :style="{ maxWidth: '100vw' }"
        clear-icon="mdi-close"
        clearable
        @click:clear="searchText = ''"
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

        <div v-else-if="!isLoading && filteredList.length === 0" class="mt-5">
          <font-awesome-icon icon="fa-solid fa-xmark"/>
          {{ 'No posts found' }}
        </div>

        <v-row v-else>
          <v-col class="mt-5" v-for="item in filteredList" :key="item.id">
              <div>
                <v-card class="rounded-xl" variant="outlined">
                  <v-card-title
                    class="text-h4 font-weight-medium mt-2"
                    style="word-break: break-word; white-space: normal;"
                  >
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

                    <v-btn class="mt-2" variant="tonal" :href="item.file" style="text-transform: unset;">
                      <font-awesome-icon icon="fa-solid fa-download"></font-awesome-icon>
                      {{ decodeURIComponent(item.file.split('%2F').pop()?.split('?')[0] ?? 'Download') }}
                    </v-btn>
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

                    <v-btn v-if="isSignedIn" @click="router.push({
                        name: 'modifyPost',
                        state: {
                          post: {
                            id: item.id,
                            contents: item.contents,
                            title: item.title,
                            date: item.date,
                            category: 'Downloads'
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

      <v-dialog v-if="showWindow && selectedItem !== null" v-model="showWindow" :style="{ backdropFilter: 'blur(5px)' }">
        <v-card class="pa-5">
          <v-card-title class="rounded-xl" style="word-break: break-word; white-space: pre-wrap; position: sticky; top: 0; background-color: transparent; backdrop-filter: blur(5px); z-index: 1000;">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div style="max-width: 70%; word-break: break-word; white-space: pre-wrap;">
                {{ selectedItem.title }}
              </div>
              <v-btn style="margin-left: 16px; flex-shrink: 0;" variant="text" @click="selectedItem = null; showWindow = false;">
                <font-awesome-icon icon="fa-solid fa-xmark"/>
              </v-btn>
            </div>
          </v-card-title>

          <v-card-subtitle>
            {{ selectedItem.date }}
          </v-card-subtitle>

          <v-card-text>
            <QuillEditor
              class="mt-2"
              v-model:content="selectedItem.contentsDelta"
              :options="{ readOnly: true, theme: 'bubble', modules: { toolbar: false } }"/>

            <v-btn class="mt-2" variant="tonal" :href="selectedItem.file" style="text-transform: unset;">
              <font-awesome-icon icon="fa-solid fa-download"></font-awesome-icon>
              {{ decodeURIComponent(selectedItem.file.split('%2F').pop()?.split('?')[0] ?? 'Download') }}
            </v-btn>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn v-if="isSignedIn" @click="{
              showWindow = false;
              router.push({
                name: 'modifyPost',
                state: {
                  post: {
                    id: selectedItem.id,
                    contents: selectedItem.contents,
                    title: selectedItem.title,
                    date: selectedItem.date,
                    category: 'Downloads'
                  }
                }
              });
            }">
              <font-awesome-icon icon="fa-solid fa-edit"></font-awesome-icon>
            </v-btn>

            <v-btn v-if="isSignedIn" color="red" @click="deleteItem(selectedItem)">
              <font-awesome-icon icon="fa-solid fa-trash"></font-awesome-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import HeaderComponent from '@/components/HeaderComponent.vue'
import { firestore as db, auth, storage } from '@/main'
import { Download } from '@/types/Download'
import { useRouter } from 'vue-router'
import { deleteDoc, doc, getDocs, query, orderBy, collection } from 'firebase/firestore'
import { ref as storageRef, deleteObject } from 'firebase/storage'
import { onMounted, ref, watch } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { Delta } from '@vueup/vue-quill'

const router = useRouter()
const isLoading = ref(true)
const searchText = ref('')
const downloadsList = ref<Download[]>([])
const filteredList = ref<Download[]>([])
const isSignedIn = ref(false)
const selectedItem = ref<Download | null>(null)
const showWindow = ref(false)

function isExpandedAll () {
  return filteredList.value.every(item => item.showContents)
}

function expandAll () {
  const expand = !isExpandedAll()
  filteredList.value.forEach(item => {
    item.showContents = expand
  })
}

function deleteItem (item: Download) {
  if (confirm(`Are you sure you want to delete post ${item.title}?\nThis action cannot be undone.`)) {
    showWindow.value = false
    isLoading.value = true

    deleteDoc(doc(db, 'Downloads', item.id as string))
      .then(() => {
        if (item.file !== '' && item.file !== undefined && item.file !== null) {
          deleteObject(storageRef(storage, `downloads/${item.file.split('downloads%2F').pop()?.split('?')[0]}`))
            .catch((e: Error) => {
              alert(`An error occurred while deleting file.\nPlease try again later.\n(${e.message})`)
            })
            .finally(() => {
              alert('Post deleted successfully.')
              downloadsList.value = downloadsList.value.filter(i => i.id !== item.id)
              filteredList.value = filteredList.value.filter(i => i.id !== item.id)
              isLoading.value = false
            })
        } else {
          alert('Post deleted successfully.')
          downloadsList.value = downloadsList.value.filter(i => i.id !== item.id)
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
  getDocs(query(collection(db, 'Downloads'), orderBy('date', 'desc')))
    .then((querySnapshot) => {
      downloadsList.value = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Download),
        id: doc.id,
        contentsDelta: doc.data().contents === '' || doc.data().contents === undefined ? undefined : new Delta(JSON.parse(doc.data().contents || '{}')),
        showContents: false
      }))

      filteredList.value = downloadsList.value
    })
    .catch((e: Error) => {
      console.log(e.message)
    })
    .finally(() => {
      isLoading.value = false
    })
})

onAuthStateChanged(auth, () => {
  isSignedIn.value = auth.currentUser !== null
})

watch(searchText, () => {
  if (searchText.value === '') {
    filteredList.value = downloadsList.value
  } else {
    filteredList.value = downloadsList.value.filter(download => download.title.toLowerCase().includes(searchText.value.toLowerCase()) || (download.contents !== undefined && download.contents.toLowerCase().includes(searchText.value.toLowerCase())))
  }
})

watch(showWindow, () => {
  if (!showWindow.value) {
    selectedItem.value = null
  }
})
</script>
