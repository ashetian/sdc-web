import mongoose from 'mongoose';

/* eslint-disable no-var */
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}
/* eslint-enable no-var */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sdc-web';

if (!MONGODB_URI) {
  throw new Error('MongoDB URI bulunamadı.');
}

type GlobalMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose as GlobalMongoose;

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      cached.conn = mongoose;
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB; 