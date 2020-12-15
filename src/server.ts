import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import publicRoutes from '@routes/public.routes';
import userRoutes from '@routes/user.routes';
import signupLoginRoutes from '@routes/signup-login.routes';

import { startDatabaseConnectionAndServer } from '@database/connection';

import corsOptions from '@middlewares/cors-options';
import errorHandler from '@middlewares/error-handler';
import notFoundHandler from '@middlewares/404-handler';

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

process.on('uncaughtException', error => {
  console.log('Erro nao tratado:', error);
});

startDatabaseConnectionAndServer(app);

/**
 * TODO:
 * [X]1 - a pagina inicial deve ser uma lista de todas as urls(publicas) ja encurtadas
 *    [x]1.1 - opcao de realizar uma busca por url/dominio/apelido (3 inputs) quando for exibida todas as urls.
 *
 * [X]2 - opcao de fazer login e cadastro. Por padrao, nao precisa de cadastro para usar a aplicacao, mas a URL encurtada sera sempre de visualizacao publica
 *
 * [x]3 - Caso tenha feito o login, opcao de quando o usuario cadastrar uma url, definir ela como publica ou privada
 *
 * [x]4 - pagina de usuario mostrando todas as suas url e um `input type radio` para o usuario alterar se a url sera publica ou privada
 *
 * [x]5 - logoff
 *
 * []6 - API RATE LIMITING
 *  []6.1 - limitar pelo endereco IP
 *
 * [X]7 - Reposta 404 caso alias nao encontrado no banco
 *
 * []8 - Documentar a API e o projeto
 */
