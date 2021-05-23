<template>
  <div v-html="rendered" />
</template>

<script>
import marked from 'marked';

export default {
  name: 'Markdown',
  props: {
    markdown: {
      type: String,
      required: true,
    },
  },
  computed: {
    rendered() {
      return marked(this.markdown);
    },
  },
}
</script>
