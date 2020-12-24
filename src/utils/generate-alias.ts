import { nanoid } from 'nanoid';

import { db } from '@database/connection';

const urls = db.get('urls');

const generateAlias = async (size: number = 7) => {
  const randomAlias = nanoid(size);
  // para melhorar a performance, pode se criar um collection
  // só de ids já cadastrados e ao iniciar ao iniciar o server ou
  // cadastrar uma nova url, atualizar todos os ids ja usados em
  // memória cache com Redis.
  const aliasExist = await urls.findOne({ alias: randomAlias });

  if (aliasExist) {
    generateAlias();
  } else {
    return randomAlias;
  }
};

export default generateAlias;
