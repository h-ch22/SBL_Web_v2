<template>
  <div style="top: 72px; margin-bottom: 72px; position: relative;">
    <v-container>
      <div>
        <div>
          <HeaderComponent
            :title="'Members'"
          />
        </div>

        <div
          :style="{
            display: 'flex',
            flexDirection: 'row',
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
                      >
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

                        <div class="mt-2" v-if="member.degree !== ''">
                          <font-awesome-icon icon="fa-solid fa-graduation-cap"/>
                          {{ member.dept }}
                        </div>

                        <div class="mt-2" v-if="member.interests !== '' && member.interests !== undefined">
                          <font-awesome-icon icon="fa-solid fa-star"/>
                          {{ member.interests }}
                        </div>

                        <div v-if="member.showCareer" class="mt-2" v-html="member.career.replace(/\r?\n/g, '<br>')">
                        </div>
                      </v-card-text>

                      <v-card-actions v-if="member.website !== '' || member.career !== '' || auth.currentUser !== null">
                        <v-btn v-if="member.career !== ''" @click="member.showCareer = !member.showCareer">
                          <font-awesome-icon v-if="member.showCareer" icon="fa-solid fa-chevron-up"/>
                          <font-awesome-icon v-else icon="fa-solid fa-chevron-down"/>
                        </v-btn>
                        <v-btn v-if="member.website !== ''" :color="theme.current.value.colors['on-background']">
                          <font-awesome-icon icon="fa-solid fa-link"></font-awesome-icon>
                        </v-btn>

                        <v-btn v-if="auth.currentUser !== null">
                          <font-awesome-icon icon="fa-solid fa-edit"></font-awesome-icon>
                        </v-btn>

                        <v-btn v-if="auth.currentUser !== null" color="red">
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
import { auth, firestore as db } from '@/main'
import { onMounted, ref, watch } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import { Member } from '@/types/Member'
import { query, collection, getDocs } from 'firebase/firestore'
import { useTheme } from 'vuetify/lib/composables/theme'

const options = ref([
  'Professor', 'Researcher', 'Student', 'Alumni'
])

const selectedOption = ref('Professor')
const members = ref<Member[]>([])
const filteredMembers = ref<Member[]>([])
const membersQuery = query(collection(db, 'Members'))
const isLoading = ref(true)
const theme = useTheme()

function filterMembers () {
  filteredMembers.value = members.value.filter(member => member.cat === selectedOption.value)
}

onMounted(() => {
  getDocs(membersQuery)
    .then((data) => {
      members.value = data.docs.map((doc) => ({
        ...(doc.data() as Member),
        id: doc.id,
        email: doc.data()['E-Mail'],
        tel: doc.data().Tel,
        website: doc.data().Website,
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

watch(selectedOption, () => {
  filterMembers()
})
</script>
