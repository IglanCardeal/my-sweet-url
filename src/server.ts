import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import routes from './routes/routes';
import corsOptions from './middlewares/cors-options';
import { startDatabaseConnectionAndServer } from './database/connection';
import errorHandler from './middlewares/error-handler';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors(corsOptions));
// app.use(express.static('./public'));

app.use(routes);
app.use(errorHandler);

startDatabaseConnectionAndServer(app);

/**
 * TODO:
 * []1 - a pagina inicial deve ser uma lista de todas as urls(publicas)
 *       ja encurtadas com opcao de realizar uma busca por url ou apelido (2 inputs)
 * []2 - opcao de fazer login e cadastro. Por padrao, nao precisa de cadastro para
 *       usar a aplicacao, mas a URL encurtada sera de visualizacao publica
 * []3 - Caso tenha feito o login, opcao de quando o usuario cadastrar uma url, definir ela como publica ou privada, alem de poder exibidir todas as suas url cadastradas
 * []4 - pagina de usuario mostrando todas as suas url e um `input type radio` para o
 *       o usuario alterar se a url sera publica ou privada
 * []5 - logoff
 * []6 - API RATE LIMITING
 * []7 - Pagina 404 caso alias nao encontrado no banco
 * []X - Front end em next.js
 */
