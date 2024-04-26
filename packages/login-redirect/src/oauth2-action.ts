import { EVENT_TYPES, OAuth2Client } from 'altair-graphql-core/build/oauth2';
import {
  closeWindow,
  getValidSource,
  isValidOpener,
  onMessage,
  sendMessage,
} from './helpers';

const OAUTH2_CLIENT_OPTIONS_KEY = 'altairgql:oauth2:client_options';
const OAUTH2_SOURCE_KEY = 'altairgql:oauth:source';

export const initOAuth2Action = async () => {
  // CASE: Redirect from the authorization server
  if (await handleRedirectResponse()) {
    return;
  }

  // CASE: new authorization flow
  const source = getValidSource();
  if (source) {
    sessionStorage.setItem(OAUTH2_SOURCE_KEY, source);
  }

  // Listen for the oauth2 action message from the parent window
  onMessage(async (event) => {
    const { type, payload } = event.data;
    if (type !== EVENT_TYPES.ACTION) {
      return;
    }

    // Save the client options to session storage
    sessionStorage.setItem(OAUTH2_CLIENT_OPTIONS_KEY, JSON.stringify(payload));

    const client = new OAuth2Client(payload);

    // Get the authorization url and redirect to it
    const authorizationUrl = await client.getAuthorizationUrl();
    location.replace(authorizationUrl);
  });

  // Send ready message to the parent window
  sendMessage(
    { type: EVENT_TYPES.FRAME_READY },
    sessionStorage.getItem(OAUTH2_SOURCE_KEY) ?? undefined
  );
};

const handleRedirectResponse = async () => {
  // Get the client options from session storage
  const clientOptionsData = sessionStorage.getItem(OAUTH2_CLIENT_OPTIONS_KEY);
  if (!clientOptionsData) {
    return;
  }

  const client = new OAuth2Client(JSON.parse(clientOptionsData));

  // Check if this is a redirect from the authorization server and get the code
  const redirectResponse = await client.getAuthorizationRedirectResponse();
  if (redirectResponse) {
    if (isValidOpener(window.opener)) {
      sendMessage(
        {
          type: EVENT_TYPES.AUTHORIZATION_CODE,
          payload: redirectResponse,
        },
        sessionStorage.getItem(OAUTH2_SOURCE_KEY) ?? undefined
      );
      closeWindow();
      return true;
    }

    // TODO: handle desktop app flow
    // await fetch('/callback', {
    //   method: 'post',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(payload),
    // });
    closeWindow();
    return true;
  }
};
