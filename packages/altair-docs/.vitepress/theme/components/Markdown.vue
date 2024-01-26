<script setup lang="ts">
import { marked } from 'marked';
import { computed } from 'vue';

interface Props {
  markdown: string
}
const props = defineProps<Props>()

const rendered = computed(
  () => marked.parse(props.markdown)
)
</script>
<template>
  <div v-html="rendered" />
</template>
