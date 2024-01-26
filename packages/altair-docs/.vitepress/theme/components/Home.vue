<script setup lang="ts">
import { withBase } from 'vitepress';
import { useData } from '../composables/data';
import Contributions from './Contributions.vue'
import Downloads from './Downloads.vue'
import HomeCarbonAds from './HomeCarbonAds.vue'
import VPButton from './VPButton.vue';

const { theme, frontmatter: fm } = useData()

</script>

<template>
  <main
    class="home"
    :aria-labelledby="fm.hero.text ? 'main-title' : undefined"
  >
    <header class="hero" v-if="fm.hero">
      <div class="custom-wrapper">
        <div class="column">

          <div class="hero-content">

            <h1
              v-if="fm.hero.text"
              id="main-title"
              class="main-title"
            >
              {{ fm.hero.text }}
            </h1>

            <p
              v-if="fm.hero.tagline !== null"
              class="description"
            >
              {{ fm.hero.tagline }}
            </p>

            <p
              v-if="fm.hero.actions?.length"
              class="hero-actions"
            >
              <VPButton
                v-for="action in fm.hero.actions"
                :key="action.link"
                tag="a"
                size="big"
                :theme="action.theme"
                :text="action.text"
                :href="action.link"
              />
            </p>

          </div>
          <div class="image-wrapper">
            <img
              v-if="fm.hero.image"
              :src="withBase(fm.hero.image.src)"
              :alt="fm.hero.image.alt ?? 'hero'"
            >
          </div>
        </div>
      </div>
    </header>

    <div
      v-if="fm.features && fm.features.length"
      class="features-section"
    >
      <div class="clear-floats"></div>

      <div class="custom-wrapper">
        <div class="column">
          <div class="features-wrapper">
            <div
              v-for="(feature, index) in fm.features"
              :key="index"
              class="feature"
            >
              <h2>{{ feature.title }}</h2>
              <p>{{ feature.details }}</p>
            </div>
          </div>

          <div
            v-if="fm.featuresFooterText && fm.featuresFooterLink"
            class="features-actions"
          >
            <VPButton
              tag="a"
              size="medium"
              :theme="'alt'"
              :text="fm.featuresFooterText"
              :href="fm.featuresFooterLink"
            />
          </div>
        </div>
      </div>
    </div>

    <Content class="theme-default-content custom" />

    <Contributions :data="fm.contributions" />

    <a name="download" id="download"></a>
    <Downloads :downloads="fm.downloads" />

    <div
      class="footer"
    >
      <HomeCarbonAds v-if="theme.carbonAds" :carbon-ads="theme.carbonAds" />
      <p class="made-by">
        Made by <a href="https://twitter.com/imolorhe" target="_blank">Samuel</a> with ❤️🇳🇬
      </p>
    </div>
  </main>
</template>

<style scoped>
.home {
  margin: 0px auto;
  display: block;
}
.home * {
  box-sizing: border-box;
}
.home .hero {
  text-align: center;
  height: auto;
  width: 100%;
  background: var(--vp-c-bg);
  /* color: var(--vp-c-white); */
}
.home .hero .main-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 10px;
}
.home .hero img {
  max-width: 100%;
  height: auto;
  display: block;
}
.home .hero .description {
  font-size: 22px;
  margin-top: 0;
  margin-bottom: 20px;
}
.home .hero .hero-content {
  margin: 0 auto;
  max-width: 650px;
  color: var(--vp-c-text-1);
  padding: 100px 0 30px;
  text-align: center;
}
.home .hero-actions {
  display: flex;
  gap: 5px;
  justify-content: center;
}
.home .hero .image-wrapper {
  margin: 30px 0;
  overflow: hidden;
  border-radius: 5px;
  box-shadow: 10px 10px var(--vp-c-gray-soft);
  font-size: 0;
}
.home .features-section {
  background-image: url("/assets/img/hero_bg.png");
  background-position: center;
  background-color: #7ebc59;
}
.home .features-wrapper {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 20px;
  margin-bottom: 30px;
}
.home .feature {
  background: var(--vp-c-bg);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 10px 10px var(--vp-c-gray-soft);
}
.home .feature h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  margin-bottom: 10px;
  border: none;
}
.home .feature p {
  margin: 0;
  font-size: 14px;
}
.home .features-actions {
  text-align: center;
  padding: 20px;
}
.home .footer {
  padding: 2.5rem;
  /* border-top: 1px solid $border; */
  text-align: center;
  /* color: lighten($text, 25%); */
}
.made-by {
  margin: 10px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
@media (min-width: 768px) {
  .home .hero {
    height: 700px;
  }
  .home .features-wrapper {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* // .action-button
//   display inline-block
//   font-size 1.2rem
//   color #fff
//   background-color $accentColor
//   padding 0.8rem 1.6rem
//   border-radius 4px
//   transition background-color .1s ease
//   box-sizing border-box
//   border-bottom 1px solid darken($accentColor, 10%)
//   &:hover
//     background-color lighten($accentColor, 10%) */
</style>
