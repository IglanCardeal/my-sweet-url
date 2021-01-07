import { config } from 'dotenv';

config();

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  PROD_DB_HOST,
  PROD_DB_PORT,
  PROD_DB_NAME,
} = process.env;

const developmentDatabase = `${DB_HOST}:${DB_PORT}/${DB_NAME}`;
const productionDatabase = `${PROD_DB_HOST}:${PROD_DB_PORT}/${PROD_DB_NAME}`;

const databaseConnectionUri =
  process.env.NODE_ENV === 'development'
    ? developmentDatabase
    : productionDatabase;

export default databaseConnectionUri;
