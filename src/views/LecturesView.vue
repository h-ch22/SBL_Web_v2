<template>
  <div style="top: 72px; margin-bottom: 72px; position: relative;">
    <v-container>
      <div :style="{
          minHeight: '100vh'
      }">
        <div>
          <HeaderComponent
            :title="'Lectures'"
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

              <!-- <div
                v-else
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
                      <v-btn variant="tonal">
                        <font-awesome-icon icon="fa-solid fa-link"/>
                      </v-btn>

                      <div v-if="isSignedIn">
                        <v-btn variant="tonal" class="ml-2">
                          <font-awesome-icon icon="fa-solid fa-edit"/>
                        </v-btn>

                        <v-btn variant="tonal" color="red" class="ml-2">
                          <font-awesome-icon icon="fa-solid fa-trash"/>
                        </v-btn>
                      </div>
                    </div>
                  </div>
              </div> -->
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
                  <v-btn variant="tonal" class="ml-2">
                    <font-awesome-icon icon="fa-solid fa-edit"/>
                  </v-btn>

                  <v-btn variant="tonal" color="red" class="ml-2">
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
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import HeaderComponent from '@/components/HeaderComponent.vue'
import { ref, onMounted, watch } from 'vue'
import { firestore as db, auth } from '@/main'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { Lecture } from '@/types/Lecture'
import { onAuthStateChanged } from 'firebase/auth'

const lecturesQuery = query(collection(db, 'Coarses'), orderBy('year', 'desc'))
const lecturesList = ref<Lecture[]>([])
const filteredLectures = ref<Lecture[]>([])

const yearsList = ref<string[]>([])
const selectedYear = ref('')

const semestersList = ref<string[]>(['Spring', 'Summer', 'Fall', 'Winter'])
const selectedSemester = ref('Spring')
const isLoading = ref(false)
const searchText = ref('')
const isSignedIn = ref(false)

function filterLectures () {
  filteredLectures.value = lecturesList.value.filter(lect => {
    return lect.year === selectedYear.value && lect.semester === selectedSemester.value
  })
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
