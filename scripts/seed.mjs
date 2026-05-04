import pg from "pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Seeding database...");

    const adminPasswordHash = await bcrypt.hash("admin123456", 10);
    const demoPasswordHash = await bcrypt.hash("demo123456", 10);

    const adminId = crypto.randomUUID();
    const demoUserId = crypto.randomUUID();

    await client.query(`
      INSERT INTO users (id, name, email, password_hash, role, tier, status)
      VALUES
        ($1, 'Super Admin', 'admin@umkmgo.id', $2, 'super_admin', 'enterprise', 'active'),
        ($3, 'Demo UMKM', 'demo@umkm.id', $4, 'user', 'free', 'active')
      ON CONFLICT (email) DO NOTHING
    `, [adminId, adminPasswordHash, demoUserId, demoPasswordHash]);

    console.log("Users seeded.");

    const categories = [
      { name: "Makanan & Minuman", icon: "🍜" },
      { name: "Fashion & Pakaian", icon: "👗" },
      { name: "Elektronik", icon: "📱" },
      { name: "Kecantikan & Perawatan", icon: "💄" },
      { name: "Kesehatan", icon: "💊" },
      { name: "Perabot Rumah", icon: "🪑" },
      { name: "Olahraga", icon: "⚽" },
      { name: "Pendidikan", icon: "📚" },
      { name: "Otomotif", icon: "🚗" },
      { name: "Pertanian", icon: "🌾" },
      { name: "Kerajinan Tangan", icon: "🎨" },
      { name: "Jasa & Layanan", icon: "🔧" },
      { name: "Hewan Peliharaan", icon: "🐾" },
      { name: "Lainnya", icon: "🏪" },
    ];

    let categoryId;
    for (const cat of categories) {
      const res = await client.query(`
        INSERT INTO categories (id, name, icon)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [crypto.randomUUID(), cat.name, cat.icon]);
      if (cat.name === "Makanan & Minuman" && res.rows.length > 0) {
        categoryId = res.rows[0].id;
      }
    }

    if (!categoryId) {
      const res = await client.query(`SELECT id FROM categories WHERE name = 'Makanan & Minuman' LIMIT 1`);
      categoryId = res.rows[0]?.id;
    }

    console.log("Categories seeded.");

    const demoUserRow = await client.query(`SELECT id FROM users WHERE email = 'demo@umkm.id' LIMIT 1`);
    const actualDemoUserId = demoUserRow.rows[0]?.id;

    if (actualDemoUserId && categoryId) {
      const storeId = crypto.randomUUID();
      await client.query(`
        INSERT INTO stores (id, user_id, name, slug, description, category_id, whatsapp, theme, status, visit_count, order_count, revenue)
        VALUES ($1, $2, 'Warung Makan Sederhana', 'warung-sederhana', 'Warung makan rumahan dengan cita rasa autentik', $3, '6281234567890', 'modern', 'active', 1250, 87, 4350000)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `, [storeId, actualDemoUserId, categoryId]);

      const storeRow = await client.query(`SELECT id FROM stores WHERE slug = 'warung-sederhana' LIMIT 1`);
      const actualStoreId = storeRow.rows[0]?.id;

      if (actualStoreId) {
        const products = [
          { name: "Nasi Goreng Spesial", description: "Nasi goreng dengan telur, ayam, dan sayuran segar", price: 25000 },
          { name: "Mie Ayam Bakso", description: "Mie ayam dengan bakso besar dan kuah kaldu spesial", price: 20000 },
          { name: "Es Teh Manis", description: "Teh manis segar dengan es batu", price: 5000 },
          { name: "Ayam Bakar", description: "Ayam bakar bumbu kecap dengan lalapan dan sambal", price: 35000 },
          { name: "Soto Ayam", description: "Soto ayam bening dengan kuah gurih dan pelengkap", price: 22000 },
        ];

        for (let i = 0; i < products.length; i++) {
          const p = products[i];
          await client.query(`
            INSERT INTO products (id, store_id, name, description, price, is_available, sort_order)
            VALUES ($1, $2, $3, $4, $5, true, $6)
            ON CONFLICT DO NOTHING
          `, [crypto.randomUUID(), actualStoreId, p.name, p.description, p.price, i]);
        }

        console.log("Demo store and products seeded.");
      }
    }

    const flags = [
      { name: "new_onboarding_flow", status: true, rolloutPercent: 100, tier: null, description: "Alur onboarding baru dengan 5 langkah" },
      { name: "ai_product_description", status: false, rolloutPercent: 0, tier: "pro", description: "Generate deskripsi produk dengan AI" },
      { name: "custom_domain", status: true, rolloutPercent: 100, tier: "pro", description: "Custom domain untuk toko" },
      { name: "analytics_v2", status: false, rolloutPercent: 20, tier: null, description: "Dashboard analitik generasi berikutnya" },
    ];

    for (const flag of flags) {
      await client.query(`
        INSERT INTO feature_flags (id, name, status, rollout_percent, tier, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (name) DO NOTHING
      `, [crypto.randomUUID(), flag.name, flag.status, flag.rolloutPercent, flag.tier, flag.description]);
    }

    console.log("Feature flags seeded.");
    console.log("Seeding complete!");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
