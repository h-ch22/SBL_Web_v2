<template>
<div style="top: 72px; margin-bottom: 72px; position: relative;">
  <v-container>
    <div :style="{
      minHeight: '100vh'
    }">
      <div>
        <HeaderComponent
          :title="selectedOption"
          :trailing-icon="selectedOption === 'Research' ? 'fa-solid fa-edit' : 'fa-solid fa-add'"
          @on-click="selectedOption === 'Research' ? showResearchModal = true : showAddModal = true"
        ></HeaderComponent>
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
              v-if="selectedOption === option"
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
              >
              {{ option }}
            </v-chip>
          </div>
      </div>

        <div
          :style="{
            width: '100vw',
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

          <div v-else-if="selectedOption === 'Projects'" class="mt-5">
            <div v-if="projectList.length === 0" :style="{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100vw'
            }">
              <font-awesome-icon icon="fa-solid fa-xmark"/>
              {{ 'No projects found' }}
            </div>

            <div v-for="project in projectList" :key="project.id">
              <v-card class="mt-2 pa-2" variant="outlined" :style="{ maxWidth: '90vw' }">
                <v-card-title style="word-break: break-word; white-space: normal;">
                  {{ project.contents }}
                </v-card-title>

                <v-card-subtitle>
                  <font-awesome-icon icon="fa-solid fa-building" class="mr-1"/>
                  {{ project.agency }}
                </v-card-subtitle>

                <v-card-text class="px-7">
                  <v-row :style="{ display: 'flex', flexDirection: 'row', alignItems: 'center' }">
                    <font-awesome-icon icon="fa-solid fa-calendar" class="mr-1"/>
                    {{ project.beginDate }} - {{ project.endDate }}
                  </v-row>

                  <v-row :style="{ display: 'flex', flexDirection: 'row', alignItems: 'center' }">
                    <font-awesome-icon icon="fa-solid fa-money-bill" class="mr-1"/>
                    {{ project.budget }} {{ project.budgetUnit }}
                  </v-row>
                </v-card-text>

                <v-card-actions v-if="isSignedIn">
                  <v-btn
                    variant="text"
                    color="primary"
                    @click="
                      {
                        isEditMode = true;
                        selectedId = project.id;
                        newProjectModel = {
                          agency: project.agency,
                          beginDate: project.beginDate,
                          budget: project.budget,
                          budgetUnit: project.budgetUnit,
                          contents: project.contents,
                          endDate: project.endDate
                        };
                        showAddModal = true;
                      }
                    "
                  >
                    <font-awesome-icon icon="fa-solid fa-pen-to-square" class="mr-1"/>
                  </v-btn>

                  <v-btn
                    variant="text"
                    color="red"
                    @click="deleteProject(project)"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="mr-1"/>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </div>

          <QuillEditor v-else-if="selectedOption === 'Research'"
            class="mt-5"
            v-model:content="researchContents"
            :options="{ readOnly: true, theme: 'bubble', modules: { toolbar: false } }"
            :style="{ maxWidth: '80vw' }"
          ></QuillEditor>
        </div>
      </div>

      <v-dialog v-model="showAddModal">
        <v-card class="pa-4">
            <v-card-title>
              <v-row :style="{ alignItems: 'center', justifyContent: 'center', 'verticalAlign': 'middle' }">
                {{ isEditMode ? 'Edit Project' : 'Add Project' }}
                <v-spacer/>
                <v-btn variant="text" @click="showAddModal = false" :disabled="isUploading">
                  <font-awesome-icon icon="fa-solid fa-xmark"/>
                </v-btn>
              </v-row>
            </v-card-title>

            <v-card-contents>
              <v-text-field
                class="mt-4"
                v-model="newProjectModel.contents"
                label="Contents"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-format-title"
                :style="{ maxWidth: '100vw' }"/>

              <v-text-field
                class="mt-4"
                v-model="newProjectModel.agency"
                label="Agency"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-office-building"
                :style="{ maxWidth: '100vw' }"/>

              <v-row class="mt-4" :style="{ maxWidth: '100vw', justifyContent: 'center' }">
                <v-text-field
                  v-model="newProjectModel.budget"
                  label="Budget"
                  variant="outlined"
                  color="primary"
                  type="number"
                  prepend-icon="mdi-cash-multiple"
                  :style="{ maxWidth: '65vw' }"/>

                <v-text-field
                  class="ml-2"
                  v-model="newProjectModel.budgetUnit"
                  label="Budget Unit"
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-currency-usd"
                  :style="{ maxWidth: '25vw' }"/>
              </v-row>

              <v-row class="mt-2 pa-4">
                <v-text-field
                  class="mr-2"
                  v-model="newProjectModel.beginDate"
                  label="Begin Date"
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-calendar"
                  readonly
                  :style="{ maxWidth: '100vw' }"/>

                <v-btn @click="
                {
                  datePickerType = 'begin';
                  showDatePicker = true;
                }
                " variant="text">
                  <font-awesome-icon icon="fa-solid fa-calendar"/>
                </v-btn>
              </v-row>

              <v-row class="mt-2 pa-4">
                <v-text-field
                  class="mr-2"
                  v-model="newProjectModel.endDate"
                  label="End Date"
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-calendar"
                  readonly
                  :style="{ maxWidth: '100vw' }"/>

                <v-btn @click="
                {
                  datePickerType = 'end';
                  showDatePicker = true;
                }
                " variant="text">
                  <font-awesome-icon icon="fa-solid fa-calendar"/>
                </v-btn>
              </v-row>

              <v-dialog v-model="showDatePicker">
                <v-card class="pa-4">
                  <v-card-title>
                    <v-row :style="{ display: 'flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle' }">
                      {{ datePickerType === 'begin' ? 'Select Begin Date' : 'Select End Date' }}
                      <v-spacer/>
                      <v-btn variant="text" @click="showDatePicker = false">
                        <font-awesome-icon icon="fa-solid fa-xmark"/>
                      </v-btn>
                    </v-row>
                  </v-card-title>

                  <v-card-contents class="my-5" :style="{ display: 'flex', alignItems: 'center', justifyContent: 'center', alignContent: 'center' }">
                    <v-date-picker v-model="selectedDate" show-adjacent-months></v-date-picker>
                  </v-card-contents>

                  <v-card-actions>
                    <v-btn
                      variant="tonal"
                      color="primary"
                      @click="setDate"
                    >
                      <font-awesome-icon icon="fa-solid fa-check"/>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
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
                @click="uploadProject"
              >
                <font-awesome-icon icon="fa-solid fa-check"/>
              </v-btn>
            </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showResearchModal">
        <v-card class="pa-4">
            <v-card-title>
              <v-row :style="{ alignItems: 'center', justifyContent: 'center', 'verticalAlign': 'middle' }">
                {{ 'Modify Research' }}
                <v-spacer/>
                <v-btn variant="text" @click="showResearchModal = false" :disabled="isUploading">
                  <font-awesome-icon icon="fa-solid fa-xmark"/>
                </v-btn>
              </v-row>
            </v-card-title>

            <v-card-contents class="mt-4">
              <QuillEditor
                v-model:content="newResearchModel"
                toolbar="full"
                :modules="modules"
                :options="{ theme: 'bubble' }"
                :style="{ maxHeight: '70vh', overflowY: 'auto' }"/>
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
                @click="updateResearch"
              >
                <font-awesome-icon icon="fa-solid fa-check"/>
              </v-btn>
            </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<style scoped>
