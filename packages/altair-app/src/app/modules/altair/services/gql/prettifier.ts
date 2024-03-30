export const prettify = async (query: string, tabWidth = 2) => {
  const prettier = await import('prettier/standalone');
  const prettierGraphql = await import('prettier/plugins/graphql');
  // return print(parse(query));
  return prettier.format(query, {
    parser: 'graphql',
    plugins: [prettierGraphql.default],
    tabWidth,
  });
};
