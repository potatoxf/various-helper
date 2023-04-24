<template>
  <iframe style="height: 100%;width: 100%" v-if="link" v-bind:src="link"></iframe>
</template>
<script setup lang="ts">
import {defineProps, ref} from "vue";

const props = defineProps<{
  url: string
}>();

const link = ref(props.url);

function changeUrl(url: string) {
  if (url) {
    link.value = url;
  }
}

defineExpose({
  changeUrl
});
</script>
<style scoped>
</style>