* /deep/ .v-list-item__subtitle {
  white-space: normal;
}</style>

<script lang="ts" setup>
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import '@vueup/vue-quill/dist/vue-quill.bubble.css'
import HeaderComponent from '@/components/HeaderComponent.vue'
import ImageUploader from 'quill-image-uploader'
import { firestore as db, auth, storage } from '@/main'
import { Project, ProjectRequest } from '@/types/Research'
import { updateDoc, addDoc, doc, getDocs, query, collection, orderBy, deleteDoc, getDoc } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { onMounted, ref, watch } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { Delta, QuillEditor } from '@vueup/vue-quill'

const isLoading = ref(true)
const isUploading = ref(false)
const isEditMode = ref(false)
const selectedId = ref('')
const selectedDate = ref(new Date())
const showAddModal = ref(false)
const showResearchModal = ref(false)
const isSignedIn = ref(false)
const selectedOption = ref('Research')
const options = ref(['Research', 'Projects'])
const projectList = ref<Project[]>([])
const projectsQuery = query(collection(db, 'Projects'), orderBy('beginDate', 'desc'))
const newProjectModel = ref<ProjectRequest>(
  {
    agency: '',
    beginDate: `${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}.${String(new Date().getDate()).padStart(2, '0')}`,
    budget: '',
    budgetUnit: 'KRW',
    contents: '',
    endDate: `${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}.${String(new Date().getDate()).padStart(2, '0')}`
  }
)
const newResearchModel = ref<Delta|undefined>(undefined)
const researchContents = ref<Delta|undefined>(undefined)
const modules = {
  name: 'Imageuploader',
  module: ImageUploader,
  options: {
    upload: (file: File) => {
      isUploading.value = true

      return new Promise((resolve, reject) => {
        uploadBytes(storageRef(storage, `research/${file.name}`), file)
          .then((snapshot) => {
            getDownloadURL(snapshot.ref)
              .then((url) => {
                resolve(url)
              })
              .catch((e: Error) => {
                console.log(e.message)
                reject(e)
              })
              .finally(() => {
                isUploading.value = false
              })
          })
          .catch((e: Error) => {
            isUploading.value = false
            console.log(e.message)
            reject(e)
          })
      })
    }
  }
}
const showDatePicker = ref(false)
const datePickerType = ref<'begin' | 'end'>('begin')

