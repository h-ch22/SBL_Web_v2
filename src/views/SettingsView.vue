<template>
<div style="top: 72px; margin-bottom: 72px; position: relative;">
  <v-container>
    <div :style="{
      minHeight: '100vh'
    }">
      <div>
        <HeaderComponent
          :title="'Settings'"
          :show-trailing-btn="false"
        ></HeaderComponent>

        <div
            :style="{
                display: 'flex',
                flexDirection: 'column',
        }">
        <v-expansion-panels v-model="panel">
            <v-expansion-panel
                title="Change Password"
                class="rounded-xl"
                expand
            >
                <v-expansion-panel-text>
                    <div class="text-h6 pa-2">
                        <div style="display: flex; flex-direction: row; justify-content: space-between;">
                            {{ 'Change Password' }}

                            <v-progress-circular
                                v-if="loadingItem === 'changePassword'"
                                color="primary"
                                indeterminate
                            ></v-progress-circular>

                            <v-btn
                                v-else
                                @click="changePassword"
                                color="primary"
                                variant="tonal"
                                :disabled="!isValidPassword || newPassword !== confirmPassword">
                                <font-awesome-icon icon="fa-solid fa-check"></font-awesome-icon>
                            </v-btn>
                        </div>

                        <v-text-field
                            class="mt-4"
                            v-model="newPassword"
                            :type="'password'"
                            :label="'New Password'"
                            :prepend-inner-icon="'mdi-key'"
                            color="primary"
                            clearable
                        ></v-text-field>

                        <v-text-field
                            v-model="confirmPassword"
                            :type="'password'"
                            :label="'Confirm Password'"
                            :prepend-inner-icon="'mdi-key'"
                            color="primary"
                            clearable
                        ></v-text-field>

                        <div class="text-caption">
                            {{ 'Password must be at least 8 characters long and contain uppercase and lowercase letters, numbers, and special characters.' }}
                        </div>
                    </div>
                </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel
                title="Create Account"
                class="rounded-xl"
            >
                <v-expansion-panel-text>
                    <div class="text-h6 pa-2">
                        <div style="display: flex; flex-direction: row; justify-content: space-between;">
                            {{ 'Create Account' }}

                            <v-progress-circular
                                v-if="loadingItem === 'createUser'"
                                color="primary"
                                indeterminate
                            ></v-progress-circular>
                            <v-btn
                                v-else
                                @click="createUser"
                                color="primary"
                                variant="tonal"
                                :disabled="!isValidPasswordToCreate || passwordToCreate !== confirmPasswordToCreate || email === '' || !email.includes('@')">
                                <font-awesome-icon icon="fa-solid fa-check"></font-awesome-icon>
                            </v-btn>
                        </div>

                        <v-text-field
                            class="mt-4"
                            v-model="email"
                            :type="'email'"
                            :label="'E-Mail'"
                            :prepend-inner-icon="'mdi-email'"
                            color="primary"
                            clearable
                        ></v-text-field>

                        <v-text-field
                            v-model="passwordToCreate"
                            :type="'password'"
                            :label="'Password'"
                            :prepend-inner-icon="'mdi-key'"
                            color="primary"
                            clearable
                        ></v-text-field>

                        <v-text-field
                            v-model="confirmPasswordToCreate"
                            :type="'password'"
                            :label="'Confirm Password'"
                            :prepend-inner-icon="'mdi-key'"
                            color="primary"
                            clearable
                        ></v-text-field>

                        <div class="text-caption">
                            {{ 'Password must be at least 8 characters long and contain uppercase and lowercase letters, numbers, and special characters.' }}
                        </div>

                        <v-checkbox v-model="isAdmin" label="Admin" color="primary" hide-details></v-checkbox>

                        <div class="text-caption" :style='{ verticalAlign: "middle", justifyContent: "center" }'>
                            {{ 'Granting Admin rights allows you to write posts or make changes to the site using the account you created.\nThis task requires an administrator account.' }}

                            <v-btn variant="icon">
                              <font-awesome-icon
                                icon="fa-solid fa-circle-info"
                                @click="showUserTypeDescriptionWindow = true"
                            ></font-awesome-icon>
                            </v-btn>
                        </div>
                    </div>
                </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel
                title="Withdraw"
                class="rounded-xl"
            >
                <v-expansion-panel-text>
                    <div class="text-h6 pa-2">
                        <div style="display: flex; flex-direction: row; justify-content: space-between;">
                            {{ 'Withdraw' }}

                            <v-progress-circular
                                v-if="loadingItem === 'withdraw'"
                                color="primary"
                                indeterminate
                            ></v-progress-circular>
                            <v-btn
                                v-else
                                @click="withdraw"
                                color="primary"
                                variant="tonal">
                                <font-awesome-icon icon="fa-solid fa-arrow-right"></font-awesome-icon>
                            </v-btn>
                        </div>

                        <div class="text-caption">
                            {{ 'Withdrawing will prevent you from signing in anymore and cannot be undone.' }}
                        </div>
                    </div>
                </v-expansion-panel-text>

                <v-dialog v-if="showUserTypeDescriptionWindow" v-model="showUserTypeDescriptionWindow" :style="{ backdropFilter: 'blur(5px)' }">
                  <v-card class="pa-5">
                    <v-card-title class="rounded-xl" style="word-break: break-word; white-space: pre-wrap; position: sticky; top: 0; background-color: transparent; z-index: 1000;">
                      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <div class="rounded-xl pa-2" style="max-width: 70%; word-break: break-word; white-space: pre-wrap; backdrop-filter: blur(5px);">
                          Site Permissions by User Type
                        </div>

                        <v-btn style="margin-left: 16px; flex-shrink: 0;" variant="tonal" @click="showUserTypeDescriptionWindow = false">
                          <font-awesome-icon icon="fa-solid fa-xmark"/>
                        </v-btn>
                      </div>
                    </v-card-title>

                    <v-card-text>
                      <v-table>
                        <thead>
                          <tr>
                            <th class="text-left">
                              Feature
                            </th>

                            <th class="text-left">
                              Administrator
                            </th>

                            <th class="text-left">
                              Standard User
                            </th>

                            <th class="text-left">
                              Guest(Non-Signed In)
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr
                            v-for="feature in featuresByUserType"
                            :key="feature.feature"
                          >
                            <td>{{ feature.feature }}</td>
                            <td>
                              <font-awesome-icon
                                :icon="feature.admin ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"
                                :color="feature.admin ? 'green' : 'red'"
                              ></font-awesome-icon>
                            </td>

                            <td>
                              <font-awesome-icon
                                :icon="feature.standard ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"
                                :color="feature.standard ? 'green' : 'red'"
                              ></font-awesome-icon>
                            </td>

                            <td>
                              <font-awesome-icon
                                :icon="feature.guest ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"
                                :color="feature.guest ? 'green' : 'red'"
                              ></font-awesome-icon>
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </v-card-text>
                  </v-card>
                </v-dialog>
            </v-expansion-panel>

            <v-expansion-panel
                title="Banner"
                class="rounded-xl"
            >
                <v-expansion-panel-text>
                    <div class="text-h6 pa-2">
                        <div style="display: flex; flex-direction: row; justify-content: space-between;">
                            {{ 'Change Banner Content' }}

                            <v-progress-circular
                                v-if="loadingItem === 'banner'"
                                color="primary"
                                indeterminate
                            ></v-progress-circular>
                            <v-btn
                                v-else
                                color="primary"
                                variant="tonal"
                                @click="changeBanner"
                                :disabled="selectedBanner === null">
                                <font-awesome-icon icon="fa-solid fa-check"></font-awesome-icon>
                            </v-btn>
                        </div>

                        <v-radio-group v-model="bannerType" inline>
                            <v-radio label="Video" value="Video" color="primary"/>
                            <v-radio label="Image" value="Image" color="primary"/>
                        </v-radio-group>

                        <v-file-input
                            v-model="selectedBanner"
                            :prepend-icon="bannerType === 'Video' ? 'mdi-video' : 'mdi-image'"
                            :label="'Load File'"
                            :accept="bannerType === 'Video' ? 'video/*' : 'image/*'"
                            variant="solo-filled"
                        ></v-file-input>
                    </div>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </div>
