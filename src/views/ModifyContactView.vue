<template>
  <div style="top: 72px; margin-bottom: 72px; position: relative;">
    <v-container>
      <div :style="{ minHeight: '100vh' }">
        <div>
          <HeaderComponent
            :title="'Modify Contact'"
            :trailing-icon="'fa-solid fa-check'"
            :leading-icon="'fa-solid fa-chevron-circle-left'"
            :show-leading-btn="true"
            :show-progress="showProgress"
            @on-click="upload"
            @on-leading-btn-click="router.back()"
          ></HeaderComponent>
        </div>

        <v-expansion-panels v-model="panel">
          <v-expansion-panel
            title="Required Informations"
            class="rounded-xl"
            expand
            :expand-icon="
              contactData.address !== '' && contents !== undefined &&
              contactData.email !== '' && contactData.latLng !== '' &&
              contactData.tel !== ''
                ? 'mdi-check'
                : 'mdi-chevron-down'
            "
          >
            <v-expansion-panel-text>
                <div>
                  <v-text-field
                    variant="solo-filled"
                    color="primary"
                    v-model="contactData.address"
                    label="Address"
                    prepend-inner-icon="mdi-map-marker"
                  />

                <v-text-field
                    variant="solo-filled"
                    color="primary"
                    v-model="contactData.email"
                    label="E-Mail"
                    prepend-inner-icon="mdi-email"
                />

                <v-text-field
                    variant="solo-filled"
                    color="primary"
                    v-model="contactData.tel"
                    label="Tel"
                    prepend-inner-icon="mdi-phone"
                  />

                  <v-file-input
                    v-model="selectedImage"
                    prepend-icon="mdi-camera"
                    :label="'Change Image'"
                    accept="image/*"
                    variant="solo-filled"
                  ></v-file-input>

                  <QuillEditor placeholder="Contents" v-model:content="contents" theme="snow" toolbar="full"/>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import HeaderComponent from '@/components/HeaderComponent.vue'
import { firestore as db, storage } from '@/main'
import { onMounted, ref } from 'vue'
import { Delta, QuillEditor } from '@vueup/vue-quill'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import router from '@/router'
import { Contact, ContactUpdateRequest } from '@/types/Contact'

const panel = ref([0])
const selectedImage = ref<File|null>(null)
const showProgress = ref(false)
const contents = ref<Delta|undefined>(undefined)

const contactData = ref<ContactUpdateRequest>({
  address: '',
  contents: '',
  email: '',
  latLng: '',
  tel: ''
})

async function upload () {
  if (contactData.value.address === '' || contents.value === undefined || contactData.value.email === '' || contactData.value.tel === '') {
    alert('Please fill in all required fields.')
  } else {
    showProgress.value = true

    contactData.value.contents = contents.value === undefined ? '' : JSON.stringify(contents.value)

    await updateDoc(
      doc(db, 'Contact', 'Introduction'), {
        ...(contactData.value)
      }
    )
      .catch((e: Error) => {
        alert(`An error occurred while modifying post.\nPlease try again later.\n(${e.message})`)
        showProgress.value = false
      })

    if (selectedImage.value !== null) {
      const uploadRef = storageRef(storage, `contact/introduction.${selectedImage.value.name.split('.').pop()}`)

      uploadBytes(uploadRef, selectedImage.value)
        .catch((e: Error) => {
          alert(`An error occurred while uploading image.\nPlease try again later.\n(${e.message})`)
          showProgress.value = false
        })
        .then(() => {
          getDownloadURL(uploadRef)
            .then((url) => {
              updateDoc(doc(db, 'Contact', 'Introduction'), { image: url })
                .catch((e: Error) => {
                  alert(`An error occurred while saving image URL.\nPlease try again later.\n(${e.message})`)
                })
                .then(() => {
                  alert('Modified successfully.')
                  router.back()
                })
                .finally(() => {
                  showProgress.value = false
                })
            })
            .catch((e: Error) => {
              alert(`An error occurred while retrieving image URL.\nPlease try again later.\n(${e.message})`)
              showProgress.value = false
            })
        })
    } else {
      alert('Modified successfully.')
      showProgress.value = false
      router.back()
    }
  }
}

onMounted(() => {
  if (history.state.data) {
    contactData.value = { ...(history.state.data as Contact) }
    contents.value = contactData.value.contents ? new Delta(JSON.parse(contactData.value.contents)) : undefined
  } else {
    if (history.state.back !== '/contact') {
      alert('Invalid access.')
      router.back()
    }
  }
})

</script>
