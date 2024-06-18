import axios from "axios";

export const typeDef = `#graphql
  extend type Query {
    """
    ## Test Heading
    **bold**
    - list1
    - list2
    
    Fields description
    """
    GOTCharacters(
      name: String,
      gender: String,
      culture: String,
      born: String,
      died: String,
      isAlive: Boolean
    ): [GOTCharacter] @deprecated(reason: "Use GOTCharacter instead")
  }

  """
  ID as MongoDB ObjectId
  
  ## Test Heading
  **bold**
  - list1
  - list2
  """
  type GOTCharacter {
    id: Int!
    url: String
    name: String
    gender: String
    culture: String
    born: String
    died: String
    titles: [String]
    aliases: [String]
    father: GOTCharacter
    mother: GOTCharacter
    spouse: GOTCharacter
    allegiances: [String]
    books: [String]
    playedBy: [String]
  }
`;

export const resolvers = {
  Query: {
    GOTCharacters: (root: any, args: any) =>
      axios
        .get(`https://www.anapioficeandfire.com/api/characters`, {
          params: args,
        })
        .then((res) => res.data),
  },
  GOTCharacter: {
    id(root: any) {
      return root.url.match(/\d+/g).pop();
    },
    father(root: any) {
      if (root.father) {
        return axios.get(root.father).then((res) => res.data);
      }
      return null;
    },
    mother(root: any) {
      if (root.mother) {
        return axios.get(root.mother).then((res) => res.data);
      }
      return null;
    },
    spouse(root: any) {
      if (root.spouse) {
        return axios.get(root.spouse).then((res) => res.data);
      }
      return null;
    },
  },
};
