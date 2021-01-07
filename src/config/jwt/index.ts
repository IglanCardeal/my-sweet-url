import { config } from 'dotenv';

config();

export default {
  PRIVATE_KEY: process.env.JWT_PRIVATE_KEY!,
  PUBLIC_KEY: process.env.JWT_PUBLIC_KEY!
};
