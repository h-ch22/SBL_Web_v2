<template>
  <div style="top: 72px; margin-bottom: 72px; position: relative;">
    <v-container>
      <div :style="{ minHeight: '100vh' }">
        <div>
          <HeaderComponent
            :title="'Members'"
            @on-click="router.push('/create-member')"
          />
        </div>

        <div
          :style="{
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'auto',
          }">
            <div
              class="ml-2"
              v-for="option in options"
              :key="option">
              <v-chip
                v-if="selectedOption === option && searchText === ''"
                  prepend-icon="mdi-check"
                  variant="tonal"
                  color="primary"
                  class="rounded-pill">
                {{ option }}
              </v-chip>

              <v-chip
                v-else
                @click="selectedOption = option"
                variant="tonal"
                class="rounded-pill"
                :disabled="searchText !== ''"
                >
                {{ option }}
              </v-chip>
            </div>
        </div>

        <v-text-field
          class="mt-5"
          v-model="searchText"
          label="Search Members"
          color="primary"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          :style="{ maxWidth: '100vw' }"
          clear-icon="mdi-close"
          clearable
        ></v-text-field>

        <div
          :style="{
            display: 'flex',
            justifyContent: 'center'
          }">
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              color="primary"/>

            <div v-else-if="!isLoading && filteredMembers.length === 0" class="mt-5">
              <font-awesome-icon icon="fa-solid fa-xmark"/>
              {{ 'No members found' }}
            </div>
            <v-row v-else>
              <v-col class="mt-5" v-for="member in filteredMembers" :key="member.id">
                  <div>
                    <v-card class="rounded-xl" variant="outlined">
                      <v-card-title
                        class="text-h4 font-weight-medium mt-2"
                        style="word-break: break-word; white-space: normal;"
                      >
                        <v-chip v-if="searchText !== ''" class="rounded-xl" color="primary" variant="tonal">
                          {{ member.cat }}
                        </v-chip>

                        <v-img
                          v-if="member.profile !== '' && member.profile !== undefined && member.profile !== null"
                          :src="member.profile"
                          width="200px"
                          height="200px"
                        />

                        <v-img
                          v-else
                          :src="member.cat === 'Alumni' ? require(`@/assets/img_placeholder_graduate_${theme.current.value.dark ? 'dark' : 'light'}.png`) : require(`@/assets/img_placeholder_employee_${theme.current.value.dark ? 'dark' : 'light'}.png`)"
                          width="200px"
                          height="200px"
                        />

                      <div :style="{ alignContent: 'center' }">
                          <v-chip variant="outlined" class="rounded-xl" color="primary">
                            {{ member.degree }}
                          </v-chip>

                          {{ member.name }}
                        </div>
                      </v-card-title>

                      <v-card-text>
                        <div class="mt-2" v-if="member.email !== ''">
                          <font-awesome-icon icon="fa-solid fa-envelope"/>
                          {{ member.email }}
                        </div>

                        <div class="mt-2" v-if="member.tel !== ''">
                          <font-awesome-icon icon="fa-solid fa-phone"/>
                          {{ member.tel }}
                        </div>

                        <div class="mt-2" v-if="member.degree !== undefined">
                          <font-awesome-icon icon="fa-solid fa-graduation-cap"/>
                          {{ member.dept }}
                        </div>

                        <div class="mt-2" v-if="member.interests !== '' && member.interests !== undefined">
                          <font-awesome-icon icon="fa-solid fa-star"/>
                          {{ member.interests }}
                        </div>

                        <QuillEditor
                          v-if="member.showCareer"
                          class="mt-2"
                          v-model:content="member.careerDelta"
                          :options="{ readOnly: true, theme: 'bubble', modules: { toolbar: false } }"/>
                      </v-card-text>

                      <v-card-actions v-if="member.website !== '' || member.career !== '' || isSignedIn">
                        <v-btn v-if="member.career !== ''" @click="member.showCareer = !member.showCareer">
                          <font-awesome-icon v-if="member.showCareer" icon="fa-solid fa-chevron-up"/>
                          <font-awesome-icon v-else icon="fa-solid fa-chevron-down"/>
                        </v-btn>
                        <v-btn v-if="member.website !== ''" :color="theme.current.value.colors['on-background']" :href="member.website">
                          <font-awesome-icon icon="fa-solid fa-link"></font-awesome-icon>
                        </v-btn>

                        <v-btn v-if="isSignedIn" @click="router.push({
                          name: 'modifyMember',
                          state: {
                            member: {
                              id: member.id,
                              email: member.email ?? '',
                              tel: member.tel ?? '',
                              website: member.website ?? '',
                              career: member.career ?? '',
                              careerDelta: JSON.stringify(member.careerDelta ?? ''),
                              cat: member.cat ?? '',
                              degree: member.degree ?? '',
                              dept: member.dept ?? '',
                              name: member.name ?? '',
                              interests: member.interests ?? ''
                            }
                          }
                        })">
                          <font-awesome-icon icon="fa-solid fa-edit"></font-awesome-icon>
                        </v-btn>

                        <v-btn v-if="isSignedIn" color="red" @click="deleteMember(member)">
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
import { auth, firestore as db, storage } from '@/main'
import { onMounted, ref, watch } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import { Member } from '@/types/Member'
import { query, collection, getDocs, doc, deleteDoc, orderBy } from 'firebase/firestore'
import { ref as storageRef, deleteObject } from 'firebase/storage'
import { useTheme } from 'vuetify/lib/composables/theme'
import { useRouter } from 'vue-router'
import { Delta, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.bubble.css'
import { onAuthStateChanged } from 'firebase/auth'

const options = ref([
  'Professor', 'Researcher', 'Student', 'Alumni'
])

const selectedOption = ref('Professor')
const members = ref<Member[]>([])
const filteredMembers = ref<Member[]>([])
const membersQuery = query(collection(db, 'Members'), orderBy('name'))
const isLoading = ref(true)
const isSignedIn = ref(false)
const theme = useTheme()
const router = useRouter()
const searchText = ref('')

function filterMembers () {
  filteredMembers.value = members.value.filter(member => member.cat === selectedOption.value)
}

function deleteMember (member: Member) {
  if (confirm(`Are you sure you want to delete member ${member.name}?\nThis action cannot be undone.`)) {
    isLoading.value = true
    deleteDoc(doc(db, 'Members', member.id as string))
      .then(() => {
        if (member.profile !== '' && member.profile !== undefined && member.profile !== null) {
          deleteObject(storageRef(storage, `members/img/${member.id}.${member.profile.split('.').pop()?.split('?')[0]}`))
            .catch((e: Error) => {
              alert(`An error occurred while deleting profile image.\nPlease try again later.\n(${e.message})`)
            })
            .finally(() => {
              alert('Member deleted successfully.')
              members.value = members.value.filter(m => m.id !== member.id)
              filterMembers()
              isLoading.value = false
            })
        } else {
          alert('Member deleted successfully.')
          members.value = members.value.filter(m => m.id !== member.id)
          filterMembers()
          isLoading.value = false
        }
      })
      .catch((e: Error) => {
        alert(`An error occurred while deleting member.\nPlease try again later.\n(${e.message})`)
        isLoading.value = false
      })
  }
}

onMounted(() => {
  getDocs(membersQuery)
    .then((data) => {
      members.value = data.docs.map((doc) => ({
        ...(doc.data() as Member),
        id: doc.id,
        careerDelta: doc.data().career === '' || doc.data().career === undefined ? undefined : new Delta(JSON.parse(doc.data().career || '{}')),
        showCareer: false
      }))

      filterMembers()
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

watch(selectedOption, () => {
  filterMembers()
})

watch(searchText, () => {
  if (searchText.value === '') {
    filterMembers()
  } else {
    filteredMembers.value = members.value.filter(member => member.name.toLowerCase().includes(searchText.value.toLowerCase()) || (member.dept !== undefined && member.dept.toLowerCase().includes(searchText.value.toLowerCase())) || (member.degree !== undefined && member.degree.toLowerCase().includes(searchText.value.toLowerCase())) || (member.interests !== undefined && member.interests.toLowerCase().includes(searchText.value.toLowerCase())) || (member.email !== undefined && member.email.toLowerCase().includes(searchText.value.toLowerCase())) || (member.tel !== undefined && member.tel.toLowerCase().includes(searchText.value.toLowerCase())))
  }
})
</script>
