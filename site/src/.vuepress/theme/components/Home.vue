<template>
  <main
    class="home"
    :aria-labelledby="data.heroText !== null ? 'main-title' : null"
  >
    <header class="hero">
      <div class="wrapper">
        <div class="column">

          <div class="hero-content">

            <h1
              v-if="data.heroText !== null"
              id="main-title"
              class="main-title"
            >
              {{ data.heroText || $title || 'Hello' }}
            </h1>

            <p
              v-if="data.tagline !== null"
              class="description"
            >
              {{ data.tagline || $description }}
            </p>

            <p
              v-if="data.actions && data.actions.length"
              class="action"
            >
              <NavLink
                v-for="action in data.actions"
                :key="action.text"
                :class="{
                  button: true,
                  'button--primary': action.primary
                }"
                :item="action"
              />
            </p>

          </div>
          <div class="image-wrapper">
            <img
              v-if="data.heroImage"
              :src="$withBase(data.heroImage)"
              :alt="data.heroAlt || 'hero'"
            >
          </div>
        </div>
      </div>
    </header>

    <div
      v-if="data.features && data.features.length"
      class="features-section"
    >
      <div class="clear-floats"></div>

      <div class="wrapper">
        <div class="column">
          <div class="features-wrapper">
            <div
              v-for="(feature, index) in data.features"
              :key="index"
              class="feature"
            >
              <h2>{{ feature.title }}</h2>
              <p>{{ feature.details }}</p>
            </div>
          </div>

          <div
            v-if="data.featuresFooterText && data.featuresFooterLink"
            class="features-actions"
          >
            <NavLink
              class="button button--dark"
              :item="{
                text: data.featuresFooterText,
                link: data.featuresFooterLink,
              }"
            />
          </div>
        </div>
      </div>
    </div>

    <Content class="theme-default-content custom" />

    <Contributions :data="data.contributions" />

    <a name="download" id="download"></a>
    <Downloads :downloads="data.downloads" />

    <div
      v-if="data.footer"
      class="footer"
    >
      {{ data.footer }}
    </div>
  </main>
</template>

<script>
import NavLink from '@theme/components/NavLink.vue';
import Contributions from '@theme/components/Contributions.vue';
import Downloads from '@theme/components/Downloads.vue';

export default {
  name: 'Home',

  components: {
    NavLink,
    Contributions,
    Downloads,
  },

  computed: {
    data () {
      return this.$page.frontmatter
    },

    actionLink () {
      return {
        link: this.data.actionLink,
        text: this.data.actionText
      }
    }
  }
}
</script>

<style lang="stylus">
.home
  *
    box-sizing border-box
  // padding $navbarHeight 0 0
  // max-width $homePageWidth
  margin 0px auto
  display block
  .hero
    text-align center
    height: auto;
    width: 100%;
    background: $dark;
    color $light
    .main-title
      font-size: 48px;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 10px;
    img
      max-width: 100%
      // max-height 280px
      height: auto
      display block
      // margin 3rem auto 1.5rem
    // h1
    //   font-size 3rem
    // h1, .description, .action
    //   margin 1.8rem auto
    .description
      font-size: 22px;
      margin-top 0
      margin-bottom: 20px;
    .action-button
      display inline-block
      font-size 1.2rem
      color #fff
      background-color $accentColor
      padding 0.8rem 1.6rem
      border-radius 4px
      transition background-color .1s ease
      box-sizing border-box
      border-bottom 1px solid darken($accentColor, 10%)
      &:hover
        background-color lighten($accentColor, 10%)
    .hero-content
      margin: 0 auto;
      max-width: 650px;
      color: $light;
      padding: 100px 0 30px;
      text-align: center;
    .image-wrapper
      margin: 30px 0;
      overflow: hidden;
      border-radius: 5px;
      // box-shadow: 0 0 25px -5px rgba(0, 0, 0, .1);
      box-shadow: 10px 10px rgba(255, 255, 255, .25);
      font-size: 0;
  .features-section
    background-image: url(/assets/img/hero_bg.png);
    background-position: center;
    background-color: #7EBC59;
  .features-wrapper
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 20px;
    margin-bottom: 30px;
  .feature
    background: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 10px 10px rgba(255, 255, 255, .25);
    h2
      font-size: 22px;
      font-weight: 500;
      margin 0
      margin-bottom: 5px;
      border none
    p
      margin 0

  .features-actions
    text-align center
    padding 20px
  .footer
    padding 2.5rem
    border-top 1px solid $borderColor
    text-align center
    color lighten($textColor, 25%)

@media (min-width: $MQMobile)
  .home
    .hero
      height 700px
    .features-wrapper
      grid-template-columns: repeat(3, 1fr);
</style>
