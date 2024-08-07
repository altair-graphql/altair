<script setup lang="ts">
import { computed } from 'vue';
import { useData } from '../composables/data';
import VPIconArrowRight from './icons/VPIconArrowRight.vue';
import VPIconPlusSquare from './icons/VPIconPlusSquare.vue';
import VPButton from './VPButton.vue';

const { frontmatter: fm } = useData();

interface Price {
  text?: string;
  free?: boolean;
  amount?: string;
  currency?: string;
  frequency?: string;
}
export interface PricingItem {
  title: string;
  recommended: boolean;
  price: Price;
  features: string[];
  action: {
    text: string;
    link: string;
  };
}

const pricing = computed(() => fm.value.pricing as PricingItem[]);
const grid = computed(() => {
  const length = fm.value.pricing.length;

  if (!length) {
    return;
  } else if (length === 2) {
    return 'grid-2';
  } else if (length === 3) {
    return 'grid-3';
  } else if (length % 3 === 0) {
    return 'grid-6';
  } else if (length > 3) {
    return 'grid-4';
  }
});
</script>

<template>
  <div v-if="pricing" class="Pricing" id="pricing">
    <div class="container">
      <h3 class="Pricing-title">Pricing designed for you</h3>
      <div class="items">
        <div v-for="item in pricing" :key="item.title" class="item" :class="[grid]">
          <div
            class="pricing-item"
            :class="{
              'pricing-item-recommended': item.recommended,
            }"
          >
            <div class="pricing-item-title">{{ item.title }}</div>
            <div class="pricing-item-price">
              <template v-if="item.price.free"> Free </template>
              <template v-else-if="item.price.text">
                {{ item.price.text }}
              </template>
              <template v-else>
                <span class="pricing-item-currency">{{ item.price.currency }}</span>
                {{ item.price.amount }}
                <span class="pricing-item-currency__subdued"
                  >per user/{{ item.price.frequency }}</span
                >
              </template>
            </div>
            <VPButton
              v-if="item.action"
              class="pricing-item-action"
              :text="item.action.text"
              :href="item.action.link"
              :theme="item.recommended ? 'brand' : 'alt'"
              :icon="item.recommended ? VPIconPlusSquare : undefined"
            />
            <ul class="pricing-item-features">
              <li v-for="feature in item.features" :key="feature">
                <VPIconArrowRight class="pricing-item-features-icon" />
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.Pricing {
  position: relative;
  padding: 0 24px;
}

.Pricing-title {
  margin: 40px 0;
  font-size: 36px;
  line-height: 1.5;
  font-weight: 600;
  text-align: center;
  color: var(--vp-c-brand-1);
  background: linear-gradient(45deg, var(--vp-c-brand-1), var(--vp-c-sponsor));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (min-width: 640px) {
  .Pricing {
    padding: 0 48px;
  }
}

@media (min-width: 960px) {
  .Pricing {
    padding: 0 64px;
  }
}

.container {
  margin: 0 auto;
  max-width: 1152px;
}

.items {
  display: flex;
  flex-wrap: wrap;
  margin: -8px;
}

.item {
  padding: 8px;
  width: 100%;
}

.pricing-item {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  height: 100%;
  background-color: var(--vp-c-bg-soft);
  transition:
    border-color 0.25s,
    background-color 0.25s;
}

.pricing-item:hover {
  border-color: var(--vp-c-brand-1);
}

.pricing-item-recommended {
  border-color: var(--vp-c-brand-1);
  scale: 1.05;
}

.pricing-item-title {
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 4px;
  background-color: var(--vp-c-default-soft);
  padding: 4px 8px;
  font-size: 14px;
}

.pricing-item-price {
  margin: 20px 0;
  font-size: 32px;
  font-weight: 600;
}

.pricing-item-currency {
  font-size: 20px;
  font-weight: 500;
}
.pricing-item-currency__subdued {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.pricing-item-action {
  margin-bottom: 20px;
}

.pricing-item-features li {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  gap: 8px;
}
.pricing-item-features-icon {
  width: 16px;
  color: var(--vp-c-brand-1);
  fill: var(--vp-c-brand-1);
}

@media (min-width: 640px) {
  .item.grid-2,
  .item.grid-4,
  .item.grid-6 {
    width: calc(100% / 2);
  }
}

@media (min-width: 768px) {
  .item.grid-2,
  .item.grid-4 {
    width: calc(100% / 2);
  }

  .item.grid-3,
  .item.grid-6 {
    width: calc(100% / 3);
  }
}

@media (min-width: 960px) {
  .item.grid-4 {
    width: calc(100% / 4);
  }
}
</style>
