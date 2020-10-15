import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

import routes from './routes';
import corsOptions from './cors-options';
import startServer from './start-server';
import errorHandler from './error-handler';

const app = express();

dotenv.config();

app.use(helmet());
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.static('./public'));

app.use(routes);
app.use(errorHandler);

startServer(app);
