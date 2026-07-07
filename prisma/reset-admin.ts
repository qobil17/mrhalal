import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, MemberRole } from '../generated/prisma/client';

const NEW_PASSWORD = 'Admin1234!';
const SALT_ROUNDS = 10;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL topilmadi (.env faylini tekshiring)');

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const hashed = await bcrypt.hash(NEW_PASSWORD, SALT_ROUNDS);

    const admin = await prisma.member.findFirst({
      where: { role: MemberRole.ADMIN, deletedAt: null },
    });

    if (admin) {
      await prisma.member.update({
        where: { id: admin.id },
        data: { password: hashed, isActive: true },
      });
      console.log('✓ Admin paroli muvaffaqiyatli yangilandi');
      console.log(`  Telefon    : ${admin.phone ?? '(belgilanmagan)'}`);
      console.log(`  Yangi parol: ${NEW_PASSWORD}`);
    } else {
      const created = await prisma.member.create({
        data: {
          phone: '01000000000',
          email: 'admin@mrhalal.com',
          password: hashed,
          firstName: 'Admin',
          role: MemberRole.ADMIN,
          isActive: true,
          cart: { create: {} },
        },
      });
      console.log('✓ Admin topilmadi — yangi admin yaratildi');
      console.log(`  Telefon    : ${created.phone}`);
      console.log(`  Yangi parol: ${NEW_PASSWORD}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Xatolik:', e.message);
  process.exit(1);
});
