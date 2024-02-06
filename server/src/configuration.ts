export const configuration = () => ({
    JWT_EXPIRY: process.env.JWT_EXPIRY,
    JWT_SECRET: process.env.JWT_SECRET,
    MONGODB_CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING,
    IPFS_PROJECT_ID: process.env.IPFS_PROJECT_ID,
    IPFS_PROJECT_SECRET: process.env.IPFS_PROJECT_SECRET
  });