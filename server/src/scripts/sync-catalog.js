import { PRODUCTS, CATEGORIES } from '../../../client/src/data/products.js';
import { syncCatalogItems } from '../services/admin.service.js';
import prisma from '../config/db.js';

async function main() {
  console.log(`Starting sync of ${CATEGORIES.length} categories and ${PRODUCTS.length} products...`);
  try {
    const result = await syncCatalogItems(PRODUCTS, CATEGORIES);
    console.log('✅ Sync successful:', result);
    
    // Check how many KITCHEN products and RAW products are now in MySQL
    const [kitchenCount, rawCount, rtcCount, categoriesInDb] = await Promise.all([
      prisma.product.count({ where: { type: 'KITCHEN' } }),
      prisma.product.count({ where: { type: 'RAW' } }),
      prisma.product.count({ where: { type: 'READY_TO_COOK' } }),
      prisma.category.findMany({ select: { slug: true, name: true } }),
    ]);

    console.log(`\n📊 Live MySQL Database Status:`);
    console.log(`- Categories in DB: ${categoriesInDb.length}`);
    categoriesInDb.forEach(c => console.log(`   • ${c.slug}: ${c.name}`));
    console.log(`- Raw Seafood Products: ${rawCount}`);
    console.log(`- Ready To Cook Products: ${rtcCount}`);
    console.log(`- Cloud Kitchen Dishes: ${kitchenCount}`);
    console.log(`- Total Live Products: ${kitchenCount + rawCount + rtcCount}`);
  } catch (err) {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
