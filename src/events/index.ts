import { EventEmitter } from 'events';

import allAlias from '@events/all-alias';
import orderedAlias from '@events/ordered-alias';

const aliasEventEmitter = new EventEmitter();

const activeAliasEvents = () => {
  const oneMinute = 1000 * 30; // atuliza o cache no determinado tempo

  aliasEventEmitter.on('set_alias_cache', allAlias);
  aliasEventEmitter.on('set_ordered_alias_cache', orderedAlias);

  aliasEventEmitter.emit('set_alias_cache');
  aliasEventEmitter.emit('set_ordered_alias_cache');

  setInterval(() => {
    const date = new Date();
    const currentTime = date.toTimeString();

    console.log('\n==> Current time: ', currentTime);

    console.log(
      '==> Next cache update time: ',
      new Date(date.getTime() + oneMinute).toTimeString(),
    );

    aliasEventEmitter.emit('set_ordered_alias_cache');
  }, oneMinute);
};

export { activeAliasEvents, aliasEventEmitter };
