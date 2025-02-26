<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  data: {
    opencollective?: {
      url: string;
    };
    buymeacoffee?: {
      url: string;
    };
  };
}
const props = defineProps<Props>();
const opencollectiveUrl = computed(() =>
  props.data.opencollective?.url?.replace(/\/$/, '')
);
const buymeacoffeeUrl = computed(() => props.data.buymeacoffee?.url);
const getOpencollectiveUrl = (path = '') => {
  if (!opencollectiveUrl.value) {
    return '';
  }

  if (!path) {
    return opencollectiveUrl.value;
  }

  return `${opencollectiveUrl.value}/${path.replace(/^\//, '')}`;
};
</script>

<template>
  <div class="contributions">
    <template v-if="opencollectiveUrl">
      <h3 class="section-title">Contributors</h3>
      <p class="section-subtitle">
        This project exists thanks to all the people who contribute.
      </p>

      <div class="oc-image-wrapper">
        <a :href="getOpencollectiveUrl('/contributors')">
          <img
            :src="getOpencollectiveUrl('/contributors.svg?width=890')"
            alt="Contributors"
          />
        </a>
      </div>

      <h3 class="section-title">Backers</h3>

      <p class="section-subtitle">
        Thank you to all our backers! 🙏 (<a
          :href="getOpencollectiveUrl('#backer')"
          target="_blank"
          >Become a backer</a
        >)
      </p>

      <div class="oc-image-wrapper">
        <a :href="getOpencollectiveUrl('#backers')" target="_blank"
          ><img :src="getOpencollectiveUrl('/backers.svg?width=500')" alt="backers"
        /></a>
      </div>

      <h3 class="section-title">Sponsors</h3>

      <p class="section-subtitle">
        Support this project by becoming a sponsor. Your logo will show up here with
        a link to your website. (<a
          :href="getOpencollectiveUrl('#sponsor')"
          target="_blank"
          >Become a sponsor</a
        >)
      </p>

      <div class="oc-image-wrapper">
        <a :href="getOpencollectiveUrl('#sponsors')" target="_blank"
          ><img
            :src="getOpencollectiveUrl('/sponsors.svg?width=500')"
            alt="sponsors"
        /></a>
      </div>
    </template>

    <div class="donate-oc-wrapper" v-if="opencollectiveUrl">
      <a
        track-category="donate_to_open_collective"
        track-label="."
        :href="getOpencollectiveUrl('/donate')"
        target="_blank"
      >
        <img
          :src="getOpencollectiveUrl('/donate/button@2x.png?color=blue')"
          width="300"
          alt="donate"
        />
      </a>
    </div>
    <div v-if="buymeacoffeeUrl">
      <link href="https://fonts.googleapis.com/css?family=Cookie" rel="stylesheet" />
      <a
        track-category="buy_me_coffee"
        class="bmc-button"
        target="_blank"
        href="https://www.buymeacoffee.com/imolorhe"
        ><img
          src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg"
          alt="Buy me a coffee"
        /><span style="margin-left: 5px">Buy me a coffee</span></a
      >
    </div>
  </div>
</template>

<style scoped>
.contributions {
  text-align: center;
  padding: 20px 0;
}
.section-title {
  margin: 20px 0 0;
}
.section-subtitle {
  margin-bottom: 10px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.oc-image-wrapper img,
.donate-oc-wrapper img {
  margin: 0 auto;
}
.donate-oc-wrapper {
  margin: 10px 0;
}
.bmc-button img {
  width: 27px !important;
  margin-bottom: 1px !important;
  box-shadow: none !important;
  border: none !important;
  vertical-align: middle !important;
}
.bmc-button {
  line-height: 36px !important;
  height: 37px !important;
  text-decoration: none !important;
  display: inline-flex !important;
  color: #ffffff !important;
  background-color: #bb5794 !important;
  border-radius: 3px !important;
  border: 1px solid transparent !important;
  padding: 1px 9px !important;
  font-size: 22px !important;
  letter-spacing: 0.6px !important;
  /* box-shadow: 0px 1px 2px rgba(190, 190, 190, 0.5) !important; */
  /* -webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important; */
  margin: 0 auto !important;
  font-family: 'Cookie', cursive !important;
  -webkit-box-sizing: border-box !important;
  box-sizing: border-box !important;
  -o-transition: 0.3s all linear !important;
  -webkit-transition: 0.3s all linear !important;
  -moz-transition: 0.3s all linear !important;
  -ms-transition: 0.3s all linear !important;
  transition: 0.3s all linear !important;
}
.bmc-button:hover,
.bmc-button:active,
.bmc-button:focus {
  -webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;
  text-decoration: none !important;
  box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;
  opacity: 0.85 !important;
  color: #ffffff !important;
}
</style>
