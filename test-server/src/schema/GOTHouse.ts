import axios from "axios";

export const typeDef = `#graphql
  extend type Query {
    GOTHouses(
      name: String
    ): [GOTHouse]
  }
  type GOTHouse {
    id: Int!
    url: String
    name: String
    region: String
    titles: [String]
    seats: [String]
    words: String
    overlord: GOTHouse
    swornMembers: [GOTCharacter]
  }
`;

export const resolvers = {
  Query: {
    GOTHouses: (root: any, args: any) =>
      axios
        .get(`https://www.anapioficeandfire.com/api/houses`, { params: args })
        .then((res) => res.data),
  },
  GOTHouse: {
    id(root: any) {
      return root.url.match(/\d+/g).pop();
    },
    overlord(root: any) {
      if (root.overlord) {
        return axios.get(root.overlord).then((res) => res.data);
      }
      return null;
    },
    swornMembers(root: any) {
      if (root.swornMembers && root.swornMembers.length) {
        return Promise.all(
          root.swornMembers
            // Limit to the first 5 swornMembers. Don't overload the API!
            .filter((_: any, i: number) => i < 5)
            .map(axios.get)
        ).then((swornMembersRes) => {
          return swornMembersRes.map(
            (swornMemberRes: any) => swornMemberRes.data
          );
        });
      }
      return null;
    },
  },
};
