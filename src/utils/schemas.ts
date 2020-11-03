import * as yup from 'yup';

// definindo o formato dos parametros antes
// de salvar no banco

// Schema para URLs
export const urlSchema = yup.object().shape({
  alias: yup
    .string()
    .trim()
    .min(
      3,
      'Nome de usuario tem que ter tamanho minimo de 3 e maximo de 14 caracteres.',
    )
    .max(
      14,
      'Nome de usuario tem que ter tamanho minimo de 3 e maximo de 14 caracteres.',
    )
    .matches(
      /^[\w\-]+$/gi,
      'Formato do apelido invalido. Use somente letras, numeros, "_" ou "-".',
    ),
  url: yup
    .string()
    .trim()
    .url('URL nao pode ser vazia ou tem que ser em um formato valido!')
    .required(),
  publicStatus: yup
    .boolean()
    .required()
    .typeError(
      'O estatus(publicStatus) da URL tem que ser um Boolean "true" ou "false"',
    ),
  userId: yup.string(),
});

// Schema para validar dominio da url ou alias
export const urlToFilter = yup.object().shape({
  alias: yup
    .string()
    .trim()
    .matches(
      /^[\w\-]+$/gi,
      'Formato do apelido invalido. Use somente letras, numeros, "_" ou "-".',
    ),
  url: yup
    .string()
    .trim()
    .url('URL nao pode ser vazia ou tem que ser em um formato valido!'),
});

// Schema para cadastro de usuario e edicao de usuario
export const userLoginSchema = yup.object().shape({
  username: yup
    .string()
    .trim()
    .required()
    .min(
      3,
      'Senha de usuario tem que ter minimo de 3 e maximo de 25 caracteres.',
    )
    .max(
      25,
      'Senha de usuario tem que ter minimo de 3 e maximo de 25 caracteres.',
    )
    .matches(
      /^[\w\-" "]+$/gi,
      'Formato do nome de usuario invalido. Use somente letras, numeros, "_" ou "-".',
    ),

  password: yup
    .string()
    .trim()
    .required()
    .min(
      3,
      'Senha de usuario tem que ter minimo de 3 e maximo de 25 caracteres.',
    )
    .max(
      25,
      'Senha de usuario tem que ter minimo de 3 e maximo de 25 caracteres.',
    )
    .matches(
      /^[\w\-]+$/gi,
      'Formato da senha de usuario invalido. Use somente letras, numeros, "_" ou "-". Nao use espacos em branco',
    ),
});

export const userSignupSchema = yup.object().shape({
  username: yup
    .string()
    .trim()
    .required()
    .min(
      3,
      'Nome de usuario tem que ter tamanho minimo de 3 e maximo de 25 caracteres.',
    )
    .max(
      25,
      'Nome de usuario tem que ter tamanho minimo de 3 e maximo de 25 caracteres.',
    )
    .matches(
      /^[\w\-" "]+$/gi,
      'Formato do nome de usuario invalido. Use somente letras, numeros, "_" ou "-".',
    ),

  password: yup
    .string()
    .trim()
    .required()
    .min(
      3,
      'Senha de usuario tem que ter minimo de 3 e maximo de 25 caracteres.',
    )
    .max(
      25,
      'Senha de usuario tem que ter minimo de 3 e maximo de 25 caracteres.',
    )
    .matches(
      /^[\w\-]+$/gi,
      'Formato da senha de usuario invalido. Use somente letras, numeros, "_" ou "-". Nao use espacos em branco',
    ),

  email: yup
    .string()
    .trim()
    .email('Email deve ser informado e deve ser em formato valido.')
    .required(),
});
