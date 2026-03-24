const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config({ path: '../server/.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function createTestUser() {
  await client.connect();
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash('password123', salt);
  
  const res = await client.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password_hash = $3 RETURNING *',
    ['Test Admin', 'admin@wms.com', hash, 'admin']
  );
  
  console.log('User created:', res.rows[0].email);
  await client.end();
}

createTestUser();
