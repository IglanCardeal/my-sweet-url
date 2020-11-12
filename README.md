<div align="center">

# ![url-icon](./src/public/favicon.ico) My Sweet URL

## Site para encurtar URL's

</div>

<hr>

### Status do Projeto

🚧 <b>Em construção...</b> 🚧

### Metodos e retornos publicos

Estes metodos estao relacionados a **usuarios anonimos** (sem cadastro no sistema)
onde estes usuarios podem cadastrar uma nova _url_, que por padrao, esta url e publica,
e visualizar todas as url publicas.

### Tabela de conteúdos

<!--ts-->

- [Sobre](#sobre)
  - [Como é definido o protocolo de envio?](#protocolo-envio)
- [Features](#features)
- [Testes](#testes)
- [Endpoints](#endpoints)
- [Como usar localmente](#como-usar)
  - [Requisitos](#como-usar)
    - [Configurando arquivo `.env`](#env)
  - [Nao tenho mongodb instalado. E agora?🤔](#atlas)
    - [Atlas](#atlas)
    - [Container Docker](#docker)
- [Tecnologias/ferramentas usadas](#tecnologias)
- [Autor](#autor)
  <!--te-->

<p id="sobre"></p>

### Sobre :coffee:

<p id="features"></p>

### Features 📋

Nesta aplicação voçê pode:

<p id="testes"></p>

### Testes

<p id="endpoints"></p>

### Endpoints (em documentacao)

**metodo** _/path_

- **GET** _/showurls_

  - Corpo de requisicao: _nenhum_

  - Retorno da requisicao (exemplo):

  ```json
  {
    "message": "Todas as URLs publicas.",
    "public_urls": [
      {
        "alias": "seu-tubo",
        "url": "https://www.youtube.com/"
      }
    ]
  }
  ```

  - message: `string`,

  - public_urls: `array[{}]`

  - alias: `string`

  - url: `string`

<p id="como-usar"></p>

### Como usar localmente? :pushpin:

<p id="requisitos"></p>

#### Requisitos

Para usar localmente em sua máquina, voce deve ter instalado em sua máquina o [NodeJS](https://nodejs.org/en/) com uma versão minima recomendada `v12.0.0`, [MongoDB](https://www.mongodb.com/) e o [Git](https://git-scm.com).
Além disto é bom ter um editor para trabalhar com o código como [VSCode](https://code.visualstudio.com/).
Para começar, faça o clone deste repositório. Digite o comando no terminal:

```bash
$ git clone https://github.com/IglanCardeal/my-sweet-url-api
```

Acesse a pasta do projeto:

```bash
$ cd my-sweet-url-api
```

Instale as dependências do projeto usando o `npm` ou `yarn` se preferir:

```bash
$ npm install
# ou
$ yarn install
```

<p id="env"></p>

Agora precisamos configurar o arquivo `.env`, que contém as variáveis de ambientes essenciais para executar a aplicação. Neste respositório, temos um arquivo de exemplo das variáveis de ambiente chamado `.env,example`. Abra esse arquivo e veremos o seguinte:

```bash
# APP detalhes
APP_NAME= App Envio de Email
APP_AUTHOR= Iglan Cardeal
APP_EMAIL= emailperformanceapp@teste.com

# APP Port
PORT= 3000
HOST= localhost

# Database MongoDB
DB_NAME=app-envio-email
DB_PORT=27017

# Quando NODE_ENV=development
DB_DEV_HOST=127.0.0.1
# Quando NODE_ENV=production
DB_HOST=127.0.0.1
# URL Provedor externo
DB_HOST_EXTERNAL=

```

<p id="env"></p>

Agora, renomeie o arquivo `.env.example` para `.env`.

Feito isso, execute o comando abaixo e o aplicativo será iniciado localmente como ambiente de desenvolvimento em sua máquina:

```bash
$ npm run dev
# ou
$ yarn dev
```

Agora abra seu navegador na URL `http://localhost:3000` e verá a página inicial do projeto.

<p id="atlas"></p>

#### Não tem MongoDB instalado?

Sem problemas!

#### Atlas

Voçê pode inserir uma URI de algum provedor como o [Atlas](https://www.mongodb.com/cloud/atlas/lp/try2?utm_source=google&utm_campaign=gs_americas_brazil_search_brand_atlas_desktop&utm_term=mongodb&utm_medium=cpc_paid_search&utm_ad=e&utm_ad_campaign_id=1718986516). Neste caso, vamos definir um URI no em `DB_HOST_EXTERNAL=`. Esta variável tem prioridade, logo se voçê definiu uma URI, ela será usada, senão deixea vazia.
A URI a ser usada, no caso se voçê usar o Atlas, terá o formato semelhante a seguir:

```bash
DB_HOST_EXTERNAL=mongodb+srv://<username>:<password>@cluster0.zcr3z.mongodb.net/<dbname>?retryWrites=true&w=majority
```

Onde:

- `username`: seu nome de usuário

- `password`: sua senha

- `dbname`: nome da base de dados. Eu recomendo chamar de `email-performance-app`

Tendo Feito todas as configurações, execute `npm run dev` ou `yarn dev` para iniciar a aplicação.

**_OBS_**: ao executar o comando para iniciar a aplicação, será exibido no terminal a URI de conexão com o banco.

<p id="docker"></p>

#### Voçê usa Docker? :whale:

Uma solução alternativa é subir um container do Docker do MongoDB. Existe a [imagem oficial do mongo](https://hub.docker.com/_/mongo) que podemos usar para subir um container mongodb e usar o banco de dados.
Na raíz do projeto temos um arquivo `docker-compose.yml` com as seguintes características:

```bash
version: "3"

services:
  # app:
  #   container_name: my_sweet_url
  #   build: .
  #   ports:
  #     - "3000:3000"
  #   command: yarn dev
  #   # volumes:
  #   #   - ./data:/data/db
  #   links:
  #     - mongo

  mongo:
    container_name: my_sweet_mongo
    image: mongo
    ports:
      - "27017:27017"

```

Esse arquivo é a base para gerar um container do mongodb.
Temos também um arquivo `Makefile` para que possamos executar comandos do `docker-compose` de uma maneira mais rápida.
Características do `Makefile`:

```bash
include .env

.PHONY: up

up:
  docker-compose up -d

.PHONY: down

down:
  docker-compose down

.PHONY: logs

logs:
  docker-compose logs -f
```

- `include .env` carrega as variáveis de ambiente do arquivo `.env`.

- `up` executa o `docker-compose` com os containers em background

- `logs` exibe os logs

- `down` desmonta os containers

Para subir o container, digite no terminal `make up`, e aguarde o docker baixar e montar a imagem do mongodb.

Ao finalizar, execute `make logs`, para verificar se tudo ocorreu bem nos logs.

Execute `make down` para desmontar o container.

### Quais tecnologias/ferrramentas foram usadas? :wrench:

<p id="tecnologias"></p>

- [NodeJS](https://nodejs.org/en/)
- [Express](https://expressjs.com/pt-br/) (Framework web)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/)
- [Git](https://git-scm.com)
- [VSCode](https://code.visualstudio.com/)

### Autor

<p id="autor"></p>

<kbd>
 <img style="border-radius: 50%;" src="https://avatars1.githubusercontent.com/u/37749943?s=460&u=70f3bf022f3a0f28c332b1aa984510910818ef02&v=4" width="100px;" alt="iglan cardeal"/>
</kbd>

<b>Iglan Cardeal</b>

Desenvolvido e mantido por Iglan Cardeal :hammer: </br>
Desenvolvedor NodeJS 💻 <br>
Entre em contato! 👋🏽

- cmtcardeal@outlook.com :email:
- Instagram [@cmtcardeal](https://www.instagram.com/cmtecardeal/)
- StackOverflow [Cmte Cardeal](https://pt.stackoverflow.com/users/95771/cmte-cardeal?tab=profile)