function setDate () {
  const formattedDate = `${selectedDate.value.getFullYear()}.${String(selectedDate.value.getMonth() + 1).padStart(2, '0')}.${String(selectedDate.value.getDate()).padStart(2, '0')}`

  if (datePickerType.value === 'begin') {
    newProjectModel.value.beginDate = formattedDate
  } else {
    newProjectModel.value.endDate = formattedDate
  }

  showDatePicker.value = false
}

function updateResearch () {
  if (newResearchModel.value === undefined || newResearchModel.value.ops.length === 0) {
    alert('Please fill in all fields.')
    return
  }

  isUploading.value = true

  updateDoc(doc(db, 'Research', 'contents'), {
    contents: JSON.stringify(newResearchModel.value)
  })
    .then(() => {
      alert('Contents updated successfully.')
      researchContents.value = newResearchModel.value

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
}

function uploadProject () {
  if (newProjectModel.value.agency === '' || newProjectModel.value.beginDate === '' || newProjectModel.value.endDate === '' || newProjectModel.value.budget === '' || newProjectModel.value.contents === '' || newProjectModel.value.budgetUnit === '') {
    alert('Please fill in all fields.')
    return
  }

  isUploading.value = true

  if (isEditMode.value && selectedId.value !== '') {
    updateDoc(doc(db, 'Projects', selectedId.value), {
      ...newProjectModel.value
    })
      .then(() => {
        alert('Project updated successfully.')
        const index = projectList.value.findIndex(p => p.id === selectedId.value)
        if (index !== -1) {
          projectList.value[index] = { id: selectedId.value, ...newProjectModel.value }
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
    addDoc(collection(db, 'Projects'), {
      ...newProjectModel.value
    })
      .then((doc) => {
        alert('Project created successfully.')
        projectList.value.push({
          id: doc.id,
          ...newProjectModel.value
        } as Project)

        showAddModal.value = false
      })
      .catch((e: Error) => {
        console.log(e.message)
        alert(`An error occurred while creating the project: ${e.message}`)
      })
      .finally(() => {
        isUploading.value = false
      })
  }
}

function deleteProject (proj: Project) {
  if (confirm(`Are you sure you want to delete ${proj.contents} project?\nThis action cannot be undone.`)) {
    isLoading.value = true

    deleteDoc(doc(db, 'Projects', proj.id))
      .then(() => {
        alert('Project deleted successfully.')
        projectList.value = projectList.value.filter(p => p.id !== proj.id)
      })
      .catch((e: Error) => {
        console.log(e.message)
        alert(`An error occurred while deleting the project: ${e.message}`)
      })
      .finally(() => {
        isLoading.value = false
      })
  }
}

function getProjects () {
  isLoading.value = true
  getDocs(projectsQuery)
    .then((docs) => {
      projectList.value = docs.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[]
    })
    .catch((e: Error) => {
      console.log(e.message)
    })
    .finally(() => {
      isLoading.value = false
    })
}

function getResearch () {
  getDoc(doc(db, 'Research', 'contents'))
    .then((doc) => {
      if (doc.exists()) {
        researchContents.value = new Delta(JSON.parse(doc.data().contents))
        newResearchModel.value = researchContents.value
      }
    })
    .catch((e: Error) => {
      console.log(e.message)
      alert(`An error occurred while updating the lecture: ${e.message}`)
    })
    .finally(() => {
      isLoading.value = false
      isEditMode.value = false
      selectedId.value = ''
      showAddModal.value = false
      showResearchModal.value = false
    })
}

watch(selectedOption, () => {
  if (selectedOption.value === 'Projects') {
    getProjects()
  } else {
    getResearch()
  }
})

onMounted(() => {
  getResearch()
})

onAuthStateChanged(auth, () => {
  isSignedIn.value = auth.currentUser !== null
})

</script>
