import monk from 'monk';

import {
  mongodbDatabaseConnectionUri,
  applicationPort,
  applicationEnviroment,
} from '@config/index';

const db = monk(mongodbDatabaseConnectionUri);

const startDatabaseConnectionAndServer = (app: any): void => {
  db.then(() => {
    console.clear();

    console.log('\n============DATABASE============\n');
    console.log(
      `*** Database connection successful.\n*** Database URI: ${mongodbDatabaseConnectionUri}`,
    );

    app.listen(applicationPort, () => {
      console.log(
        `\nServer running on http://localhost:${applicationPort}\nENV: ${applicationEnviroment}`,
      );

      if (applicationEnviroment === 'production') {
        console.log = () => {}; // para nao exibirmos nenhum log em producao
      }
    });
  }).catch(error => {
    console.log(`\nUnable to start the server duo:\n`, error);
  });
};

export { startDatabaseConnectionAndServer, db };
