import * as yup from 'yup';

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
});

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
    .max(2000)
    // .matches(
    //   /((https?):\/\/)?(www.)?[a-z0-9-]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#-]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
    //   'URL não pode ser vazia ou,m que ser em um formato válido e de tamanho máximo de 2000 caracteres!',
    // )
    .required(
      'URL não pode ser vazia, tem que ser em um formato válido e de tamanho máximo de 2000 caracteres!',
    )
    .typeError(
      'URL não pode ser vazia, tem que ser em um formato válido e de tamanho máximo de 2000 caracteres!',
    ),
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