</div>

<v-dialog v-model="showSignInDialog" :style="{ backdropFilter: 'blur(5px)' }">
  <v-card class="pa-5">
    <v-card-title class="rounded-xl" style="word-break: break-word; white-space: pre-wrap; position: sticky; top: 0; background-color: transparent; z-index: 1000;">
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <div class="rounded-xl pa-2" style="max-width: 70%; word-break: break-word; white-space: pre-wrap; backdrop-filter: blur(5px);">
          <font-awesome-icon icon="fa-solid fa-sign-in" style="margin-right: 8px;"/>
          {{ 'Sign In' }}
        </div>
        <v-btn style="margin-left: 16px; flex-shrink: 0;" variant="tonal" @click="closeSignInDialog">
          <font-awesome-icon icon="fa-solid fa-xmark"/>
        </v-btn>
      </div>
    </v-card-title>

    <v-card-subtitle>
      {{ 'Sign in as an administrator to elevate the privileges of the user you just created.' }}
    </v-card-subtitle>

    <v-card-text>
        <v-text-field
            class="mt-4"
            v-model="adminEmail"
            :type="'email'"
            :label="'E-Mail'"
            :prepend-inner-icon="'mdi-email'"
            color="primary"
            clearable
        ></v-text-field>

        <v-text-field
            v-model="adminPassword"
            :type="'password'"
            :label="'Password'"
            :prepend-inner-icon="'mdi-key'"
            color="primary"
            clearable
        ></v-text-field>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>

      <v-progress-circular
        v-if="isLoggingIn"
        color="primary"
        indeterminate
      ></v-progress-circular>
      <v-btn v-else :disabled="adminEmail === '' || adminPassword === ''" @click="signIn" variant="tonal" color="primary">
        <font-awesome-icon icon="fa-solid fa-check"></font-awesome-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

</v-container>
</div>
</template>

<script lang="ts" setup>
import HeaderComponent from '@/components/HeaderComponent.vue'
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { deleteObject, ref as storageRef, uploadBytes } from 'firebase/storage'
import { updatePassword, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, validatePassword } from 'firebase/auth'
import { ref, watch } from 'vue'
import { firestore as db, storage, auth } from '@/main'

const newPassword = ref('')
const confirmPassword = ref('')

const email = ref('')
const passwordToCreate = ref('')
const confirmPasswordToCreate = ref('')
const uidToCreate = ref('')

const adminEmail = ref('')
const adminPassword = ref('')

const loadingItem = ref('')
const isLoggingIn = ref(false)

const isAdmin = ref(false)
const showUserTypeDescriptionWindow = ref(false)
const featuresByUserType = ref([
  {
    feature: 'Read Posts (Awards, News, Gallery)',
    admin: true,
    standard: true,
    guest: true
  },
  {
    feature: 'View Members',
    admin: true,
    standard: true,
    guest: true
  },
  {
    feature: 'View Lectures',
    admin: true,
    standard: true,
    guest: true
  },
  {
    feature: 'View Publications',
    admin: true,
    standard: true,
    guest: true
  },
  {
    feature: 'View Contact',
    admin: true,
    standard: true,
    guest: true
  },
  {
    feature: 'View Downloads (Public only)',
    admin: true,
    standard: true,
    guest: true
  },
  {
    feature: 'View Research/Projects',
    admin: true,
    standard: true,
    guest: true
  },
  {
    feature: 'View Banners, Homescreen',
    admin: true,
    standard: true,
    guest: true
  },
  {
    feature: 'Withdraw / Update Password',
    admin: true,
    standard: true,
    guest: true
  },
  {
    feature: 'View Private Downloads',
    admin: true,
    standard: true,
    guest: false
  },
  {
    feature: 'Create/Modify/Delete Posts (Awards, News, Gallery)',
    admin: true,
    standard: false,
    guest: false
  },
  {
    feature: 'Create/Modify/Delete Members',
    admin: true,
    standard: false,
    guest: false
  },
  {
    feature: 'Update Lectures',
    admin: true,
    standard: false,
    guest: false
  },
  {
    feature: 'Add/Update/Delete Publications',
    admin: true,
    standard: false,
    guest: false
  },
  {
    feature: 'Update Contact',
    admin: true,
    standard: false,
    guest: false
  },
  {
    feature: 'Create/Update/Delete Downloads and Private Downloads',
    admin: true,
    standard: false,
    guest: false
  },
  {
    feature: 'Update Research/Projects',
    admin: true,
    standard: false,
    guest: false
  },
  {
    feature: 'Update Site Settings (Banner, Create Accounts)',
    admin: true,
    standard: false,
    guest: false
  }
])

