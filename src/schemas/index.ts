import { aliasValidator, domainValidator } from './alias-domain';
import { urlSchema, urlToFilter } from './urls';
import { userLoginSchema, userSignupSchema, userUrlSchema } from './user';

// definindo o formato dos parâmetros antes
// de salvar no banco

export {
  aliasValidator,
  domainValidator,
  urlToFilter,
  urlSchema,
  userLoginSchema,
  userSignupSchema,
  userUrlSchema,
};
