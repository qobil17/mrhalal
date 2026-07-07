import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, MemberRole } from '../generated/prisma/client';

// ⚠️  BU SKRIPT QAYTARIB BO'LMAYDIGAN HARD DELETE QILADI
// FAQAT role = CUSTOMER bo'lgan member'lar o'chiriladi
// ADMIN'larga umuman tegmaydi

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
    // CUSTOMER id'larini yig'
    const customers = await prisma.member.findMany({
      where: { role: MemberRole.CUSTOMER },
      select: { id: true },
    });

    const adminCount = await prisma.member.count({
      where: { role: MemberRole.ADMIN },
    });

    console.log(`ℹ️  Topildi:`);
    console.log(`   ADMIN    : ${adminCount} ta — o'zgartirilmaydi`);
    console.log(`   CUSTOMER : ${customers.length} ta — hard-delete qilinadi`);
    console.log('');

    if (customers.length === 0) {
      console.log('ℹ️  O\'chiriladigan CUSTOMER yo\'q. Skript tugatildi.');
      return;
    }

    const customerIds = customers.map((m) => m.id);

    console.log(`⏳ ${customers.length} ta CUSTOMER va bog'liq ma'lumotlari o'chirilmoqda...`);
    console.log('');

    // Bitta transaction ichida — all-or-nothing
    // Tartib: eng chuqur bolalardan boshlab, foreign key zanjirga amal qilib
    const [
      cartItems,
      orderItems,
      wishlists,
      reviews,
      addresses,
      carts,
      orders,
      members,
    ] = await prisma.$transaction([
      // 1. cart_items (Cart → Member cascade bor, lekin avval explicit o'chiramiz)
      prisma.cartItem.deleteMany({
        where: { cart: { memberId: { in: customerIds } } },
      }),
      // 2. order_items (Order → Member CASCADE YO'Q — avval o'chirish shart)
      prisma.orderItem.deleteMany({
        where: { order: { memberId: { in: customerIds } } },
      }),
      // 3. wishlists (Member → CASCADE bor)
      prisma.wishlist.deleteMany({
        where: { memberId: { in: customerIds } },
      }),
      // 4. reviews (Member → CASCADE bor)
      prisma.review.deleteMany({
        where: { memberId: { in: customerIds } },
      }),
      // 5. addresses (Member → CASCADE bor)
      prisma.address.deleteMany({
        where: { memberId: { in: customerIds } },
      }),
      // 6. carts — cart_items allaqachon o'chirilgan
      prisma.cart.deleteMany({
        where: { memberId: { in: customerIds } },
      }),
      // 7. orders — order_items allaqachon o'chirilgan; CASCADE yo'qligi uchun bu yerda o'chiramiz
      prisma.order.deleteMany({
        where: { memberId: { in: customerIds } },
      }),
      // 8. members — FAQAT CUSTOMER (ikkinchi xavfsizlik qatlami)
      prisma.member.deleteMany({
        where: { id: { in: customerIds }, role: MemberRole.CUSTOMER },
      }),
    ]);

    console.log('✓ O\'chirilgan qatorlar:');
    console.log(`   cart_items  : ${cartItems.count}`);
    console.log(`   order_items : ${orderItems.count}`);
    console.log(`   wishlists   : ${wishlists.count}`);
    console.log(`   reviews     : ${reviews.count}`);
    console.log(`   addresses   : ${addresses.count}`);
    console.log(`   carts       : ${carts.count}`);
    console.log(`   orders      : ${orders.count}`);
    console.log(`   members     : ${members.count}`);
    console.log('');
    console.log(`✅ ${members.count} ta CUSTOMER va bog'liq ma'lumotlari o'chirildi, ${adminCount} ta ADMIN saqlandi.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Xatolik:', e.message);
  process.exit(1);
});