const isValidPassword = ref(false)
const isValidPasswordToCreate = ref(false)

const panel = ref<number[] | number>([0])
const bannerType = ref('Video')
const selectedBanner = ref<File|null>(null)

const showSignInDialog = ref(false)

function changePassword () {
  loadingItem.value = 'changePassword'

  if (auth.currentUser != null) {
    updatePassword(auth.currentUser, newPassword.value).then(() => {
      alert('Password updated successfully.')
      newPassword.value = ''
      confirmPassword.value = ''
    }).catch((e: Error) => {
      alert(`An error occured while updating the password: ${e.message}`)
    }).finally(() => {
      loadingItem.value = ''
    })
  } else {
    alert('No user is currently signed in.')
    loadingItem.value = ''
  }
}

function createUser () {
  loadingItem.value = 'createUser'

  createUserWithEmailAndPassword(auth, email.value, passwordToCreate.value).then((userCredential) => {
    uidToCreate.value = userCredential.user.uid
    alert('User created successfully.\nSwitched to the new user.')
    email.value = ''
    passwordToCreate.value = ''
    confirmPasswordToCreate.value = ''
    loadingItem.value = isAdmin.value ? 'createUser' : ''

    if (isAdmin.value) {
      showSignInDialog.value = true
    }
  }).catch((e: Error) => {
    alert(`An error occured while creating the user: ${e.message}`)
    loadingItem.value = ''
  })
}

function signIn () {
  isLoggingIn.value = true

  signInWithEmailAndPassword(auth, adminEmail.value, adminPassword.value)
    .then(() => {
      getDoc(doc(db, 'Users', auth.currentUser!.uid)).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (!data.isAdmin) {
            alert('The account you signed in with does not have administrator rights.')
          } else {
            grantAdminRights()
          }
        } else {
          alert('The account you signed in with does not have administrator rights.')
        }
      }).catch((e: Error) => {
        alert(`An error occured while verifying admin rights: ${e.message}`)
        isLoggingIn.value = false
      }).finally(() => {
        adminEmail.value = ''
        adminPassword.value = ''
        isLoggingIn.value = false
      })
    })
    .catch((e: Error) => {
      alert(`An error occured while signing in: ${e.message}`)
      isLoggingIn.value = false
    })
}

function grantAdminRights () {
  setDoc(doc(db, 'Users', uidToCreate.value), {
    isAdmin: isAdmin.value
  }).then(() => {
    alert('User privileges have been elevated.')
    email.value = ''
    passwordToCreate.value = ''
    confirmPasswordToCreate.value = ''
    isAdmin.value = false
    adminEmail.value = ''
    adminPassword.value = ''
    uidToCreate.value = ''
    isLoggingIn.value = false
    showSignInDialog.value = false
  }).catch((e: Error) => {
    alert(`An error occured while creating the user document: ${e.message}`)
  }).finally(() => {
    loadingItem.value = ''
  })
}

