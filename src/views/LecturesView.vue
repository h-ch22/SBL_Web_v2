<template>
  <div style="top: 72px; margin-bottom: 72px; position: relative;">
    <v-container>
      <div :style="{
          minHeight: '100vh'
      }">
        <div>
          <HeaderComponent
            :title="'Lectures'"
            @on-click="showAddModal = true"
          />
        </div>

        <v-text-field
            class="mt-5"
            v-model="searchText"
            label="Search Lectures"
            color="primary"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            :style="{ maxWidth: '100vw' }"
        ></v-text-field>

        <div
          :style="{
            display: 'flex',
            justifyContent: 'center',
          }">
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              color="primary"/>

            <div v-else>
              <v-row
                  class="mt-2"
                  :style="{
                    display: 'flex',
                    flexDirection: 'row',
                    overflowX: 'auto',
                }">
                  <div
                    class="ml-2 mt-2"
                    v-for="year in yearsList"
                    :key="year">
                      <v-chip
                        v-if="selectedYear === year && searchText === ''"
                        prepend-icon="mdi-check"
                        variant="tonal"
                        color="primary"
                        class="rounded-pill">
                        {{ year }}
                      </v-chip>

                      <v-chip
                        v-else
                        @click="selectedYear = year"
                        variant="tonal"
                        class="rounded-pill"
                        :disabled="searchText !== ''"
                        >
                        {{ year }}
                      </v-chip>
                  </div>
              </v-row>

              <v-row
                  class="mt-4 mb-2"
                  :style="{
                    display: 'flex',
                    flexDirection: 'row',
                    overflowX: 'auto',
                }">
                  <div
                    class="ml-2 mt-2"
                    v-for="semester in semestersList"
                    :key="semester">
                      <v-chip
                        v-if="selectedSemester === semester && searchText === ''"
                        prepend-icon="mdi-check"
                        variant="tonal"
                        color="primary"
                        class="rounded-pill">
                        {{ semester }}
                      </v-chip>

                      <v-chip
                        v-else
                        @click="selectedSemester = semester"
                        variant="tonal"
                        class="rounded-pill"
                        :disabled="lecturesList.filter(lect => lect.semester === semester && lect.year === selectedYear).length === 0 || searchText !== ''"
                        >
                        {{ semester }}
                      </v-chip>
                  </div>
              </v-row>

              <div v-if="filteredLectures.length === 0" class="mt-5">
                <font-awesome-icon icon="fa-solid fa-xmark"/>
                {{ 'No lectures found' }}
              </div>
            </div>
        </div>

        <div
          v-for="lect in filteredLectures"
          class="mt-5"
          :key="lect.id"
          :style="{
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }">
            <div class="mb-3" :style="{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }">
              <div :style="{ flex: '1 1 0%' }">
                <v-chip class="rounded-xl mr-2" color="primary" variant="outlined">{{ lect.graduate === '0' ? 'Undergraduate' : 'Graduate' }}</v-chip>
                {{ lect.title }}
              </div>

              <div :style="{ display: 'flex', flexDirection: 'row', flexShrink: 0 }">
                <div v-if="isSignedIn">
                  <v-btn variant="tonal" class="ml-2" @click="
                    {
                      isEditMode = true
                      selectedId = lect.id
                      newLectureModel = {
                        title: lect.title,
                        year: lect.year,
                        semester: lect.semester,
                        graduate: lect.graduate
                      };

                      showAddModal = true
                    }
                  ">
                    <font-awesome-icon icon="fa-solid fa-edit"/>
                  </v-btn>

                  <v-btn variant="tonal" color="red" class="ml-2" @click="deleteLecture(lect)">
                    <font-awesome-icon icon="fa-solid fa-trash"/>
                  </v-btn>
                </div>
              </div>
            </div>
        </div>
      </div>

      <div class="text-caption" style="display: flex; flex-direction: row; justify-content: center; align-items: center; bottom: 0">
        {{ 'If you want to check the syllabus and lecture information, please use the Jeonbuk National University course registration system site.' }}
        <v-btn class="ml-2" variant="text" :href="'https://oasis.jbnu.ac.kr/jbnu/sugang/sbjt/sbjt.html?param=KOR'">
          <font-awesome-icon icon="fa-solid fa-link"/>
        </v-btn>
      </div>

      <v-dialog v-model="showAddModal" max-width="80vw">
        <v-card class="pa-4">
            <v-card-title style="word-break: break-word; white-space: normal;">
              <v-row :style="{ alignItems: 'center', justifyContent: 'center', 'verticalAlign': 'middle' }">
                {{ isEditMode ? 'Edit Lecture' : 'Add Lecture' }}
                <v-spacer/>
                <v-btn variant="text" @click="showAddModal = false" :disabled="isUploading">
                  <font-awesome-icon icon="fa-solid fa-xmark"/>
                </v-btn>
              </v-row>
            </v-card-title>

            <v-card-contents>
              <v-text-field
                class="mt-4"
                v-model="newLectureModel.title"
                label="Title"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-format-title"
                :style="{ maxWidth: '100vw' }"/>

              <v-text-field
                class="mt-4"
                v-model="newLectureModel.year"
                label="Year"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-calendar"
                type="number"
                :style="{ maxWidth: '100vw' }"/>

              <v-select
                class="mt-4"
                v-model="newLectureModel.semester"
                :items="semestersList"
                label="Semester"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-tree"
                :style="{ maxWidth: '100vw' }"/>

              <v-checkbox
                class="mt-4"
                v-model="newLectureModel.graduate"
                :true-value="'1'"
                :false-value="'0'"
                label="Graduate Course"
                color="primary"
                prepend-icon="mdi-school"
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
                @click="uploadLecture"
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
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore'
import { Lecture, LectureRequest } from '@/types/Lecture'
import { onAuthStateChanged } from 'firebase/auth'

