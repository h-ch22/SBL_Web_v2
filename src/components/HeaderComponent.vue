<template>
<div
    class="text-h4 font-weight-medium "
    :style="{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    }">
    {{ props.title }}

    <v-btn
        v-if="auth.currentUser !== null && props.showTrailingBtn && !props.showProgress"
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
import { defineProps, defineEmits } from 'vue'
import { auth } from '@/main'

const props = defineProps({
  title: String,
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

const emit = defineEmits(['on-click'])
</script>
