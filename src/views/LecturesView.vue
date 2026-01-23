<template>
  <div class="container">
    <v-container>
      <div class="global-container">
        <div>
          <HeaderComponent
            :title="'Lectures'"
            @on-click="showAddModal = true"
          />
        </div>

        <v-text-field
            class="mt-5 search-bar"
            v-model="searchText"
            label="Search Lectures"
            color="primary"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            clear-icon="mdi-close"
            clearable
            @click:clear="searchText = ''"
        ></v-text-field>

        <div class="header-container">
            <CommonProgress v-if="isLoading" />

            <div v-else class="chips-container">
              <div class="mt-2 chips">
                  <div
                    class="ml-2 mt-2"
                    v-for="year in yearsList"
                    :key="year"
                  >
                      <v-chip
                        v-if="selectedYear === year && searchText === ''"
                        prepend-icon="mdi-check"
                        variant="tonal"
                        color="primary"
                        class="rounded-pill"
                      >
                        {{ year }}
                      </v-chip>

                      <v-chip
                        v-else
                        @click="selectedYear = year"
                        variant="tonal"
                        class="rounded-pill"
                        :disabled="searchText !== '' || filteredLectures.length === 0"
                      >
                        {{ year }}
                      </v-chip>
                  </div>
                </div>

              <div
                  class="mt-4 mb-2 chips"
                >
                  <div
                    class="ml-2 mt-2"
                    v-for="semester in semestersList"
                    :key="semester"
                  >
                      <v-chip
                        v-if="selectedSemester === semester && searchText === ''"
                        prepend-icon="mdi-check"
                        variant="tonal"
                        color="primary"
                        class="rounded-pill"
                      >
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
              </div>

              <div v-if="filteredLectures.length === 0" class="mt-5">
                <font-awesome-icon icon="fa-solid fa-xmark"/>
                {{ 'No lectures found' }}
              </div>
            </div>
        </div>

        <div
          v-for="lect in filteredLectures"
          class="mt-5 contents-container"
          :key="lect.id"
        >
            <div class="mb-3 item-container">
              <div :style="{ flex: '1 1 0%' }">
                <v-chip v-if="searchText !== ''" class="rounded-xl mr-2" color="primary" variant="tonal">{{ lect.year }} {{ lect.semester }}</v-chip>
                <v-chip class="rounded-xl mr-2" color="primary" variant="outlined">{{ lect.graduate === '0' ? 'Undergraduate' : 'Graduate' }}</v-chip>
                {{ lect.title }}
              </div>

              <div class="actions-container">
                <div v-if="isSignedIn && isAdmin">
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

      <div class="text-caption">
        {{ 'If you want to check the syllabus and lecture information, please use the Jeonbuk National University course registration system site.' }}
        <v-btn class="ml-2" variant="text" :href="'https://oasis.jbnu.ac.kr/jbnu/sugang/sbjt/sbjt.html?param=KOR'">
          <font-awesome-icon icon="fa-solid fa-link"/>
        </v-btn>
      </div>

      <v-dialog v-model="showAddModal" class="dialog">
        <v-card class="pa-4 card">
            <v-card-title class="rounded-xl title-container">
              <v-row :style="{ alignItems: 'center', justifyContent: 'center', 'verticalAlign': 'middle' }">
                {{ isEditMode ? 'Edit Lecture' : 'Add Lecture' }}
                <v-spacer/>
                <v-btn variant="text" @click="showAddModal = false" color="red" :disabled="isUploading">
                  <font-awesome-icon icon="fa-solid fa-xmark"/>
                </v-btn>
              </v-row>
            </v-card-title>

            <v-card-contents class="card-contents">
              <v-text-field
                class="mt-4"
                v-model="newLectureModel.title"
                label="Title"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-format-title"
                clear-icon="mdi-close"
                clearable
                @click:clear="newLectureModel.title = ''"/>

              <v-text-field
                class="mt-4"
                v-model="newLectureModel.year"
                label="Year"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-calendar"
                type="number"/>

              <v-select
                class="mt-4"
                v-model="newLectureModel.semester"
                :items="semestersList"
                label="Semester"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-tree"/>

              <v-checkbox
                class="mt-4"
                v-model="newLectureModel.graduate"
                :true-value="'1'"
                :false-value="'0'"
                label="Graduate Course"
                color="primary"
                prepend-icon="mdi-school"/>
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

<style scoped lang="scss">
  .contents-container {
    flex-direction: column !important;
    overflow-y: auto;

    .item-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      text-align: left;

      .actions-container {
        display: flex;
        flex-direction: row;
        flex-shrink: 0;
      }
    }
  }

  .text-caption {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    bottom: 0;
  }
</style>

<script lang="ts" setup>
import HeaderComponent from '@/components/home/HeaderComponent.vue'
import { ref, onMounted, watch } from 'vue'
import { firestore as db } from '@/main'
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore'
import { Lecture, LectureRequest } from '@/types/Lecture'
import { useAuthStore } from '@/stores/AuthStateStore'
import { storeToRefs } from 'pinia'
import CommonProgress from '@/components/common/CommonProgress.vue'

const lecturesQuery = query(collection(db, 'Coarses'), orderBy('year', 'desc'))
const lecturesList = ref<Lecture[]>([])
const filteredLectures = ref<Lecture[]>([])

const yearsList = ref<string[]>([])
const selectedYear = ref('')

const semestersList = ref<string[]>(['Spring', 'Summer', 'Fall', 'Winter'])
const selectedSemester = ref(getCurrentSemester())
const { isSignedIn, isAdmin } = storeToRefs(useAuthStore())

const isLoading = ref(false)
const isUploading = ref(false)
const isEditMode = ref(false)
const showAddModal = ref(false)

const searchText = ref('')
const selectedId = ref('')
const newLectureModel = ref<LectureRequest>({
  title: '',
  year: new Date().getFullYear().toString(),
  semester: getCurrentSemester(),
  graduate: '0'
})

function getCurrentSemester () {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 6) {
    return 'Spring'
  } else if (month === 7 || month === 8) {
    return 'Summer'
  } else if (month >= 9 && month <= 12) {
    return 'Fall'
  } else {
    return 'Winter'
  }
}

function filterLectures () {
  filteredLectures.value = lecturesList.value.filter(lect => {
    return lect.year === selectedYear.value && lect.semester === selectedSemester.value
  })

  if (filteredLectures.value.length === 0 && lecturesList.value.length > 0 && lecturesList.value.some(lect => lect.year === selectedYear.value)) {
    selectedSemester.value = lecturesList.value.find(lect => lect.year === selectedYear.value)?.semester || 'Spring'
  }
}

function filterYears () {
  yearsList.value = Array.from(new Set(lecturesList.value.map(lect => lect.year))).sort((a, b) => parseInt(b) - parseInt(a))
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

        filterYears()
        selectedYear.value = newLectureModel.value.year
        selectedSemester.value = newLectureModel.value.semester
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
        filterYears()
        selectedYear.value = newLectureModel.value.year
        selectedSemester.value = newLectureModel.value.semester
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
        filterYears()

        if (!yearsList.value.includes(selectedYear.value) && yearsList.value.length > 0) {
          selectedYear.value = yearsList.value[0]
        }
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

      filterYears()
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
      year: new Date().getFullYear().toString(),
      semester: getCurrentSemester(),
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

onMounted(() => {
  getLectures()
})

</script>
