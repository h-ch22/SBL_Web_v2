<template>
  <div style="top: 72px; margin-bottom: 72px; position: relative;">
    <v-container>
      <div>
        <div>
          <HeaderComponent
            :title="'Publications'"
          />
        </div>

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
                      v-if="selectedType === type"
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
                    >
                      {{ type }}
                    </v-chip>
                  </div>
                </v-row>

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
                    <div>
                      {{ pub.contents }}
                    </div>

                    <div :style="{ display: 'flex', flexDirection: 'row', flexShrink: 0 }">
                      <v-btn variant="tonal">
                        <font-awesome-icon icon="fa-solid fa-link"/>
                      </v-btn>

                      <div v-if="auth.currentUser !== null">
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

        </div>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import HeaderComponent from '@/components/HeaderComponent.vue'
import { ref, onMounted, watch } from 'vue'
import { firestore as db, auth } from '@/main'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { Publication } from '@/types/Publication'

const publicationsQuery = query(collection(db, 'Publications'), orderBy('year', 'desc'))
const publicationsList = ref<Publication[]>([])
const filteredPublications = ref<Publication[]>([])
const publicationTypes = ref([
  'Intl_Journals', 'Intl_Conferences', 'Domestic_Journals', 'Domestic_Conferences'
])
const selectedType = ref('Intl_Journals')
const isLoading = ref(true)

function filterPublications () {
  filteredPublications.value = publicationsList.value.filter(pub => pub.type === selectedType.value)
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

watch(selectedType, () => {
  filterPublications()
})
</script>
