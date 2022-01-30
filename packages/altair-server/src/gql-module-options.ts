import { GqlModuleOptions } from '@nestjs/graphql';
import { join } from 'path';

export const graphqlModuleConfig: GqlModuleOptions = {
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/types/graphql.ts'),
    outputAs: 'class',
  },
};
