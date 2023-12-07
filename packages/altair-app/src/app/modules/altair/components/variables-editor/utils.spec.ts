import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLString,
} from 'graphql';
import { vttToJsonSchema } from './utils';

describe('utils', () => {
  describe('vttToJsonSchema', () => {
    // https://graphql.org/graphql-js/type/#graphqlinputobjecttype
    it('converts variabltToType to a JSONSchema7 object', () => {
      const TestCustomScalar = new GraphQLScalarType({
        name: 'TestCustomScalar',
        serialize(value: unknown) {
          return value;
        },
      });
      const TestFriendType = new GraphQLInputObjectType({
        name: 'TestFriend',
        fields: {
          name: { type: GraphQLString },
          age: { type: GraphQLInt, defaultValue: 0 },
        },
      });
      const TestColorEnum = new GraphQLEnumType({
        name: 'TestColor',
        values: {
          RED: { value: 'red', description: 'The color of blood' },
          GREEN: { value: 'green', description: 'The color of grass' },
          BLUE: { value: 'blue', description: 'The color of the sky' },
        },
      });
      const TestInputType = new GraphQLInputObjectType({
        name: 'TestInput',
        fields: {
          id: { type: new GraphQLNonNull(GraphQLID), description: 'The id' },
          name: { type: GraphQLString, description: 'The name' },
          location: {
            type: new GraphQLNonNull(GraphQLString),
            defaultValue: 'Earth',
          },
          age: { type: GraphQLInt },
          isHuman: { type: GraphQLBoolean },
          height: { type: GraphQLFloat, defaultValue: 1.75 },
          friends: { type: new GraphQLList(GraphQLString), defaultValue: [] },
          favoriteColor: { type: new GraphQLNonNull(TestColorEnum) },
          allergies: {
            type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
            defaultValue: [],
          },
          bestFriend: { type: TestFriendType },
          customScalar: { type: TestCustomScalar },
        },
      });
      const res = vttToJsonSchema({
        myvar: TestInputType,
      });

      expect(res).toMatchSnapshot();
    });
  });
});
