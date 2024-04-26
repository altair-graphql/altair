import { initShareLink } from './share-link';
import { initLoginRedirect } from './login-redirect';
import { initOAuth2Action } from './oauth2-action';

const init = async () => {
  // Check for query parameter and decide action
  const searchParams = new URLSearchParams(window.location.search);
  const action =
    searchParams.get('action') ?? window.location.pathname.split('/')[1];
  switch (action) {
    case 'share':
      initShareLink();
      break;
    case 'oauth2':
      await initOAuth2Action();
      break;
    default:
      await initLoginRedirect();
      break;
  }
};

init();
