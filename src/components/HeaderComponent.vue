<template>
<div
    class="text-h4 font-weight-medium "
    :style="{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    }">

    <div :style="{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      verticalAlign: 'middle',
      alignContent: 'center'
    }">
        <v-btn
            v-if="props.showLeadingBtn"
            variant="text"
            @click="emit('on-leading-btn-click')"
        >
            <font-awesome-icon :icon="props.leadingIcon" size="2x"/>
        </v-btn>

        {{ props.title }}
    </div>

    <v-btn
        v-if="isSignedIn && props.showTrailingBtn && !props.showProgress"
        variant="tonal"
        @click="emit('on-click')"
    >
        <font-awesome-icon :icon="props.trailingIcon"/>
    </v-btn>

    <v-progress-circular
      v-else-if="props.showProgress"
      indeterminate
      color="primary"/>
</div>

<v-divider class="mt-2 mb-2"/>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref } from 'vue'
import { auth } from '@/main'
import { onAuthStateChanged } from 'firebase/auth'

const props = defineProps({
  title: String,
  showLeadingBtn: {
    type: Boolean,
    default: false
  },
  leadingIcon: {
    type: String,
    default: 'fa-solid fa-arrow-left'
  },
  showTrailingBtn: {
    type: Boolean,
    default: true
  },
  trailingIcon: {
    type: String,
    default: 'fa-solid fa-add'
  },
  showProgress: {
    type: Boolean,
    default: false
  }
})

const isSignedIn = ref(false)

const emit = defineEmits(['on-click', 'on-leading-btn-click'])

onAuthStateChanged(auth, () => {
  isSignedIn.value = auth.currentUser !== null
})
</script>