const lecturesQuery = query(collection(db, 'Coarses'), orderBy('year', 'desc'))
const lecturesList = ref<Lecture[]>([])
const filteredLectures = ref<Lecture[]>([])

const yearsList = ref<string[]>([])
const selectedYear = ref('')

const semestersList = ref<string[]>(['Spring', 'Summer', 'Fall', 'Winter'])
const selectedSemester = ref('Spring')

const isLoading = ref(false)
const isUploading = ref(false)
const isSignedIn = ref(false)
const isEditMode = ref(false)
const showAddModal = ref(false)

const searchText = ref('')
const selectedId = ref('')
const newLectureModel = ref<LectureRequest>({
  title: '',
  year: new Date().getFullYear().toString(),
  semester: 'Spring',
  graduate: '0'
})

function filterLectures () {
  filteredLectures.value = lecturesList.value.filter(lect => {
    return lect.year === selectedYear.value && lect.semester === selectedSemester.value
  })
}

function uploadLecture () {
  if (newLectureModel.value.title === '' || newLectureModel.value.year === '' || newLectureModel.value.semester === '') {
    alert('Please fill in all fields.')
    return
  }

  isUploading.value = true

  if (isEditMode.value && selectedId.value !== '') {
    updateDoc(doc(db, 'Coarses', selectedId.value), {
      ...newLectureModel.value
    })
      .then(() => {
        alert('Lecture updated successfully.')
        const index = lecturesList.value.findIndex(p => p.id === selectedId.value)
        if (index !== -1) {
          lecturesList.value[index] = { id: selectedId.value, ...newLectureModel.value }
          filterLectures()
        }

        isEditMode.value = false
        selectedId.value = ''
        showAddModal.value = false
      })
      .catch((e: Error) => {
        console.log(e.message)
        alert(`An error occurred while updating the lecture: ${e.message}`)
      })
      .finally(() => {
        isUploading.value = false
      })
  } else {
    addDoc(collection(db, 'Coarses'), {
      ...newLectureModel.value
    })
      .then((doc) => {
        alert('Lecture created successfully.')
        lecturesList.value.push({
          id: doc.id,
          ...newLectureModel.value
        } as Lecture)

        filterLectures()

        showAddModal.value = false
      })
      .catch((e: Error) => {
        console.log(e.message)
        alert(`An error occurred while creating the lecture: ${e.message}`)
      })
      .finally(() => {
        isUploading.value = false
      })
  }
}

function deleteLecture (lect: Lecture) {
  if (confirm(`Are you sure you want to delete ${lect.title} lecture?\nThis action cannot be undone.`)) {
    isLoading.value = true

    deleteDoc(doc(db, 'Coarses', lect.id))
      .then(() => {
        alert('Lecture deleted successfully.')
        lecturesList.value = lecturesList.value.filter(l => l.id !== lect.id)
        filterLectures()
      })
      .catch((e: Error) => {
        console.log(e.message)
        alert(`An error occurred while deleting the lecture: ${e.message}`)
      })
      .finally(() => {
        isLoading.value = false
      })
  }
}

function getLectures () {
  isLoading.value = true
  getDocs(lecturesQuery)
    .then((docs) => {
      lecturesList.value = docs.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lecture[]
      filteredLectures.value = lecturesList.value

      yearsList.value = Array.from(new Set(lecturesList.value.map(lect => lect.year)))
      selectedYear.value = yearsList.value[0]
      filterLectures()
    })
    .catch((e: Error) => {
      console.log(e.message)
    })
    .finally(() => {
      isLoading.value = false
    })
}

watch([selectedSemester, selectedYear], () => {
  filterLectures()
})

watch(showAddModal, () => {
  if (!showAddModal.value) {
    newLectureModel.value = {
      title: '',
      year: '',
      semester: 'Spring',
      graduate: '0'
    }
  }

  isUploading.value = false
})

watch(searchText, () => {
  if (searchText.value === '') {
    filterLectures()
  } else {
    const searchLower = searchText.value.toLowerCase()
    filteredLectures.value = lecturesList.value.filter(lect => lect.title.toLowerCase().includes(searchLower))
  }
})

onAuthStateChanged(auth, () => {
  isSignedIn.value = auth.currentUser !== null
})

onMounted(() => {
  getLectures()
})

</script>
