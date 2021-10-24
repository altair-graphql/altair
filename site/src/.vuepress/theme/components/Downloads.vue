<template>
  <div
    v-if="$page.githubMetadata"
    class="releases"
  >
    <h3 class="heading">
      Get Altair
      <span class="releases--latest-version">{{ latestRelease.tag_name }}</span>
    </h3>
    <div class="wrapper">
      <div class="column">
        <div class="platforms">
          <div
            v-for="item in downloads.list"
            :key="item.name"
            class="platform-item"
          >
            <a
              class="platform-item__link"
              track-category="download_altair"
              :track-label="item.name"
              :href="getAssetUrl(item)"
              target="_blank"
            >
              <img
                :class="{'platform-item__unavailable': !getAssetUrl(item)}"
                :src="item.image"
              >
              <p class="platform-item__name">{{ item.name }}</p>
              <p v-if="!getAssetUrl(item)">coming soon</p>
            </a>
            <div
              v-if="item.extra"
              class="platform-item__extra"
            >
              {{ item.extra }}
            </div>
          </div>
        </div>
      </div>

      <a :href="githubMetadata.releases_url" class="button" target="_blank">See older versions</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Downloads',
  props: {
    downloads: {
      type: Object,
      required: true,
    }
  },
  computed: {
    githubMetadata() {
      return this.$page.githubMetadata;
    },
    latestRelease() {
      return this.githubMetadata?.latest_release;
    },
  },
  methods: {
    getAssetUrl(item) {
      if (!this.latestRelease) {
        return '';
      }

      return item.pattern ? this.latestRelease.assets.find(asset => new RegExp(item.pattern).test(asset.name))?.browser_download_url ?? item.link ?? '' : item.link ?? '';
    }
  }
}
</script>

<style lang="stylus">

  .releases
    background: $dark;
    padding: 50px 0;
    color: $light;
    text-align: center;

    .heading
      padding: 10px 0px;
      margin-bottom: 20px;
      font-size: 30px;

    .releases--latest-version
      display: block;
      font-size: 16px;
      font-weight: normal;

    .platforms
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      grid-gap: 50px;
      margin-bottom: 30px;

    .platform-item
      position: relative;
      transition: all .3s ease;
      border-radius: 10px;
      padding: 20px;
      border: 3px solid transparent;

      &:hover
        border-color: $primary-color;
        box-shadow: 10px 10px rgba($primary-color, .25);

      &__link
        text-decoration: none;

      &__unavailable
        opacity: .4;

      &__name
        text-transform: capitalize;

      &__extra
        text-align: center;
        font-size: 14px;
        opacity: .5;

  @media (min-width: $MQMobile)
    .releases
      .platforms
        grid-template-columns: repeat(3, 1fr);

</style>