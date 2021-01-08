import orderBy from './order-by';

const orderedAlias = async () => {
  // 1 ordem crescente
  // -1 ordem decrescente
  const orderByAlias = {
    orderBy: 'alias',
    sort: 1,
  };
  const orderByDate = {
    orderBy: 'date',
    sort: -1,
  };
  const orderByDomain = {
    orderBy: 'domain',
    sort: 1,
  };
  const orderByNumberAccess = {
    orderBy: 'number_access',
    sort: -1,
  };

  await Promise.all([
    orderBy(orderByAlias),
    orderBy(orderByDate),
    orderBy(orderByDomain),
    orderBy(orderByNumberAccess),
  ]);

  // console.log('All alias ordered saved with success into the cache!');
};

export default orderedAlias;
