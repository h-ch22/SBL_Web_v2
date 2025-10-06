<template>
  <div style="top: 72px; margin-bottom: 72px; position: relative;">
    <v-container>
      <div :style="{ minHeight: '100vh' }">
        <div>
          <HeaderComponent
            :title="isEditMode ? 'Modify Post' : 'Create New Post'"
            :trailing-icon="'fa-solid fa-check'"
            :show-progress="showProgress"
            @on-click="upload"
          ></HeaderComponent>
        </div>

        <v-expansion-panels v-model="panel">
          <v-expansion-panel
            title="Required Informations"
            class="rounded-xl"
            expand
            :expand-icon="
              postData.title !== '' && contents !== undefined
                ? 'mdi-check'
                : 'mdi-chevron-down'
            "
          >
            <v-expansion-panel-text>
                <div>
                  <v-text-field
                    variant="solo-filled"
                    color="primary"
                    v-model="postData.title"
                    label="Title"
                    prepend-inner-icon="mdi-format-title"
                  />

                  <v-select
                    :disabled="isEditMode"
                    variant="solo-filled"
                    v-model="selectedCategory"
                    :items="categories"
                    label="Category"
                    prepend-inner-icon="mdi-shape"
                    item-title="text"
                    item-value="value"
                    color="primary"
                  />

                  <v-file-input
                    v-model="selectedImage"
                    prepend-icon="mdi-camera"
                    :label="isEditMode ? 'Change Image' : 'Image'"
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
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { CommonBoardCreateRequest } from '@/types/CommonBoardItem'
import router from '@/router'

const panel = ref([0])
const selectedImage = ref<File|null>(null)
const showProgress = ref(false)
const contents = ref<Delta|undefined>(undefined)
const isEditMode = ref(false)
const selectedCategory = ref('Awards')

const postData = ref<CommonBoardCreateRequest>({
  contents: '',
  date: '',
  title: ''
})

const categories = [
  'Awards', 'Gallery', 'News'
]

async function upload () {
  if (postData.value.title === '' || contents.value === undefined || (!isEditMode.value && selectedImage.value === null)) {
    alert('Please fill in all required fields.')
  } else {
    showProgress.value = true

    postData.value.contents = contents.value === undefined ? '' : JSON.stringify(contents.value)
    let docId = ''

    if (isEditMode.value) {
      docId = history.state.post.id

      await updateDoc(
        doc(db, selectedCategory.value, (docId)), {
          ...(postData.value)
        }
      )
        .catch((e: Error) => {
          alert(`An error occurred while modifying post.\nPlease try again later.\n(${e.message})`)
          showProgress.value = false
        })
    } else {
      postData.value.date = `${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}.${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
      const docRef = await addDoc(
        collection(db, selectedCategory.value), {
          ...(postData.value)
        }
      )
        .catch((e: Error) => {
          alert(`An error occurred while creating a new post.\nPlease try again later.\n(${e.message})`)
          showProgress.value = false
        })

      docId = docRef.id
    }

    if (selectedImage.value !== null) {
      const uploadRef = storageRef(storage, `${selectedCategory.value.toLowerCase()}/img/${docId}.${selectedImage.value.name.split('.').pop()}`)

      uploadBytes(uploadRef, selectedImage.value)
        .catch((e: Error) => {
          alert(`An error occurred while uploading image.\nPlease try again later.\n(${e.message})`)
          showProgress.value = false
        })
        .then(() => {
          getDownloadURL(uploadRef)
            .then((url) => {
              updateDoc(doc(db, selectedCategory.value, docId), { image: url })
                .catch((e: Error) => {
                  alert(`An error occurred while saving image URL.\nPlease try again later.\n(${e.message})`)
                })
                .then(() => {
                  alert(isEditMode.value ? 'Post modified successfully.' : 'New post created successfully.')
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
      alert(isEditMode.value ? 'Post modified successfully.' : 'New post created successfully.')
      showProgress.value = false
      router.back()
    }
  }
}

onMounted(() => {
  if (history.state.post) {
    isEditMode.value = true
    postData.value = { ...(history.state.post as CommonBoardCreateRequest) }
    contents.value = postData.value.contents ? new Delta(JSON.parse(history.state.post.contents)) : undefined
    selectedCategory.value = history.state.post.category
  } else {
    if (history.state.back === '/awards') {
      selectedCategory.value = 'Awards'
    } else if (history.state.back === '/gallery') {
      selectedCategory.value = 'Gallery'
    } else if (history.state.back === '/news') {
      selectedCategory.value = 'News'
    } else {
      alert('Invalid access.')
      router.back()
    }
  }
})

</script>
