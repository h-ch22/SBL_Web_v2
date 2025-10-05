<template>
<div style="top: 72px; margin-bottom: 72px; position: relative;">
  <v-container>
    <div>
      <div>
        <HeaderComponent
          :title="getRouteName()"
        ></HeaderComponent>
      </div>

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
              <v-col class="mt-5" v-for="item in itemsList" :key="item.id">
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

                      <v-card-text v-if="item.showContents">
                        <div class="font-weight-medium">{{ item.title }}</div>
                        <div v-html="item.contents.replace(/\r?\n/g, '<br>')"></div>
                      </v-card-text>

                      <v-card-subtitle>
                        {{ item.date }}
                      </v-card-subtitle>

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

                        <v-btn variant="text">
                          <font-awesome-icon icon="fa-solid fa-expand"></font-awesome-icon>
                        </v-btn>

                        <v-btn v-if="auth.currentUser !== null">
                          <font-awesome-icon icon="fa-solid fa-edit"></font-awesome-icon>
                        </v-btn>

                        <v-btn v-if="auth.currentUser !== null" color="red">
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
import { firestore as db, auth } from '@/main'
import { CommonBoardItem } from '@/types/CommonBoardItem'
import { collection, getDocs, query, orderBy, Query } from 'firebase/firestore'
import { onMounted, ref, watch } from 'vue'
import { RouteLocationNormalizedLoadedGeneric, useRouter } from 'vue-router'

const router = useRouter()
const itemsList = ref<CommonBoardItem[]>([])
const isLoading = ref(true)
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
          showContents: false
        }))
      })
      .catch((error: Error) => {
        console.log(error.message)
      })
      .finally(() => {
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
</script>
