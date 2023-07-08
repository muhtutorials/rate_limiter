import { MongoClient } from 'mongodb';


const username = process.env.MONGO_INITDB_ROOT_USERNAME;
const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
const connectionString = `mongodb://${username}:${password}@mongodb:27017/` || '';

const client = new MongoClient(connectionString);

let conn;
try {
  conn = await client.connect();
} catch(e) {
  console.error(e);
}

let db = conn.db('rate_limiter');

export default db;