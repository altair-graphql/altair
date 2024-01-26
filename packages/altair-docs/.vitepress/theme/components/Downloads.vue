<script setup lang="ts">
import { defineProps } from 'vue';
import { data as githubMetadata } from '../../plugins/github-metadata.data'
import VPButton from './VPButton.vue';

interface DownloadData {
  name: string;
  image: string;
  link: string;
  pattern: string;
  extra: string;
}
interface Props {
  downloads: {
    title: string;
    list: DownloadData[];
  }
}

const props = defineProps<Props>();

console.log('githubMetadata', githubMetadata);
const latestRelease = githubMetadata?.latest_release;

const getAssetUrl = (item: DownloadData) => {
  if (!latestRelease) {
    return '';
  }

  return item.pattern ? latestRelease.assets.find(asset => new RegExp(item.pattern).test(asset.name))?.browser_download_url ?? item.link ?? '' : item.link ?? '';
};
</script>

<template>
  <div
    v-if="githubMetadata"
    class="releases"
  >
    <h3 class="heading">
      Get Altair
      <span class="releases--latest-version">{{ latestRelease.tag_name }}</span>
    </h3>
    <div class="custom-wrapper">
      <div class="column">
        <div class="platforms">
          <div
            v-for="item in props.downloads.list"
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
                :alt="item.name"
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

      <VPButton
        tag="a"
        size="medium"
        :theme="'alt'"
        text="See older versions"
        :href="githubMetadata.releases_url"
      />
    </div>
  </div>
</template>

<style scoped>

  .releases {
    background: var(--vp-c-bg-soft);
    padding: 50px 0;
    color: var(--vp-c-text-1);
    text-align: center;
  }

  .heading {
    padding: 10px 0px;
    margin-bottom: 20px;
    font-size: 30px;
  }

  .releases--latest-version {
    display: block;
    font-size: 16px;
    font-weight: normal;
  }

  .platforms {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 50px;
    margin-bottom: 30px;
  }

  .platform-item {
    position: relative;
    transition: all .3s ease;
    border-radius: 10px;
    padding: 20px;
    border: 3px solid transparent;
  }

  .platform-item:hover {
    border-color: var(--vp-c-brand-3);
    box-shadow: 10px 10px rgba(var(--brand-rgb), .25);
  }

  .platform-item__link {
    text-decoration: none;
  }

  .platform-item__unavailable {
    opacity: .4;
  }

  .platform-item__name {
    text-transform: capitalize;
  }

  .platform-item__extra {
    text-align: center;
    font-size: 14px;
    opacity: .5;
  }

  .platform-item img {
    margin: 0 auto;
  }

  @media (min-width: 768px){
    .platforms {
      grid-template-columns: repeat(3, 1fr);
    }
  }

</style>