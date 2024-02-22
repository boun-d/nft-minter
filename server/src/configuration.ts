export const configuration = () => ({
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  JWT_SECRET: process.env.JWT_SECRET,
  MONGODB_CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING,
  IPFS_GATEWAY_SECRET: process.env.IPFS_GATEWAY_SECRET,
});
