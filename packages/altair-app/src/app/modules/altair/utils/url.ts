export const consumeQueryParam = (key: string) => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const value = urlSearchParams.get(key);
  urlSearchParams.delete(key);
  const params = urlSearchParams.toString();
  const newUrl = `${window.location.pathname}${params ? '?' : ''}${params}${window.location.hash}`;
  window.history.replaceState({}, '', newUrl);
  return value;
};
