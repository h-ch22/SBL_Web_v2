<template>
    <v-card class="pa-5">
      <v-card-title class="rounded-xl window-title-container">
        <div class="window-title">
          <div class="rounded-xl pa-2 title">
            {{ selectedItem.title }}
          </div>
          <v-btn class="close-button" color="red" variant="tonal" @click="emits('on:close')">
            <font-awesome-icon icon="fa-solid fa-xmark"/>
          </v-btn>
        </div>
      </v-card-title>

      <v-card-subtitle>
        {{ selectedItem.date }}
      </v-card-subtitle>

      <v-card-text>
        <div v-if="selectedItem.image !== '' && selectedItem.image !== undefined && selectedItem.image !== null">
          <v-img
            :src="selectedItem.image"
            height="40vh"
          />
        </div>

        <QuillEditor
          class="mt-2"
          v-model:content="contentsDelta"
          :options="{ readOnly: true, theme: 'bubble', modules: { toolbar: false } }"/>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn v-if="isSignedIn && isAdmin" @click="emits('on:update', selectedItem)">
          <font-awesome-icon icon="fa-solid fa-edit"></font-awesome-icon>
        </v-btn>

        <v-btn v-if="isSignedIn && isAdmin" color="red" @click="emits('on:delete', selectedItem)">
          <font-awesome-icon icon="fa-solid fa-trash"></font-awesome-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
</template>

<style scoped lang="scss">
.window-title-container {
    word-break: break-word;
    white-space: pre-wrap;
    position: sticky;
    top: 0;
    background-color: transparent;
    z-index: 1000;

    .window-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;

        .title {
            max-width: 70%;
            word-break: break-word;
            backdrop-filter: blur(5px);
        }

        .close-button {
            margin-left: 16px;
            flex-shrink: 0;
        }
    }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import { CommonBoardItem } from '@/types/CommonBoardItem'
import { useAuthStore } from '@/stores/AuthStateStore'
import { storeToRefs } from 'pinia'

interface BoardItemModalProps {
    selectedItem: CommonBoardItem
}

interface BoardItemModalEmits {
    (e: 'on:close'): void;
    (e: 'on:update', value: CommonBoardItem): void;
    (e: 'on:delete', value: CommonBoardItem): void;
}

const { isSignedIn, isAdmin } = storeToRefs(useAuthStore())

const props = defineProps<BoardItemModalProps>()
const emits = defineEmits<BoardItemModalEmits>()
const contentsDelta = ref(props.selectedItem.contentsDelta)

</script>
