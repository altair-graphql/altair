import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { graphqlModuleConfig } from '../gql-module-options';

if (graphqlModuleConfig.typePaths && graphqlModuleConfig.definitions?.path) {
  const definitionsFactory = new GraphQLDefinitionsFactory();
  definitionsFactory.generate({
    typePaths: graphqlModuleConfig.typePaths,
    path: graphqlModuleConfig.definitions?.path,
    outputAs: graphqlModuleConfig.definitions.outputAs,
    watch: true,
    emitTypenameField: true,
  });
}
