import * as yup from 'yup';

export const aliasValidator = yup.object().shape({
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

export const domainValidator = yup.object().shape({
  domain: yup
    .string()
    .trim()
    // .matches(/[a-z0-9-]+(\.[a-z]{2,}){1,3}?$/, 'Nome de domínio inválido.'),
    .max(255, 'Nome de domínio deve ter no máximo 255 caracteres.')
    .matches(
      /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})$/,
      'Nome de domínio inválido.',
    )
    .typeError('Nome de domínio deve ter no máximo 255 caracteres.'),
});
