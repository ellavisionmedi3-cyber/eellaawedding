require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const settings = await db.collection('sitesettings').find({ key: 'hero_video_url' }).toArray();
  console.log("HERO VIDEO URL:", settings);
  process.exit(0);
}
check();
