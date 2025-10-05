<template>
<div style="top: 72px; margin-bottom: 72px; position: relative;">
  <v-container>
    <div>
      <div>
        <HeaderComponent
          :title="'Downloads'"
        ></HeaderComponent>
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
        </div>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import HeaderComponent from '@/components/HeaderComponent.vue'
import { firestore as db } from '@/main'
import { getDoc, doc } from 'firebase/firestore'
import { onMounted, ref } from 'vue'

const isLoading = ref(true)

</script>
