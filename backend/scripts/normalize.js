const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/noteshub';

async function normalize() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const Note = mongoose.connection.db.collection('notes');

  // Normalize Branch names
  const itResult = await Note.updateMany(
    { branch: { $in: ['Info Tech', 'Information Tech', 'Information Technology'] } },
    { $set: { branch: 'IT' } }
  );
  console.log(`Normalized IT branches: ${itResult.modifiedCount}`);

  // Ensure viewsCount exists
  const viewsResult = await Note.updateMany(
    { viewsCount: { $exists: false } },
    { $set: { viewsCount: 0 } }
  );
  console.log(`Initialized viewsCount for notes: ${viewsResult.modifiedCount}`);

  // Ensure downloadsCount exists
  const downloadsResult = await Note.updateMany(
    { downloadsCount: { $exists: false } },
    { $set: { downloadsCount: 0 } }
  );
  console.log(`Initialized downloadsCount for notes: ${downloadsResult.modifiedCount}`);

  process.exit(0);
}

normalize().catch(err => {
  console.error(err);
  process.exit(1);
});
