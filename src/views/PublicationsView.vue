<template>
  <div style="top: 72px; margin-bottom: 72px; position: relative;">
    <v-container>
      <div :style="{
          minHeight: '100vh'
      }">
        <div>
          <HeaderComponent
            :title="'Publications'"
            @on-click="showAddModal = true"
          />
        </div>

        <v-text-field
          class="mt-5"
          v-model="searchText"
          label="Search Publications"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          color="primary"
          :style="{ maxWidth: '100vw' }"
          clear-icon="mdi-close"
          clearable
          @click:clear="searchText = ''"
        ></v-text-field>

        <v-row
          class="mt-2 mb-2"
          :style="{
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'auto',
        }">
          <div
            class="ml-2 mt-2"
            v-for="type in publicationTypes"
            :key="type">
            <v-chip
              v-if="selectedType === type && searchText === ''"
              prepend-icon="mdi-check"
              variant="tonal"
              color="primary"
              class="rounded-pill">
              {{ type }}
            </v-chip>

            <v-chip
              v-else
              @click="selectedType = type"
              variant="tonal"
              class="rounded-pill"
              :disabled="searchText !== ''"
            >
              {{ type }}
            </v-chip>
          </div>
        </v-row>

        <div
          :style="{
            display: 'flex',
            justifyContent: 'center'
          }">
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              color="primary"/>

            <div v-else-if="!isLoading && filteredPublications.length === 0" class="mt-5">
              <font-awesome-icon icon="fa-solid fa-xmark"/>
              {{ 'No publications found' }}
            </div>

            <div v-else>
              <div
                v-for="(pub, index) in filteredPublications"
                :key="pub.id"
                :style="{
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  flex: '1 1 0%'
                }">
                <div v-if="index === 0 || (index > 0 && filteredPublications[index].year !== filteredPublications[index - 1].year)">
                  <h3 class="mt-5 mb-2">{{ filteredPublications[index].year }}</h3>
                </div>

                  <div class="mb-3" :style="{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }">
                    <div :style="{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}">
                      <v-chip v-if="searchText !== ''" class="rounded-xl mb-2" color="primary" variant="outlined">
                        {{ pub.type }}
                      </v-chip>

                      {{ pub.contents }}
                    </div>

                    <div class="ml-4" :style="{ display: 'flex', flexDirection: 'row', flexShrink: 0 }">
                      <v-btn variant="tonal" :href="pub.link">
                        <font-awesome-icon icon="fa-solid fa-link"/>
                      </v-btn>

                      <div v-if="isSignedIn">
                        <v-btn variant="tonal" class="ml-2" @click="
                          {
                            isEditMode = true;
                            selectedId = pub.id;
                            newPublicationModel = {
                              contents: pub.contents,
                              link: pub.link,
                              type: pub.type,
                              year: pub.year
                            };
                            showAddModal = true;
                          }">
                          <font-awesome-icon icon="fa-solid fa-edit"/>
                        </v-btn>

                        <v-btn variant="tonal" color="red" class="ml-2" @click="deletePublication(pub)">
                          <font-awesome-icon icon="fa-solid fa-trash"/>
                        </v-btn>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
        </div>
      </div>

      <v-dialog v-model="showAddModal" max-width="80vw">
        <v-card class="pa-4">
            <v-card-title style="word-break: break-word; white-space: normal;">
              <v-row :style="{ alignItems: 'center', justifyContent: 'center', 'verticalAlign': 'middle' }">
                {{ isEditMode ? 'Edit Publication' : 'Add Publication' }}
                <v-spacer/>
                <v-btn variant="text" @click="showAddModal = false" :disabled="isUploading">
                  <font-awesome-icon icon="fa-solid fa-xmark"/>
                </v-btn>
              </v-row>
            </v-card-title>

            <v-card-contents>
              <v-text-field
                class="mt-4"
                v-model="newPublicationModel.contents"
                label="Contents"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-format-title"
                clear-icon="mdi-close"
                clearable
                @click:clear="newPublicationModel.contents = ''"
                :style="{ maxWidth: '100vw' }"/>

              <v-text-field
                class="mt-4"
                v-model="newPublicationModel.link"
                label="Link"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-web"
                clear-icon="mdi-close"
                clearable
                @click:clear="newPublicationModel.link = ''"
                :style="{ maxWidth: '100vw' }"/>

              <v-text-field
                class="mt-4"
                v-model="newPublicationModel.year"
                label="Year"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-calendar"
                type="number"
                clear-icon="mdi-close"
                clearable
                @click:clear="newPublicationModel.year = ''"
                :style="{ maxWidth: '100vw' }"/>

              <v-select
                class="mt-4"
                v-model="newPublicationModel.type"
                :items="publicationTypes"
                label="Type"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-tag"
                :style="{ maxWidth: '100vw' }"/>
            </v-card-contents>

            <v-card-actions>
              <v-progress-circular
                v-if="isUploading"
                indeterminate
                color="primary"/>

              <v-btn
                v-else
                variant="tonal"
                color="primary"
                @click="uploadPublication"
              >
                <font-awesome-icon icon="fa-solid fa-check"/>
              </v-btn>
            </v-card-actions>
          </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import HeaderComponent from '@/components/HeaderComponent.vue'
