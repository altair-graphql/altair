import './styles/vars.css';
import './styles/base.css';
import './styles/utils.css';
import './styles/components/custom-block.css';
import './styles/components/vp-code.css';
import './styles/components/vp-code-group.css';
import './styles/components/vp-doc.css';
import './styles/components/vp-sponsor.css';

import type { Theme } from 'vitepress';
import VPBadge from './components/VPBadge.vue';
import Markdown from './components/Markdown.vue';
import Layout from './Layout.vue';

export { default as VPBadge } from './components/VPBadge.vue';
export { default as VPImage } from './components/VPImage.vue';
export { default as VPButton } from './components/VPButton.vue';
export { default as VPHomeHero } from './components/VPHomeHero.vue';
export { default as VPHomeFeatures } from './components/VPHomeFeatures.vue';
export { default as VPHomeSponsors } from './components/VPHomeSponsors.vue';
export { default as VPDocAsideSponsors } from './components/VPDocAsideSponsors.vue';
export { default as VPSponsors } from './components/VPSponsors.vue';
export { default as VPTeamPage } from './components/VPTeamPage.vue';
export { default as VPTeamPageTitle } from './components/VPTeamPageTitle.vue';
export { default as VPTeamPageSection } from './components/VPTeamPageSection.vue';
export { default as VPTeamMembers } from './components/VPTeamMembers.vue';
import { useRoute } from 'vitepress';
import mediumZoom from 'medium-zoom';
import { onMounted, watch, nextTick } from 'vue';

export { useSidebar } from './composables/sidebar';
export { useLocalNav } from './composables/local-nav';

const theme: Theme = {
  Layout,
  enhanceApp: ({ app }) => {
    app.component('Badge', VPBadge);
    app.component('Markdown', Markdown);
  },
  setup() {
    const route = useRoute();
    const initZoom = () => {
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' });
    };
    onMounted(() => {
      initZoom();
    });
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    );
  },
};

export default theme;
