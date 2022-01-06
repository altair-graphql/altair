export const hashConstants = {
  saltRounds: 10,
};

export const auth0Constants = {
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  callbackURL: process.env.AUTH0_CALLBACK_URL,
  audience: process.env.AUTH0_AUDIENCE,
};
console.log(auth0Constants);
