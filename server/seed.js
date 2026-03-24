const db = require('./config/db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('🌱 Seeding database...');

    // 1. Create Admin User
    const passwordHash = await bcrypt.hash('Pr@sh22N@gu29', 10);
    const userRes = await db.query(
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET 
         password_hash = EXCLUDED.password_hash,
         name = EXCLUDED.name
       RETURNING id`,
      ['Warehouse Admin', 'prashmapoojary@gmail.com', passwordHash, 'ADMIN']
    );
    const adminId = userRes.rows[0].id;

    // 2. Create Warehouse
    const whRes = await db.query(
      `INSERT INTO warehouses (name, location, manager_id) 
       VALUES ($1, $2, $3) 
       RETURNING id`,
      ['Main Central Hub', 'New Delhi, Sector 12', adminId]
    );
    const whId = whRes.rows[0].id;

    // 3. Create Categories
    const catRes = await db.query(
      `INSERT INTO categories (name, description, warehouse_id) 
       VALUES ($1, $2, $3), ($4, $5, $6) 
       ON CONFLICT DO NOTHING
       RETURNING id, name`,
      ['Electronics', 'Consumer electronics and parts', whId, 'Tools', 'Hardware and industrial tools', whId]
    );
    // Fetch IDs in case of NO INSERT
    const allCats = await db.query('SELECT id, name FROM categories');
    const electronicsId = allCats.rows.find(c => c.name === 'Electronics').id;
    const toolsId = allCats.rows.find(c => c.name === 'Tools').id;

    // 4. Create Products
    await db.query(`
      INSERT INTO products (sku, name, category_id, warehouse_id, quantity, min_threshold, unit_price, created_by)
      VALUES 
      ('WH-ELC-001', 'Heavy Duty Forklift Battery', $1, $2, 45, 10, 12500, $3),
      ('WH-ELC-002', 'Wireless Barcode Scanner', $1, $2, 120, 20, 3500, $3),
      ('WH-TLS-001', 'Industrial Impact Wrench', $4, $2, 8, 15, 8500, $3),
      ('WH-TLS-002', 'Steel Pallet Jack', $4, $2, 3, 5, 18000, $3)
      ON CONFLICT (sku) DO NOTHING
    `, [electronicsId, whId, adminId, toolsId]);

    console.log('✅ Seeding completed! Use email: prashmapoojary@gmail.com, password: Pr@sh22N@gu29');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    process.exit();
  }
};

seedData();
