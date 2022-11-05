export function lineCommentRegex() {
  return /(?:^|\s)\/\/(.+?)$/gms;
}

export function blockCommentRegex() {
  return /\/\*(.*?)\*\//gms;
}

export function commentRegex() {
  return new RegExp(
    `(?:${lineCommentRegex().source})|(?:${blockCommentRegex().source})`,
    'gms'
  );
}
