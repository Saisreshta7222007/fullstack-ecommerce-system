import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  const db = mongoose.connection.db;
  const coll = db.collection('products');
  const docs = await coll.find({}).toArray();
  console.log(JSON.stringify(docs, null, 2));
  process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
