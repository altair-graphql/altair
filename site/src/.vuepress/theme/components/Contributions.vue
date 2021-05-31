<template>
  <div class="contributions">

    <template
      v-if="opencollectiveUrl"
    >
      <h3>Contributors</h3>
      <p>This project exists thanks to all the people who contribute.</p>

      <div class="oc-image-wrapper">
        <a
          :href="getOpencollectiveUrl('/contributors')"
        >
          <img
            :src="getOpencollectiveUrl('/contributors.svg?width=890')"
          />
        </a>
      </div>

      <h3>Backers</h3>

      <p>
        Thank you to all our backers! 🙏 (<a :href="getOpencollectiveUrl('#backer')" target="_blank">Become a backer</a>)
      </p>

      <div class="oc-image-wrapper">
        <a :href="getOpencollectiveUrl('#backers')" target="_blank"><img :src="getOpencollectiveUrl('/backers.svg?width=500')"></a>
      </div>


      <h3>Sponsors</h3>

      <p>
        Support this project by becoming a sponsor. Your logo will show up here with a link to your website. (<a :href="getOpencollectiveUrl('#sponsor')" target="_blank">Become a sponsor</a>)
      </p>

      <div class="oc-image-wrapper">
        <a :href="getOpencollectiveUrl('#sponsors')" target="_blank"><img :src="getOpencollectiveUrl('/sponsors.svg?width=500')"></a>
      </div>
    </template>

    <a
      v-if="opencollectiveUrl"
      track-category="donate_to_open_collective"
      track-label="."
      :href="getOpencollectiveUrl('/donate')"
      target="_blank"
    >
      <img :src="getOpencollectiveUrl('/donate/button@2x.png?color=blue')" width=300 alt="donate" />
    </a>
    <div
      v-if="buymeacoffeeUrl"
    >
        <style>.bmc-button img{width: 27px !important;margin-bottom: 1px !important;box-shadow: none !important;border: none !important;vertical-align: middle !important;}.bmc-button{line-height: 36px !important;height:37px !important;text-decoration: none !important;display:inline-flex !important;color:#ffffff !important;background-color:#BB5794 !important;border-radius: 3px !important;border: 1px solid transparent !important;padding: 1px 9px !important;font-size: 22px !important;letter-spacing:0.6px !important;box-shadow: 0px 1px 2px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;margin: 0 auto !important;font-family:'Cookie', cursive !important;-webkit-box-sizing: border-box !important;box-sizing: border-box !important;-o-transition: 0.3s all linear !important;-webkit-transition: 0.3s all linear !important;-moz-transition: 0.3s all linear !important;-ms-transition: 0.3s all linear !important;transition: 0.3s all linear !important;}.bmc-button:hover, .bmc-button:active, .bmc-button:focus {-webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;text-decoration: none !important;box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;opacity: 0.85 !important;color:#ffffff !important;}</style>
        <link href="https://fonts.googleapis.com/css?family=Cookie" rel="stylesheet">
        <a track-category="buy_me_coffee" class="bmc-button" target="_blank" href="https://www.buymeacoffee.com/imolorhe"><img src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg" alt="Buy me a coffee"><span style="margin-left:5px">Buy me a coffee</span></a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Contributions',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    opencollectiveUrl() {
      return this.data.opencollective?.url?.replace(/\/$/, '');
    },
    buymeacoffeeUrl() {
      return this.data.buymeacoffee?.url;
    }
  },
  methods: {
    getOpencollectiveUrl(path = '') {
      if (!this.opencollectiveUrl) {
        return '';
      }

      if (!path) {
        return this.opencollectiveUrl;
      }

      return `${this.opencollectiveUrl}/${path.replace(/^\//, '')}`;
    }
  },
}
</script>

<style lang="stylus">
.contributions
  text-align center
  padding 20px 0
</style>