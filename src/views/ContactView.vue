<template>
<div style="top: 72px; margin-bottom: 72px; position: relative;">
  <v-container>
    <div :style="{
      minHeight: '100vh'
    }">
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
              v-else
              class="mt-5"
              :style="{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
              }"
          >
              <v-img :src="contactItem?.image" width="100%" max-width="100%"/>

              <QuillEditor
                v-if="contactItem?.contentsDelta"
                class="mt-2"
                v-model:content="contactItem.contentsDelta"
                :options="{ readOnly: true, theme: 'bubble', modules: { toolbar: false } }"/>

              <v-row class="mt-2 mr-2">
                <v-btn
                  variant="outlined"
                  v-if="contactItem?.tel !== ''"
                  @click="copyToClipboard('tel')"
                >
                  {{ isPhoneCopied ? 'Copied!' : contactItem?.tel }}
                  <font-awesome-icon v-if="!isPhoneCopied" icon="fa-solid fa-clipboard"/>
                  <font-awesome-icon v-else icon="fa-solid fa-clipboard-check"/>
                </v-btn>

                <v-btn
                  class="mt-2"
                  variant="outlined"
                  v-if="contactItem?.email !== ''"
                  @click="copyToClipboard('email')"
                >
                  {{ isEmailCopied ? 'Copied!' : contactItem?.email }}
                  <font-awesome-icon v-if="!isEmailCopied" icon="fa-solid fa-clipboard"/>
                  <font-awesome-icon v-else icon="fa-solid fa-clipboard-check"/>
                </v-btn>
              </v-row>

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
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Delta, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.bubble.css'

const contactItem = ref<Contact|undefined>(undefined)
const isLoading = ref(true)
const isEmailCopied = ref(false)
const isPhoneCopied = ref(false)
const contactDocRef = doc(db, 'Contact', 'Introduction')
const router = useRouter()

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

function copyToClipboard (type: 'tel' | 'email') {
  if (type === 'tel' && contactItem.value?.tel) {
    navigator.clipboard.writeText(contactItem.value.tel)
      .then(() => {
        isPhoneCopied.value = true
        isEmailCopied.value = false
      })
      .catch((e: Error) => {
        console.log(e.message)
      })
  } else if (type === 'email' && contactItem.value?.email) {
    navigator.clipboard.writeText(contactItem.value.email)
      .then(() => {
        isEmailCopied.value = true
        isPhoneCopied.value = false
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
