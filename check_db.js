const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'ayla.db');
const db = new Database(dbPath);

try {
  const blogPosts = db.prepare('PRAGMA table_info(blog_posts)').all();
  console.log('Blog Posts Columns:', blogPosts.map(c => c.name));

  const packages = db.prepare('PRAGMA table_info(packages)').all();
  console.log('Packages Columns:', packages.map(c => c.name));

  const sampleBlog = db.prepare('SELECT title, title_ar FROM blog_posts LIMIT 1').get();
  console.log('Sample Blog Post:', sampleBlog);

  const samplePackage = db.prepare('SELECT name, name_ar FROM packages LIMIT 1').get();
  console.log('Sample Package:', samplePackage);

} catch (err) {
  console.error('Error checking DB:', err.message);
} finally {
  db.close();
}
