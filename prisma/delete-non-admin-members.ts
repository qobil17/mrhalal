import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, MemberRole } from '../generated/prisma/client';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL topilmadi (.env faylini tekshiring)');

  // Faqat localhost (dev) da ishlashga ruxsat
  const isLocalhost =
    connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  if (!isLocalhost) {
    console.error('⛔ XAVF: DATABASE_URL localhost emas!');
    console.error('   Bu skript faqat local dev muhitda ishlatilishi mumkin.');
    console.error('   To\'xtatildi — hech narsa o\'zgartirilmadi.');
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    // Nechta CUSTOMER borligini sanab ko'rsat
    const customerCount = await prisma.member.count({
      where: { role: MemberRole.CUSTOMER, deletedAt: null },
    });

    const adminCount = await prisma.member.count({
      where: { role: MemberRole.ADMIN, deletedAt: null },
    });

    console.log(`ℹ️  Topildi:`);
    console.log(`   ADMIN    : ${adminCount} ta — o'zgartirilmaydi`);
    console.log(`   CUSTOMER : ${customerCount} ta — soft-delete qilinadi`);
    console.log('');

    if (customerCount === 0) {
      console.log('ℹ️  O\'chiriladigan CUSTOMER yo\'q. Skript tugatildi.');
      return;
    }

    console.log(`⏳ ${customerCount} ta CUSTOMER soft-delete qilinmoqda...`);

    const result = await prisma.member.updateMany({
      where: { role: MemberRole.CUSTOMER, deletedAt: null },
      data: { deletedAt: new Date(), isActive: false },
    });

    console.log(`✓ ${result.count} ta CUSTOMER soft-delete qilindi (deletedAt = now, isActive = false)`);
    console.log(`✓ ${adminCount} ta ADMIN o'zgartirilmadi`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Xatolik:', e.message);
  process.exit(1);
});
