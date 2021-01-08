import { startDatabaseConnection } from '@database/mongodb/mongodb-connection';

import { applicationPort, applicationEnviroment } from '@config/index';

import activeAliasEvents from '@subscribers/index';

import app from './app';

const startServer = () => {
  app.listen(applicationPort, () => {
    console.log(
      `\nServer running on http://localhost:${applicationPort}\nENV: ${applicationEnviroment}`,
    );

    if (applicationEnviroment === 'production') {
      console.log = () => {}; // para nao exibirmos nenhum log em producao
    }

    // Inicia os eventos
    // Emite o evento para alimentar o cache com os alias/urls
    activeAliasEvents();
  });
};

startDatabaseConnection().then(startServer);
