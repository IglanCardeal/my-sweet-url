import { config } from 'dotenv';

config();

// quando env de producao, o redis roda no container do docker
const databaseConnectionUri =
  process.env.NODE_ENV === 'development'
    ? process.env.REDIS_HOST || 'redis://127.0.0.1:6379'
    : process.env.PROD_REDIS_HOST || 'redis://my_sweet_redis:6379';

console.log('============REDIS SERVER============\n');
console.log(`*** Redis database URI: ${databaseConnectionUri}`);

export default databaseConnectionUri
