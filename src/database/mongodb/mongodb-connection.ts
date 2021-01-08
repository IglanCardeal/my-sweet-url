import monk, { IMonkManager } from 'monk';

import { mongodbDatabaseConnectionUri } from '@config/index';

const db = monk(mongodbDatabaseConnectionUri);

const startDatabaseConnection = (): Promise<IMonkManager> => {
  console.clear();

  console.log('\n============DATABASE============\n');
  console.log(
    `*** Database connection successful.\n*** Database URI: ${mongodbDatabaseConnectionUri}`,
  );

  return db;
};

export { startDatabaseConnection, db };
