import monk from 'monk';
import { config } from 'dotenv';

config();

const APP_PORT = process.env.APP_PORT || 3000;
const { DB_HOST, DB_PORT, DB_NAME } = process.env;
const DB_URL = `${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const db = monk(DB_URL);

const startDatabaseConnectionAndServer = (app: any): void => {
  db.then(() => {
    console.log(
      `\n*** Database connection successful.\n*** Database URI: ${DB_URL}`
    );

    app.listen(APP_PORT, () => {
      console.log(
        `\nServer running on http://localhost:${APP_PORT}\nENV: ${process.env.NODE_ENV}`
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
