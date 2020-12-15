import { Request } from 'express';

import {
  redisGetAsync,
  redisSetAsync,
  redisExpire,
} from '@database/redis-connection';
interface Urls {
  _id: string;
  alias: string;
  url: string;
  createdAt: string;
  updatedAt?: string;
  publicStatus: boolean;
  domain: string;
  number_access: number;
}

const orderingUrls = async (
  urls: any,
  req: Request,
  userId: string | null = null,
): Promise<[Urls]> => {
  let orderBy = req.query.orderby?.toString() || '';

  const orderByArray = ['alias', 'date', 'number_access', 'domain'];
  const validOrderBy = orderByArray.includes(orderBy);

  if (!validOrderBy) orderBy = 'alias';

  const paginate = Number(req.query.page) ? Number(req.query.page) * 10 : 0;
  const paginateToFloor = Math.floor(paginate);
  const paginationLimit = 10;

  const sortOrderBaseOnParameter = {
    date: -1,
    alias: 1,
    number_access: -1,
    domain: 1,
  };

  try {
    if (userId !== null) {
      const redisKeyUser = `user_${userId}_order-${orderBy}_page-${paginateToFloor}`;
      const cachedUserQuery = await redisGetAsync(redisKeyUser);

      if (cachedUserQuery) {
        // console.log('SERVINDO Urls usuario do Cache');
        return JSON.parse(cachedUserQuery);
      }

      const userUrls = await urls.find(
        { userId: userId },
        {
          limit: paginationLimit,
          skip: paginateToFloor,
          sort: {
            [orderBy]: sortOrderBaseOnParameter[orderBy],
          },
        },
      );

      // console.log('Salvando urls usuario no Cache');

      await redisSetAsync(redisKeyUser, JSON.stringify(userUrls));

      const redisExpirationTimeInSeconds = 10;

      redisExpire(redisKeyUser, redisExpirationTimeInSeconds);

      return userUrls;
    }

    const redisKeyPublic = `public_order-${orderBy}_page-${paginateToFloor}`;
    const cachedPublicQuery = await redisGetAsync(redisKeyPublic);

    if (cachedPublicQuery) {
      // console.log('SERVINDO Urls publicas do Cache');
      return JSON.parse(cachedPublicQuery);
    }

    const publicUrls = await urls.find(
      { publicStatus: true },
      {
        limit: paginationLimit,
        skip: paginateToFloor,
        sort: {
          [orderBy]: sortOrderBaseOnParameter[orderBy],
        },
      },
    );

    // console.log('Salvando urls publicas no Cache');

    await redisSetAsync(redisKeyPublic, JSON.stringify(publicUrls));

    const redisExpirationTimeInSeconds = 10;

    redisExpire(redisKeyPublic, redisExpirationTimeInSeconds);

    return publicUrls;
  } catch (error) {
    throw error;
  }
};

export default orderingUrls;
