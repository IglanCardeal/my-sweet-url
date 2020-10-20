# ![url-icon](/public/favicon.ico) My Sweet URL

Site para encurtar URL's feito em **NodeJS**, **Express**, **TypeScript** e **MongoDB**.

## Metodos e retornos publicos

Estes metodos estao relacionados a **usuarios anonimos** (sem cadastro no sistema)
onde estes usuarios podem cadastrar uma nova _url_, que por padrao, esta url e publica,
e visualizar todas as url publicas.

#### ENDPOINTS

**metodo** */path*

- **GET** */showurls*

  - Corpo de requisicao: _nenhum_

  - Retorno da requisicao (exemplo):

  ```json
  {
    "message": "Todas as URLs publicas.",
    "publicurls": [
      {
        "alias": "seu-tubo",
        "url": "https://www.youtube.com/"
      }
    ]
  }
  ```

  - message: `string`,

  - publicurls: `array[{}]`

  - alias: `string`

  - url: `string`

