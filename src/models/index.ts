import { db } from '@database/mongodb/mongodb-connection';

const UrlsRepository = db.get('urls');
const UserRepository = db.get('users');

UrlsRepository.createIndex('alias');


export { UrlsRepository, UserRepository };
