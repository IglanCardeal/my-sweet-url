import * as yup from 'yup';

// definindo o formato dos parametros antes
// de salvar no banco

// Schema para URLs
export const urlSchema = yup.object().shape({
  alias: yup
    .string()
    .trim()
    .min(0)
    .max(10, 'Nome de apelido tem que ter tamanho máximo de 10 caracteres.')
    .matches(
      /^[\w\-]+$/gi,
      'Formato do apelido invalido. Use somente letras, números, "_" ou "-".',
    ),
  url: yup
    .string()
    .trim()
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9-]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#-]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      'URL não pode ser vazia ou tem que ser em um formato valido!',
    )
    .required('URL não pode ser vazia ou tem que ser em um formato valido!'),
  publicStatus: yup
    .boolean()
    .required(
      'O estatus(publicStatus) da URL tem que ser um Boolean "true" ou "false"',
    )
    .typeError(
      'O estatus(publicStatus) da URL tem que ser um Boolean "true" ou "false"',
    ),
  userId: yup.string(),
  id: yup.string().trim(),
});

export const userUrlSchema = yup.object().shape({
  alias: yup
    .string()
    .trim()
    .min(0)
    .max(14, 'Nome de apelido tem que ter tamanho máximo de 14 caracteres.')
    .matches(
      /^[\w\-]+$/gi,
      'Formato do apelido invalido. Use somente letras, números, "_" ou "-".',
    ),
  url: yup
    .string()
    .trim()
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9-]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#-]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      'URL não pode ser vazia ou tem que ser em um formato valido!',
    )
    .required('URL não pode ser vazia ou tem que ser em um formato valido!'),
  publicStatus: yup
    .boolean()
    .required(
      'O estatus(publicStatus) da URL tem que ser um Boolean "true" ou "false"',
    )
    .typeError(
      'O estatus(publicStatus) da URL tem que ser um Boolean "true" ou "false"',
    ),
  userId: yup.string(),
  id: yup.string().trim(),
});

// Schema para validar dominio da url ou alias
export const urlToFilter = yup.object().shape({
  alias: yup
    .string()
    .trim()
    .min(0)
    .max(14, 'Nome de apelido tem que ter tamanho máximo de 14 caracteres.')
    .matches(
      /^[\w\-]+$/gi,
      'Formato do apelido invalido. Use somente letras, números, "_" ou "-".',
    ),
  url: yup
    .string()
    .trim()
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9-]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#-]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      'URL não pode ser vazia ou tem que ser em um formato valido!',
    ),
});

// Schema para cadastro de usuário e edicao de usuário
export const userLoginSchema = yup.object().shape({
  username: yup
    .string()
    .trim()
    .required(
      'Nome de usuário tem que ter minimo de 3 e máximo de 25 caracteres.',
    )
    .min(
      3,
      'Nome de usuário tem que ter minimo de 3 e máximo de 25 caracteres.',
    )
    .max(
      25,
      'Nome de usuário tem que ter minimo de 3 e máximo de 25 caracteres.',
    )
    .matches(
      /^[\w\-" "]+$/gi,
      'Formato do nome de usuário invalido. Use somente letras, números, "_" ou "-".',
    ),

  password: yup
    .string()
    .trim()
    .required(
      'Senha de usuário tem que ter minimo de 3 e máximo de 25 caracteres.',
    )
    .min(
      3,
      'Senha de usuário tem que ter minimo de 3 e máximo de 25 caracteres.',
    )
    .max(
      25,
      'Senha de usuário tem que ter minimo de 3 e máximo de 25 caracteres.',
    )
    .matches(
      /^[\w\-]+$/gi,
      'Formato da senha de usuário invalido. Use somente letras, números, "_" ou "-". Não use espacos em branco',
    ),
});

export const userSignupSchema = yup.object().shape({
  username: yup
    .string()
    .trim()
    .required(
      'Nome de usuário tem que ter tamanho minimo de 3 e máximo de 25 caracteres.',
    )
    .min(
      3,
      'Nome de usuário tem que ter tamanho minimo de 3 e máximo de 25 caracteres.',
    )
    .max(
      25,
      'Nome de usuário tem que ter tamanho minimo de 3 e máximo de 25 caracteres.',
    )
    .matches(
      /^[\w\-" "]+$/gi,
      'Formato do nome de usuário invalido. Use somente letras, números, "_" ou "-".',
    ),

  password: yup
    .string()
    .trim()
    .required(
      'Senha de usuário tem que ter minimo de 3 e máximo de 25 caracteres.',
    )
    .min(
      3,
      'Senha de usuário tem que ter minimo de 3 e máximo de 25 caracteres.',
    )
    .max(
      25,
      'Senha de usuário tem que ter minimo de 3 e máximo de 25 caracteres.',
    )
    .matches(
      /^[\w\-]+$/gi,
      'Formato da senha de usuário invalido. Use somente letras, números, "_" ou "-". Não use espacos em branco.',
    ),

  email: yup
    .string()
    .trim()
    .email('Email deve ser informado e deve ser em formato valido.')
    .required('Email deve ser informado e deve ser em formato valido.'),
});

export const domainValidator = yup.object().shape({
  domain: yup
    .string()
    .trim()
    .matches(/[a-z0-9-]+(\.[a-z]{2,}){1,3}?$/, 'Nome de dominio inválido.'),
});

export const aliaslValidator = yup.object().shape({
  alias: yup
    .string()
    .trim()
    .min(0)
    .max(14, 'Nome de apelido tem que ter tamanho máximo de 14 caracteres.')
    .matches(
      /^[\w\-]+$/gi,
      'Formato do apelido invalido. Use somente letras, números, "_" ou "-".',
    ),
});
