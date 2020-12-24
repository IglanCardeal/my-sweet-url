import { EventEmitter } from 'events';

import { db } from '@database/connection';
import {
  redisHmsetAsync,
  redisHgetAllAsync,
  redisHmgetAsync,
} from '@database/redis-connection';

const urls = db.get('urls');

const aliasEventEmitter = new EventEmitter();

const activeAliasEvents = () => {
  const callback = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        const aliasAreadyInCache = await redisHgetAllAsync('cached_alias');

        if (aliasAreadyInCache) {
          console.log('\n*** Alias and urls already in cache ***');

          return;
        }
      }

      const _urls = await urls.find();

      const aliasAndUrls = _urls.map(({ url, alias }) => {
        return redisHmsetAsync(['cached_alias', alias, url]);
      });

      await Promise.all(aliasAndUrls);

      const found = (await redisHmgetAsync('cached_alias', 'h_teste-4'))[0];
      console.log(found);

      console.log(
        '\n*** Cache feeded successfully with alias and urls from database ***',
      );
    } catch (error) {
      console.log(error);
    }
  };

  aliasEventEmitter.on('set_alias_cache', callback);
};

export { activeAliasEvents, aliasEventEmitter };
