import { Router, type IRouter } from "express";
import { db, categoriesTable } from "@workspace/db";

const router: IRouter = Router();

const SEED_CATEGORIES = [
  { name: "Makanan & Minuman", icon: "🍜", description: "Restoran, warung, katering, dan minuman" },
  { name: "Fashion & Pakaian", icon: "👗", description: "Baju, celana, aksesoris fashion" },
  { name: "Jasa & Layanan", icon: "🔧", description: "Layanan profesional dan jasa umum" },
  { name: "Elektronik & Gadget", icon: "📱", description: "Handphone, laptop, aksesoris elektronik" },
  { name: "Wisata & Hiburan", icon: "🏖️", description: "Travel, tour, rental kendaraan" },
  { name: "Kesehatan & Kecantikan", icon: "💊", description: "Obat, kosmetik, perawatan diri" },
  { name: "Pendidikan", icon: "📚", description: "Les privat, kursus, bimbel" },
  { name: "Pertanian & Perkebunan", icon: "🌾", description: "Hasil tani, bibit, pupuk" },
  { name: "Properti & Real Estate", icon: "🏠", description: "Sewa, jual beli properti" },
  { name: "Otomotif", icon: "🚗", description: "Bengkel, sparepart, kendaraan" },
  { name: "Seni & Kerajinan", icon: "🎨", description: "Produk handmade, seni, dekorasi" },
  { name: "Peternakan", icon: "🐄", description: "Daging, susu, produk ternak" },
  { name: "Percetakan & Desain", icon: "🖨️", description: "Cetak banner, kartu nama, desain grafis" },
  { name: "Lainnya", icon: "📦", description: "Kategori bisnis lainnya" },
];

let seeded = false;

async function seedCategories() {
  if (seeded) return;
  seeded = true;
  const existing = await db.select().from(categoriesTable);
  if (existing.length === 0) {
    await db.insert(categoriesTable).values(SEED_CATEGORIES);
  }
}

router.get("/categories", async (req, res) => {
  try {
    await seedCategories();
    const categories = await db.select().from(categoriesTable);
    res.json(categories);
  } catch (err) {
    req.log.error({ err }, "List categories error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
