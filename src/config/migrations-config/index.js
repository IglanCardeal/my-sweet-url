const { config } = require('dotenv');

config();

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

const developmentDatabase = `${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const databaseConnectionUri = developmentDatabase;

module.exports = databaseConnectionUri;
