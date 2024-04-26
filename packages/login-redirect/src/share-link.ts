export const initShareLink = () => {
  const params = new URLSearchParams(window.location.search);
  const queryId = params.get('q');
  if (!queryId) {
    throw new Error('No query id provided!');
  }

  // TODO: Add support for other clients (browser extensions, web clients, etc)
  location.replace(`altair://share?q=${encodeURIComponent(queryId)}`);
};
