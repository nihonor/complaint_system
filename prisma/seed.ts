import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  // Create agency official
  const agencyPassword = await hash('agency123', 10);
  const agencyOfficial = await prisma.user.upsert({
    where: { email: 'agency@example.com' },
    update: {},
    create: {
      email: 'agency@example.com',
      name: 'Agency Official',
      password: agencyPassword,
      role: UserRole.AGENCY_OFFICIAL,
    },
  });

  // Create regular user
  const userPassword = await hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: UserRole.USER,
    },
  });

  console.log({ admin, agencyOfficial, user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

