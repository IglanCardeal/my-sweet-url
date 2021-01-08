import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import urlsRoutes from '@routes/urls.routes';
import userRoutes from '@routes/user.routes';
import authRoutes from '@routes/auth.routes';

import corsOptions from '@config/cors';
import { errorHandler, notFoundHandler } from '@middlewares/errors-handlers';

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

app.use(authRoutes);
app.use(urlsRoutes);
app.use(userRoutes);

app.use(errorHandler);
app.use(notFoundHandler);

process.on('uncaughtException', error => {
  console.log('Erro nao tratado:', error);
});

export default app;
