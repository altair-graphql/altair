declare module 'codemirror-graphql';
declare module 'codemirror-graphql/utils/getTypeInfo';
declare module 'codemirror-graphql/utils/collectVariables' {
  const fn: (...args: any[]) => Record<any, any>;
  export default fn;
}
