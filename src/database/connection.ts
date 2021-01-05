import monk from 'monk';
import { config } from 'dotenv';

config();

const APP_PORT = process.env.APP_PORT || 3000;
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

const connectionUri =
  process.env.NODE_ENV === 'development'
    ? developmentDatabase
    : productionDatabase;

const db = monk(connectionUri);

const startDatabaseConnectionAndServer = (app: any): void => {
  db.then(() => {
    console.clear();

    console.log('\n============DATABASE============\n');
    console.log(
      `*** Database connection successful.\n*** Database URI: ${developmentDatabase}`,
    );

    app.listen(APP_PORT, () => {
      console.log(
        `\nServer running on http://localhost:${APP_PORT}\nENV: ${process.env.NODE_ENV}`,
      );

      if (process.env.NODE_ENV === 'production') {
        console.log = () => {}; // para nao exibirmos nenhum log em producao
      }
    });
  }).catch(error => {
    console.log(`\nUnable to start the server duo:\n`, error);
  });
};

export { startDatabaseConnectionAndServer, db };
