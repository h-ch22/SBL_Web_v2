<template>
<div class="container">
  <v-container>
    <div class="global-container">
      <div>
        <HeaderComponent
          :title="'Welcome to SBL'"
          :trailing-icon="'fa-solid fa-edit'"
          @on-click="router.push({
            name: 'modifyContact',
            state: {
              data: {
                address: contactItem?.address ?? '',
                contents: contactItem?.contents ?? '',
                email: contactItem?.email ?? '',
                latLng: contactItem?.latLng ?? '',
                tel: contactItem?.tel ?? ''
              }
            }
          })"
        ></HeaderComponent>
      </div>
      <div class="contents-container">
        <CommonProgress v-if="isLoading" />

        <div
            v-else
            class="mt-5 contact-container"
        >
            <v-img :src="contactItem?.image" width="100%" max-width="100%"/>

            <QuillEditor
              v-if="contactItem?.contentsDelta"
              class="mt-2"
              v-model:content="contactItem.contentsDelta"
              :options="{ readOnly: true, theme: 'bubble', modules: { toolbar: false } }"/>

            <v-row class="my-2">
              <v-btn
                v-if="contactItem?.tel !== ''"
                class="mt-2 mr-2 action"
                variant="outlined"
                @click="copyToClipboard('tel')"
              >
                {{ isPhoneCopied ? 'Copied!' : contactItem?.tel }}
                <font-awesome-icon v-if="!isPhoneCopied" icon="fa-solid fa-clipboard"/>
                <font-awesome-icon v-else icon="fa-solid fa-clipboard-check"/>
              </v-btn>

              <v-btn
                v-if="contactItem?.email !== ''"
                class="mt-2 action"
                variant="outlined"
                @click="copyToClipboard('email')"
              >
                {{ isEmailCopied ? 'Copied!' : contactItem?.email }}
                <font-awesome-icon v-if="!isEmailCopied" icon="fa-solid fa-clipboard"/>
                <font-awesome-icon v-else icon="fa-solid fa-clipboard-check"/>
              </v-btn>
            </v-row>

            <GoogleMap
              :api-key="apiKey"
              class="maps"
              :center="coords"
              :zoom=15
              language="en"
            >
              <MarkerCluster>
                <Marker :options="{ position: coords }" />
              </MarkerCluster>
          </GoogleMap>

            <div
              v-if="contactItem?.address !== ''"
              class="my-2 px-2 address-container"
            >
              {{ contactItem?.address }}

              <v-spacer/>

              <v-btn
                class="ml-2 action"
                variant="outlined"
                @click="copyToClipboard('address')"
              >
                <font-awesome-icon v-if="!isAddressCopied" icon="fa-solid fa-clipboard"/>
                <font-awesome-icon v-else icon="fa-solid fa-clipboard-check"/>
              </v-btn>
            </div>
        </div>
      </div>
      </div>
    </v-container>
  </div>
</template>

<style scoped lang="scss">
  .contact-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .action {
    text-transform: unset;
  }

  .maps {
    width: 100%;
    height: 50vh;
  }

  .address-container {
    display: flex;
    flex-direction: row;
  }
</style>

<script lang="ts" setup>
import HeaderComponent from '@/components/home/HeaderComponent.vue'
import { firestore as db } from '@/main'
import { Contact } from '@/types/Contact'
import { getDoc, doc } from 'firebase/firestore'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Delta, QuillEditor } from '@vueup/vue-quill'
import { GoogleMap, Marker, MarkerCluster } from 'vue3-google-map'
import CommonProgress from '@/components/common/CommonProgress.vue'

import '@vueup/vue-quill/dist/vue-quill.bubble.css'
import '@/styles/global.scss'

const contactItem = ref<Contact|undefined>(undefined)
const isLoading = ref(true)
const isEmailCopied = ref(false)
const isPhoneCopied = ref(false)
const isAddressCopied = ref(false)
const coords = computed(() => {
  if (contactItem.value?.latLng) {
    return {
      lat: Number(contactItem.value.latLng.split('N')[0]),
      lng: Number(contactItem.value.latLng.split('N')[1].split('E')[0])
    }
  } else {
    return {
      lat: 35.846595,
      lng: 127.132532
    }
  }
})
const contactDocRef = doc(db, 'Contact', 'Introduction')
const router = useRouter()
const apiKey = ref(process.env.VUE_APP_GOOGLE_MAPS_API_KEY)

function getContact () {
  isLoading.value = true

  getDoc(contactDocRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        contactItem.value = {
          ...(data as Contact),
          contentsDelta: data.contents === '' || data.contents === undefined ? undefined : new Delta(JSON.parse(data.contents || '{}'))
        }
      }
    })
    .catch((e: Error) => {
      console.log(e.message)
    })
    .finally(() => {
      isLoading.value = false
    })
}

function copyToClipboard (type: 'tel' | 'email' | 'address') {
  if (type === 'tel' && contactItem.value?.tel) {
    navigator.clipboard.writeText(contactItem.value.tel)
      .then(() => {
        isPhoneCopied.value = true
        isEmailCopied.value = false
        isAddressCopied.value = false
      })
      .catch((e: Error) => {
        console.log(e.message)
      })
  } else if (type === 'email' && contactItem.value?.email) {
    navigator.clipboard.writeText(contactItem.value.email)
      .then(() => {
        isEmailCopied.value = true
        isPhoneCopied.value = false
        isAddressCopied.value = false
      })
      .catch((e: Error) => {
        console.log(e.message)
      })
  } else if (type === 'address' && contactItem.value?.address) {
    navigator.clipboard.writeText(contactItem.value.address)
      .then(() => {
        isAddressCopied.value = true
        isPhoneCopied.value = false
        isEmailCopied.value = false
      })
      .catch((e: Error) => {
        console.log(e.message)
      })
  }
}

onMounted(() => {
  getContact()
})
</script>
