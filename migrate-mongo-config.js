const dotenv = require('dotenv');

const mongodbDatabaseConnectionUri = require('./src/config/migrations-config/index');


dotenv.config();

const { DB_HOST, DB_PORT, DB_NAME } = process.env;
const DB_URL = `${DB_HOST}:${DB_PORT}/${DB_NAME}`;

console.log(mongodbDatabaseConnectionUri, DB_URL);

const config = {
  mongodb: {
    url: `mongodb://${mongodbDatabaseConnectionUri}`,

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "./src/database/mongodb/migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog",

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: ".js"
};

// Return the config as a promise
module.exports = config;
