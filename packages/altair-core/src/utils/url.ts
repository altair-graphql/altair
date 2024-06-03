export const urlWithParams = (url: string, params: Record<string, string>) => {
  const urlParams = new URLSearchParams(params);
  const u = new URL(url);
  return new URL(`${u.origin}${u.pathname}?${urlParams.toString()}`).toString();
};