import { ref, onMounted, watch } from 'vue'
import { firestore as db, auth } from '@/main'
import { collection, deleteDoc, getDocs, orderBy, query, doc, updateDoc, addDoc } from 'firebase/firestore'
import { Publication, PublicationRequest } from '@/types/Publication'
import { onAuthStateChanged } from 'firebase/auth'

const publicationsQuery = query(collection(db, 'Publications'), orderBy('year', 'desc'))
const publicationsList = ref<Publication[]>([])
const filteredPublications = ref<Publication[]>([])
const publicationTypes = ref([
  'Intl_Journals', 'Intl_Conferences', 'Domestic_Journals', 'Domestic_Conferences', 'Patent', 'Book'
])
const selectedType = ref('Intl_Journals')
const isLoading = ref(true)
const isUploading = ref(false)
const isSignedIn = ref(false)
const isEditMode = ref(false)
const showAddModal = ref(false)
const searchText = ref('')
const selectedId = ref('')
const newPublicationModel = ref<PublicationRequest>({
  contents: '',
  link: '',
  type: 'Intl_Journals',
  year: new Date().getFullYear().toString()
})

function filterPublications () {
  filteredPublications.value = publicationsList.value.filter(pub => pub.type === selectedType.value)
}

function uploadPublication () {
  if (newPublicationModel.value.contents === '' || newPublicationModel.value.link === '' || newPublicationModel.value.year === '') {
    alert('Please fill in all fields.')
    return
  }

  isUploading.value = true

  if (isEditMode.value && selectedId.value !== '') {
    updateDoc(doc(db, 'Publications', selectedId.value), {
      ...newPublicationModel.value
    })
      .then(() => {
        alert('Publication updated successfully.')
        const index = publicationsList.value.findIndex(p => p.id === selectedId.value)
        if (index !== -1) {
          publicationsList.value[index] = { id: selectedId.value, ...newPublicationModel.value }
          filterPublications()
        }

        isEditMode.value = false
        selectedId.value = ''
        showAddModal.value = false
      })
      .catch((e: Error) => {
        console.log(e.message)
        alert(`An error occurred while updating the publication: ${e.message}`)
      })
      .finally(() => {
        isUploading.value = false
      })
  } else {
    addDoc(collection(db, 'Publications'), {
      ...newPublicationModel.value
    })
      .then((doc) => {
        alert('Publication created successfully.')
        publicationsList.value.push({
          id: doc.id,
          ...newPublicationModel.value
        } as Publication)
        filterPublications()

        showAddModal.value = false
      })
      .catch((e: Error) => {
        console.log(e.message)
        alert(`An error occurred while creating the publication: ${e.message}`)
      })
      .finally(() => {
        isUploading.value = false
      })
  }
}

function deletePublication (pub: Publication) {
  if (confirm(`Are you sure you want to delete ${pub.contents} publication?\nThis action cannot be undone.`)) {
    isLoading.value = true

    deleteDoc(doc(db, 'Publications', pub.id))
      .then(() => {
        alert('Publication deleted successfully.')
        publicationsList.value = publicationsList.value.filter(p => p.id !== pub.id)
        filterPublications()
      })
      .catch((e: Error) => {
        console.log(e.message)
        alert(`An error occurred while deleting the publication: ${e.message}`)
      })
      .finally(() => {
        isLoading.value = false
      })
  }
}

onMounted(() => {
  getDocs(publicationsQuery)
    .then((docs) => {
      publicationsList.value = docs.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Publication[]
      filterPublications()
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

watch(showAddModal, () => {
  if (!showAddModal.value) {
    newPublicationModel.value = {
      contents: '',
      link: '',
      type: 'Intl_Journals',
      year: new Date().getFullYear().toString()
    }
  }

  isUploading.value = false
})

watch(selectedType, () => {
  filterPublications()
})

watch(searchText, () => {
  if (searchText.value === '') {
    filterPublications()
  } else {
    const searchLower = searchText.value.toLowerCase()
    filteredPublications.value = publicationsList.value.filter(pub => pub.contents.toLowerCase().includes(searchLower))
  }
})
</script>
