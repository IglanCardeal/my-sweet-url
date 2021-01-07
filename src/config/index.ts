import mongodbConfig from './mongodb';
import redisConfig from './redis';
import jwtCondig from './jwt';

import { config } from 'dotenv';

config();

const APP_PORT = process.env.APP_PORT || 3000;
const { APP_HOST } = process.env;

export const applicationHost = APP_HOST;

export const mongodbDatabaseConnectionUri = mongodbConfig;

export const applicationPort = APP_PORT;

export const applicationEnviroment = process.env.NODE_ENV;

export const redisDatabaseConnectionUri = redisConfig;

export const JWT_PRIVATE_KEY = jwtCondig.PRIVATE_KEY;

export const JWT_PUBLIC_KEY = jwtCondig.PUBLIC_KEY;
