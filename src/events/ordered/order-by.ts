import { db } from '@database/connection';
import { redisSetAsync } from '@utils/promisify-redis-methods';

const urls = db.get('urls');

interface Props {
  orderBy: string;
  sort: number;
}

/*
Atualiza o cache para consultas publicas de alias ordenados por
 - apelido (alias)
 - data (date)
 - numero de acesso (number_access)
 - domínio (domain)

 Salva no cache as primeiras 3 páginas de consultas, todas as outras páginas
 terão que fazer consulta no banco e não estará no cache.
*/

const orderBy = async ({ orderBy, sort }: Props) => {
  const validOrderBy = ['alias', 'date', 'domain', 'number_access'].includes(
    orderBy,
  );
  const validSort = [1, -1].includes(sort);

  if (!validOrderBy || !validSort) {
    throw new Error(
      'Invalid parameter values! Check "orderBy" e "sort" values.',
    );
  }
  try {
    const page0 = 0;
    const page1 = 10;
    const page2 = 20;
    const paginationLimit = 10;

    const [
      getOrderedByAliasPage0,
      getOrderedByAliasPage1,
      getOrderedByAliasPage2,
    ] = await Promise.all([
      urls.find(
        { publicStatus: true },
        {
          limit: paginationLimit,
          skip: page0,
          sort: {
            [orderBy]: sort,
          },
        },
      ),
      urls.find(
        { publicStatus: true },
        {
          limit: paginationLimit,
          skip: page1,
          sort: {
            [orderBy]: sort,
          },
        },
      ),
      urls.find(
        { publicStatus: true },
        {
          limit: paginationLimit,
          skip: page2,
          sort: {
            [orderBy]: sort,
          },
        },
      ),
    ]);

    const redisKeyOrderedByAliasPage0 = `public_order-${orderBy}_page-${page0}`;
    const redisKeyOrderedByAliasPage1 = `public_order-${orderBy}_page-${page1}`;
    const redisKeyOrderedByAliasPage2 = `public_order-${orderBy}_page-${page1}`;

    await Promise.all([
      redisSetAsync(
        redisKeyOrderedByAliasPage0,
        JSON.stringify(getOrderedByAliasPage0),
      ),
      redisSetAsync(
        redisKeyOrderedByAliasPage1,
        JSON.stringify(getOrderedByAliasPage1),
      ),
      redisSetAsync(
        redisKeyOrderedByAliasPage2,
        JSON.stringify(getOrderedByAliasPage2),
      ),
    ]);

    console.log(
      `Alias ordered by "${orderBy}" saved with success into the cache.`,
    );
  } catch (error) {
    console.log('Erro on save ordered alias into the cache: ', error);
  }
};

export default orderBy;
