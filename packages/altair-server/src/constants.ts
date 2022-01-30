export const constants = {
  database: {
    url: process.env.MONGODB_URL || 'localhost',
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
  },
  serverPort: process.env.ALTAIR_SERVER_PORT || 3000,
};
