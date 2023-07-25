type Boundaries = { start: number; end: number };

export function getValueBoundariesInStringifiedJson(
  json: string,
  key: string
): Boundaries {
  const validValues = '[0-9]+|"(?:\\\\.|[^\\\\"])*"|true|false|null';
  const matcher = new RegExp(`"${key}"\\s*:\\s*(${validValues}),?`);

  const match = matcher.exec(json) as RegExpExecArray;
  const matchedStr = match[1] as string;

  return {
    start: match.index + match[0].indexOf(matchedStr),
    end: match.index + match[0].indexOf(matchedStr) + matchedStr.length,
  };
}
