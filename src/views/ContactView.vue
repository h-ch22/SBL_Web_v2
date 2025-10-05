<template>
<div style="top: 72px; margin-bottom: 72px; position: relative;">
  <v-container>
    <div>
      <div>
        <HeaderComponent
          :title="'Welcome to SBL'"
          :trailing-icon="'fa-solid fa-edit'"
        ></HeaderComponent>
      </div>

        <div
          :style="{
            width: '100vw',
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
              v-else
              class="mt-5"
              :style="{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100vw'
              }"
          >

          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import HeaderComponent from '@/components/HeaderComponent.vue'
import { firestore as db } from '@/main'
import { Contact } from '@/types/Contact'
import { getDoc, doc } from 'firebase/firestore'
import { onMounted, ref } from 'vue'

const contactItem = ref<Contact|undefined>(undefined)
const isLoading = ref(true)
const contactDocRef = doc(db, 'Contact', 'Introduction')

function getContact () {
  isLoading.value = true

  getDoc(contactDocRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        contactItem.value = data as Contact
      }
    })
    .catch((e: Error) => {
      console.log(e.message)
    })
    .finally(() => {
      isLoading.value = false
    })
}

onMounted(() => {
  getContact()
})
</script>
