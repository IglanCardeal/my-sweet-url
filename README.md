<div align="center">

# ![url-icon](/public/favicon.ico) My Sweet URL

## Site para encurtar URL's.

</div>

<hr>

## Status do Projeto

🚧  <b>Em construção...</b>  🚧

### Metodos e retornos publicos

Estes metodos estao relacionados a **usuarios anonimos** (sem cadastro no sistema)
onde estes usuarios podem cadastrar uma nova _url_, que por padrao, esta url e publica,
e visualizar todas as url publicas.

### Endpoints

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
