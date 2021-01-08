import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import publicRoutes from '@routes/public.routes';
import userRoutes from '@routes/user.routes';
import signupLoginRoutes from '@routes/signup-login.routes';

import { startDatabaseConnectionAndServer } from '@database/mongodb/mongodb-connection';

import corsOptions from '@middlewares/cors-options';
import errorHandler from '@middlewares/error-handler';
import notFoundHandler from '@middlewares/404-handler';

import { activeAliasEvents, aliasEventEmitter } from '@events/index';

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

app.use(signupLoginRoutes);
app.use(publicRoutes);
app.use(userRoutes);

app.use(errorHandler);
app.use(notFoundHandler);

// Emite o evento para alimentar o cache com os alias/urls
activeAliasEvents();

process.on('uncaughtException', error => {
  console.log('Erro nao tratado:', error);
});

startDatabaseConnectionAndServer(app);
