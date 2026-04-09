import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  const db = mongoose.connection.db;
  const coll = db.collection('products');
  const docs = await coll.find({}).toArray();
  const out = docs.map(doc => `Product: ${doc.name}, Image Type: ${Array.isArray(doc.image) ? 'Array' : typeof doc.image}, Image Value: ${JSON.stringify(doc.image)}`).join('\n');
  fs.writeFileSync('output3.txt', out, 'utf8');
  process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
