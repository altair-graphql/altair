<script setup lang="ts">
import { computed } from 'vue';

interface RecommendedByItem {
  name: string;
  logo: string;
  url: string;
}

interface Props {
  data: {
    title?: string;
    subtitle?: string;
    list: RecommendedByItem[];
  };
}

const props = defineProps<Props>();
const title = computed(() => props.data.title || 'Recommended By');
const subtitle = computed(() => props.data.subtitle || '');
</script>

<template>
  <div v-if="props.data.list && props.data.list.length" class="recommended-by">
    <h3 class="section-title">{{ title }}</h3>
    <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
    
    <div class="recommended-by-grid">
      <a
        v-for="item in props.data.list"
        :key="item.name"
        :href="item.url"
        :title="item.name"
        target="_blank"
        rel="noopener noreferrer"
        class="recommended-by-item"
      >
        <img
          :src="item.logo"
          :alt="item.name"
          class="recommended-by-logo"
        />
      </a>
    </div>
  </div>
</template>

<style scoped>
.recommended-by {
  text-align: center;
  padding: 50px 20px;
  background: var(--vp-c-bg);
}

.section-title {
  margin: 20px 0 10px;
  font-size: 28px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.section-subtitle {
  margin-bottom: 30px;
  color: var(--vp-c-text-2);
  font-size: 16px;
}

.recommended-by-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  max-width: 900px;
  margin: 0 auto;
  align-items: center;
  justify-items: center;
}

.recommended-by-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 0.7;
  width: 100%;
  height: 100%;
}

.recommended-by-item:hover {
  transform: scale(1.05);
  opacity: 1;
}

.recommended-by-logo {
  max-width: 180px;
  max-height: 80px;
  width: auto;
  height: auto;
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}

.recommended-by-item:hover .recommended-by-logo {
  filter: grayscale(0%);
}

@media (min-width: 640px) {
  .recommended-by-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 960px) {
  .recommended-by-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
  }
}
</style>
