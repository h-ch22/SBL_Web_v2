<template>
  <div style="top: 72px; margin-bottom: 72px; position: relative;">
    <v-container>
      <div :style="{ minHeight: '100vh' }">
        <div>
          <HeaderComponent
            :title="isEditMode ? 'Modify Member' : 'Create New Member'"
            :show-leading-btn="true"
            :leading-icon="'fa-solid fa-chevron-circle-left'"
            :show-progress="showProgress"
            @on-click="upload"
            @on-leading-btn-click="router.back()"
          ></HeaderComponent>
        </div>

        <div style="display: flex; justify-content: center; align-items: center; flex-direction: row;">
          <v-img
            class="mb-4"
            :src="memberData.cat === MemberCategoryType.ALUMNI ? require(
              `@/assets/img_placeholder_graduate_${theme.current.value.dark ? 'dark' : 'light'}.png`
            ) : require(`@/assets/img_placeholder_employee_${theme.current.value.dark ? 'dark' : 'light'}.png`)
              " max-width="200" max-height="200"
          ></v-img>

          <div>
            <div class="text-h4 font-weight-medium">{{ memberData.name }}</div>
            <div>{{ memberData.dept }}</div>
          </div>
        </div>

        <v-expansion-panels v-model="panel">
          <v-expansion-panel
            title="Required Informations"
            class="rounded-xl"
            expand
            :expand-icon="
              memberData.name !== '' && memberData.dept !== '' && memberData.degree !== undefined && memberData.cat !== undefined
                ? 'mdi-check'
                : 'mdi-chevron-down'
            "
          >
            <v-expansion-panel-text>
                <div>
                  <v-text-field
                    variant="solo-filled"
                    color="primary"
                    v-model="memberData.name"
                    label="Name"
                    prepend-inner-icon="mdi-account"
                  />

                  <v-text-field
                    variant="solo-filled"
                    color="primary"
                    v-model="memberData.dept"
                    label="Department"
                    prepend-inner-icon="mdi-office-building"
                  />

                  <v-select
                    variant="solo-filled"
                    v-model="memberData.degree"
                    :items="degrees"
                    label="Degree"
                    prepend-inner-icon="mdi-school"
                    item-title="text"
                    item-value="value"
                    color="primary"
                  />

                  <v-select
                    variant="solo-filled"
                    v-model="memberData.cat"
                    :items="categories"
                    label="Member Type"
                    prepend-inner-icon="mdi-badge-account"
                    item-title="text"
                    item-value="value"
                    color="primary"
                  />
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel
            title="Optional Informations"
            class="rounded-xl"
            expand
          >
            <v-expansion-panel-text>
                <div>
                  <v-text-field
                    variant="solo-filled"
                    v-model="memberData.email"
                    label="E-Mail"
                    type="email"
                    color="primary"
                    prepend-inner-icon="mdi-email"
                  />

                  <v-text-field
                    variant="solo-filled"
                    v-model="memberData.tel"
                    label="Tel"
                    type="phone"
                    color="primary"
                    prepend-inner-icon="mdi-phone"
                  />

                  <v-text-field
                    variant="solo-filled"
                    v-model="memberData.website"
                    label="Website"
                    type="url"
                    color="primary"
                    prepend-inner-icon="mdi-web"
                  />

                  <v-text-field
                    variant="solo-filled"
                    v-model="memberData.interests"
                    label="Interests"
                    color="primary"
                    prepend-inner-icon="mdi-star"
                  />

                  <v-file-input
                    v-model="selectedImage"
                    prepend-icon="mdi-camera"
                    :label="isEditMode ? 'Change Profile Image' : 'Profile Image'"
                    accept="image/*"
                    variant="solo-filled"
                  ></v-file-input>

                  <QuillEditor placeholder="Career" v-model:content="career" theme="snow" toolbar="full"/>
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
import { useTheme } from 'vuetify/lib/composables/theme'
import { firestore as db, storage } from '@/main'
import { onMounted, ref } from 'vue'
import { Delta, QuillEditor } from '@vueup/vue-quill'
import { MemberCreateRequest } from '@/types/Member'
import { MemberCategoryType } from '@/enums/MemberCategoryType'
import { MemberDegreeType } from '@/enums/MemberDegreeType'
import { addDoc, collection, doc, DocumentReference, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { useRouter } from 'vue-router'

const panel = ref([0])
const theme = useTheme()
const selectedImage = ref<File|null>(null)
const showProgress = ref(false)
const career = ref<Delta|undefined>(undefined)
const isEditMode = ref(false)
const router = useRouter()

const memberData = ref<MemberCreateRequest>({
  email: '',
  tel: '',
  website: '',
  career: '',
  cat: MemberCategoryType.PROFESSOR,
  degree: MemberDegreeType.PHD,
  dept: '',
  name: '',
  interests: ''
})

const degrees = [
  { text: 'Ph.D', value: MemberDegreeType.PHD },
  { text: 'M.S', value: MemberDegreeType.MS },
  { text: 'B.S', value: MemberDegreeType.BS },
  { text: 'Undergraduate', value: MemberDegreeType.UNDER_GRADUATE }
]

const categories = [
  { text: 'Professor', value: MemberCategoryType.PROFESSOR },
  { text: 'Researcher', value: MemberCategoryType.RESEARCHER },
  { text: 'Student', value: MemberCategoryType.STUDENT },
  { text: 'Alumni', value: MemberCategoryType.ALUMNI }
]

async function upload () {
  if (memberData.value.name === '' || memberData.value.dept === '' || memberData.value.degree === undefined || memberData.value.cat === undefined) {
    alert('Please fill in all required fields.')
  } else {
    showProgress.value = true

    memberData.value.career = career.value === undefined ? '' : JSON.stringify(career.value)
    let docId = ''

    if (isEditMode.value) {
      docId = history.state.member.id

      await updateDoc(
        doc(db, 'Members', (docId)), {
          ...(memberData.value)
        }
      )
        .catch((e: Error) => {
          alert(`An error occurred while modifying member.\nPlease try again later.\n(${e.message})`)
          showProgress.value = false
        })
    } else {
      const docRef = await addDoc(
        collection(db, 'Members'), {
          ...(memberData.value)
        }
      )
        .catch((e: Error) => {
          alert(`An error occurred while creating a new member.\nPlease try again later.\n(${e.message})`)
          showProgress.value = false
        })

      docId = docRef.id
    }

    if (selectedImage.value !== null) {
      const uploadRef = storageRef(storage, `members/img/${docId}.${selectedImage.value.name.split('.').pop()}`)

      uploadBytes(uploadRef, selectedImage.value)
        .catch((e: Error) => {
          alert(`An error occurred while uploading profile image.\nPlease try again later.\n(${e.message})`)
          showProgress.value = false
        })
        .then(() => {
          getDownloadURL(uploadRef)
            .then((url) => {
              updateDoc(doc(db, 'Members', docId), { profile: url })
                .catch((e: Error) => {
                  alert(`An error occurred while saving profile image URL.\nPlease try again later.\n(${e.message})`)
                })
                .then(() => {
                  alert(isEditMode.value ? 'Member modified successfully.' : 'New member created successfully.')
                  router.back()
                })
                .finally(() => {
                  showProgress.value = false
                })
            })
            .catch((e: Error) => {
              alert(`An error occurred while retrieving profile image URL.\nPlease try again later.\n(${e.message})`)
              showProgress.value = false
            })
        })
    } else {
      alert(isEditMode.value ? 'Member modified successfully.' : 'New member created successfully.')
      showProgress.value = false
      router.back()
    }
  }
}

onMounted(() => {
  if (history.state.member) {
    isEditMode.value = true
    memberData.value = { ...(history.state.member as MemberCreateRequest) }
    career.value = memberData.value.career ? new Delta(JSON.parse(history.state.member.careerDelta)) : undefined
  }
})

</script>
