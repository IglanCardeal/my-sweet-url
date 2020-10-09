import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import monk from 'monk';

import routes from './routes';

const app = express();

dotenv.config();

const corsOptions = {
  origin: true,
  methods: ['GET','POST','PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

app.use(helmet());
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.static('./public'));

app.use(routes);

const PORT = process.env.PORT || 3001;
const DB_URL = String(process.env.DB_URL);

const db = monk(DB_URL);

db.then(() => {
  console.log(`\n*** Database connection successful.\n*** Database URL: ${DB_URL}`);

  app.listen(PORT, () => {
    console.log(`\nServer running on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.log(`\nUnable to start the server duo:\n`, error);
});
