const { MongoClient } = require("mongodb");

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = MongoClient.connect(process.env.MONGODB_URI).then(client => {
      return {
        client,
        db: client.db()
      };
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectToDatabase };
