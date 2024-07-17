// https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them
const avgCharsPerToken = 5; // assumed average characters per token

export const maxTotalSessionTokens = 50000;

export const maxTotalChars = maxTotalSessionTokens * avgCharsPerToken;

export const maxMessageTokens = 300;
export const maxMessageChars = maxMessageTokens * avgCharsPerToken;

export const maxSdlTokens = 4096;
export const maxSdlChars = maxSdlTokens * avgCharsPerToken;

export const maxGraphqlQueryTokens = 1000;
export const maxGraphqlQueryChars = maxGraphqlQueryTokens * avgCharsPerToken;

export const maxGraphqlVariablesTokens = 150;
export const maxGraphqlVariablesChars = maxGraphqlVariablesTokens * avgCharsPerToken;
