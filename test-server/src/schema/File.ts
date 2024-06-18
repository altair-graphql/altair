const fileRepository = [];

const fakePath = (filename = "") => `x/y/z/${filename}`;

const processUpload = async (file: File) => {
  const fileMetadata = {
    filename: file.name,
    mimetype: file.type,
    encoding: "??",
    filepath: fakePath(file.name),
  };

  fileRepository.push(fileMetadata);
  return fileMetadata;
};

export const typeDef = `#graphql
  extend type Query {
    files: [MyFile]
  }

  extend type Mutation {
    singleUpload(file: File!): MyFile
    multipleUploads(files: [File!]!): [MyFile]
  }

  """
  MyFile **files** \`file?\`
  """
  type MyFile {
    filename: String!
    mimetype: String!
    encoding: String!
    filepath: String!
  }
`;

export const resolvers = {
  Mutation: {
    async singleUpload(root: any, { file }: { file: File }) {
      return processUpload(file);
    },
    async multipleUploads(root: any, { files }: { files: File[] }) {
      return await Promise.all(files.map(processUpload));
    },
  },
};
