<template>
<div class="board-item-scroll-row">
    <div v-for="item in itemList" :key="item.id">
        <v-card class="ml-3 mt-2 pa-2 rounded-xl" variant="outlined" :style="{ width: '250px' }">
            <v-card-title>
                <v-img
                :src="item.image"
                width="200px"
                height="300px"/>

                <div class="item-title" @click="onItemClick(item)">
                {{ item.title }}
                </div>
            </v-card-title>
            <v-card-subtitle> {{ item.date }} </v-card-subtitle>
        </v-card>
    </div>
</div>
</template>

<style scoped lang="scss">
.board-item-scroll-row {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;

  .item-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-title:hover{
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>

<script setup lang="ts">
import { CommonBoardItem } from '@/types/CommonBoardItem'

interface HomeBoardListItemProps {
    itemList: CommonBoardItem[];
}

interface HomeBoardListItemEmits {
    (e: 'on:itemClick', item: CommonBoardItem): void;
}

const props = defineProps<HomeBoardListItemProps>()
const emits = defineEmits<HomeBoardListItemEmits>()

function onItemClick (item: CommonBoardItem) {
  emits('on:itemClick', item)
}

</script>