function closeSignInDialog () {
  if (confirm('If you close this window, the user you just created will have standard user rights, not administrator rights.\nDo you want to continue?')) {
    showSignInDialog.value = false
  }
}

function withdraw () {
  if (auth.currentUser != null) {
    if (confirm('Are you sure you want to withdraw?\nThis action cannot be undone.')) {
      loadingItem.value = 'withdraw'
      const uid = auth.currentUser.uid

      getDoc(doc(db, 'Users', uid)).then((docSnap) => {
        if (docSnap.exists()) {
          deleteDoc(doc(db, 'Users', uid)).catch((e: Error) => {
            alert(`An error occured while deleting the user document: ${e.message}`)
          })
        }
      }).finally(() => {
        auth.currentUser!.delete().then(() => {
          alert('Your account has been withdrawn successfully.')
          loadingItem.value = ''
        }).catch((e: Error) => {
          alert(`An error occured while withdrawing the account: ${e.message}`)
          loadingItem.value = ''
        })
      })
    }
  } else {
    alert('No user is currently signed in.')
  }
}

function changeBanner () {
  if (selectedBanner.value === null) {
    alert('Please select a file first.')
  } else {
    loadingItem.value = 'banner'
    getDoc(doc(db, 'Banner', 'Contents'))
      .then((d) => {
        if (d.exists()) {
          const data = d.data()
          if (data.fileName !== undefined && data.fileName !== '') {
            const previousFileRef = storageRef(storage, `banner/${data.fileName}`)

            deleteObject(previousFileRef).catch((e: Error) => {
              console.log(`An error occured while deleting the previous banner file: ${e.message}`)
            }).then(() => {
              updateDoc(doc(db, 'Banner', 'Contents'), {
                type: bannerType.value,
                fileName: selectedBanner.value?.name
              }).then(() => {
                const data = storageRef(storage, `banner/${selectedBanner.value?.name}`)

                uploadBytes(data, selectedBanner.value!).then(() => {
                  alert('Banner updated successfully.')
                  selectedBanner.value = null
                }).catch((e: Error) => {
                  alert(`An error occured while uploading the file: ${e.message}`)
                }).finally(() => {
                  loadingItem.value = ''
                })
              }).catch((e: Error) => {
                alert(`An error occured while updating the document: ${e.message}`)
                loadingItem.value = ''
              })
            })
          }
        }
      })
  }
}

onkeyup = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && showSignInDialog.value && (adminEmail.value !== '' && adminPassword.value !== '')) {
    signIn()
  } else if (e.key === 'Enter' && !showSignInDialog.value && newPassword.value === confirmPassword.value && isValidPassword.value && (panel.value === 0 || panel.value[0] === 0)) {
    changePassword()
  } else if (e.key === 'Enter' && !showSignInDialog.value && email.value.includes('@') && passwordToCreate.value === confirmPasswordToCreate.value && isValidPasswordToCreate.value && panel.value === 1) {
    createUser()
  }
}

watch(newPassword, () => {
  validatePassword(auth, newPassword.value)
    .then(status => {
      isValidPassword.value = status.isValid
    })
})

watch(passwordToCreate, () => {
  validatePassword(auth, passwordToCreate.value)
    .then(status => {
      isValidPasswordToCreate.value = status.isValid
    })
})

watch(bannerType, () => {
  selectedBanner.value = null
})

watch(showSignInDialog, (newVal) => {
  if (!newVal) {
    if (loadingItem.value === 'createUser') {
      loadingItem.value = ''
      isAdmin.value = false
      loadingItem.value = ''
      adminEmail.value = ''
      adminPassword.value = ''
    }
  }
})

onAuthStateChanged(auth, (user) => {
  if (user === null && !showSignInDialog.value) {
    window.location.reload()
  }
})
</script>
