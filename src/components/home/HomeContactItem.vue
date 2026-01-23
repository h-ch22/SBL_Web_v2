<template>
<div class="mb-2 contact-item">
  <div class="item-container">
    <font-awesome-icon :icon="props.icon"/>
    <div class="ml-2">
      {{ props.label }}
    </div>
  </div>

  <v-btn variant="text" @click="emits('on:click')">
    <font-awesome-icon :icon="props.icon" class="mr-1"/>
  </v-btn>
</div>
</template>

<style scoped lang="scss">
.contact-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  text-align: left;

  .item-container {
    display: flex;
    flex-direction: row;
    align-content: flex-start;
    align-items: center;
  }
}
</style>

<script setup lang="ts">
interface HomeContactItemProps {
    icon: string;
    label: string;
}

interface HomeContactItemEmits {
    (e: 'on:click'): void;
}

const props = defineProps<HomeContactItemProps>()
const emits = defineEmits<HomeContactItemEmits>()

</script>
