import { Request } from 'express';

interface Urls {
  alias: string;
  url: string;
  date: string;
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

  const sortOrderBaseOnParameter = {
    date: -1,
    alias: 1,
    number_access: -1,
    domain: 1,
  };

  try {
    if (userId !== null) {
      const userUrls = await urls.find(
        { userId: userId },
        {
          limit: 10,
          skip: paginateToFloor,
          sort: {
            [orderBy]: sortOrderBaseOnParameter[orderBy],
          },
        },
      );

      return userUrls;
    }

    const publicUrls = await urls.find(
      { publicStatus: true },
      {
        limit: 10,
        skip: paginateToFloor,
        sort: {
          [orderBy]: sortOrderBaseOnParameter[orderBy],
        },
      },
    );

    return publicUrls;
  } catch (error) {
    throw error;
  }
};

export default orderingUrls;
