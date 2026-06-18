require('dotenv').config({path:'.env.local'});
const { MongoClient } = require('mongodb');
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/dzmarket';
console.log('URL:', url.replace(/\/\/.*@/, '//***@'));
new MongoClient(url).connect()
  .then(c => c.db().collection('users').find(
    { email: { $in: ['high.tech.blog7@gmail.com', 'ous7villa78@gmail.com'] } },
    { projection: { _id: 1, email: 1, name: 1 } }
  ).toArray())
  .then(r => {
    r.forEach(u => console.log(u.email, ':', u._id.toString()));
    process.exit(0);
  })
  .catch(e => { console.error(e); process.exit(1); });
