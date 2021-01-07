import { config } from 'dotenv';

config();

const env = process.env.NODE_ENV;
const oneThousandHoursForDevelopment = 60 * 60 * 1000 * 1000; // mil horas
const oneHour = 60 * 60 * 1000; // 1 hora
const maxAgeOfCookie =
  env === 'development' ? oneThousandHoursForDevelopment : oneHour;

export const ageOfCookie = maxAgeOfCookie;

// tive que definir uma interface e um tipo para 'algorithm' para evitar
// erro do TS no método jtw.sign(...). Escolhi apenas alguns algoritmos.
interface SignOptionsByMe {
  issuer: string;
  subject: string;
  audience: string;
  expiresIn: number;
  algorithm: 'RS256' | 'HS256' | 'HS384' | 'HS512' | 'RS384' | 'RS512';
}

const issuer = 'My Sweet Url',
  subject = 'none',
  audience = 'none';

export const signOptions = {
  issuer: issuer,
  subject: subject,
  audience: audience,
  expiresIn: maxAgeOfCookie,
  algorithm: 'RS256',
} as SignOptionsByMe;

export const verifyOptions = {
  issuer: issuer,
  subject: subject,
  audience: audience,
  expiresIn: maxAgeOfCookie,
  algorithm: ['RS256'],
};
