<template>
<div style="top: 72px; margin-bottom: 72px; position: relative;">
  <v-container>
    <div :style="{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      alignContent: 'center',
    }">
        <div class="text-h4 font-weight-medium">
            <font-awesome-icon icon="fa-solid fa-warning"/>
            {{ 'Page Not Found' }}
        </div>

        <div class="text-caption">
            {{ 'The page you are looking for does not exist or has been moved.' }}
        </div>

        <div class="mt-2">
            <v-btn @click="router.push('/')" variant="tonal">
                <font-awesome-icon icon="fa-solid fa-home" class="mr-1"/>
                Go to Homepage
            </v-btn>

            <v-btn class="ml-2" @click="router.back()" variant="tonal" color="tertiary">
                <font-awesome-icon icon="fa-solid fa-arrow-left" class="mr-1"/>
                Go Back
            </v-btn>
        </div>

    </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

</script>
