import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, MemberRole } from '../generated/prisma/client';

const TARGET_ID = 1;
const SAFE_ID = 3; // Qobilbek — umuman tegilmaydi

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL topilmadi (.env faylini tekshiring)');

  const isLocalhost =
    connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  if (!isLocalhost) {
    console.error('⛔ XAVF: DATABASE_URL localhost emas!');
    console.error('   To\'xtatildi — hech narsa o\'zgartirilmadi.');
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    // id = 1 member'ni tekshir
    const target = await prisma.member.findUnique({
      where: { id: TARGET_ID },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true },
    });

    if (!target) {
      console.error(`⛔ id = ${TARGET_ID} bo'lgan member topilmadi. To'xtatildi.`);
      process.exit(1);
    }

    console.log(`ℹ️  Nishon member:`);
    console.log(`   id        : ${target.id}`);
    console.log(`   firstName : ${target.firstName}`);
    console.log(`   lastName  : ${target.lastName ?? '—'}`);
    console.log(`   email     : ${target.email ?? '—'}`);
    console.log(`   phone     : ${target.phone ?? '—'}`);
    console.log(`   role      : ${target.role}`);
    console.log('');

    if (target.role !== MemberRole.ADMIN) {
      console.error(`⛔ id = ${TARGET_ID} member ADMIN emas (role: ${target.role}). Kutilmagan holat — to'xtatildi.`);
      process.exit(1);
    }

    // Qobilbek (id=3) saqlanganligini tasdiqlash
    const safe = await prisma.member.findUnique({
      where: { id: SAFE_ID },
      select: { id: true, firstName: true },
    });
    console.log(`ℹ️  Himoyalangan member: id = ${SAFE_ID}, firstName = ${safe?.firstName ?? '(topilmadi)'} — tegmaslik kafolatlangan`);
    console.log('');

    console.log(`⏳ Joseph (id = ${TARGET_ID}) va bog'liq ma'lumotlari o'chirilmoqda...`);
    console.log('');

    const [
      cartItems,
      orderItems,
      wishlists,
      reviews,
      addresses,
      carts,
      orders,
      member,
    ] = await prisma.$transaction([
      // 1. cart_items
      prisma.cartItem.deleteMany({
        where: { cart: { memberId: TARGET_ID } },
      }),
      // 2. order_items (orders.memberId → Member CASCADE YO'Q — avval o'chirish shart)
      prisma.orderItem.deleteMany({
        where: { order: { memberId: TARGET_ID } },
      }),
      // 3. wishlists
      prisma.wishlist.deleteMany({
        where: { memberId: TARGET_ID },
      }),
      // 4. reviews
      prisma.review.deleteMany({
        where: { memberId: TARGET_ID },
      }),
      // 5. addresses
      prisma.address.deleteMany({
        where: { memberId: TARGET_ID },
      }),
      // 6. carts
      prisma.cart.deleteMany({
        where: { memberId: TARGET_ID },
      }),
      // 7. orders
      prisma.order.deleteMany({
        where: { memberId: TARGET_ID },
      }),
      // 8. member — faqat id = 1, boshqa hech kim
      prisma.member.delete({
        where: { id: TARGET_ID },
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
    console.log(`   members     : 1`);
    console.log('');
    console.log(`✅ Joseph (id=${TARGET_ID}) o'chirildi, Qobilbek (id=${SAFE_ID}) saqlandi.`);

    // member o'zgaruvchisi ishlatilmagan degan warning'ni oldini olish uchun
    void member;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Xatolik:', e.message);
  process.exit(1);
});
