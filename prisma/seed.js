const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Admin Account
  const hashedAdminPassword = await bcrypt.hash('534f1ade', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedAdminPassword,
      role: 'ADMIN',
      investorName: 'المدير العام',
    },
  });
  console.log('Admin user created:', admin.username);

  // Demo Investors
  const demoUsers = [
    {
      username: 'ahmed',
      password: await bcrypt.hash('123456', 10),
      investorName: 'أحمد محمود',
      investmentStartDate: new Date('2023-01-15'),
      totalInvestment: 50000,
      status: 'نشط',
      profit: 5000,
    },
    {
      username: 'fatima',
      password: await bcrypt.hash('123456', 10),
      investorName: 'فاطمة الزهراء',
      investmentStartDate: new Date('2023-06-20'),
      totalInvestment: 120000,
      status: 'نشط',
      profit: 15000,
    },
    {
      username: 'omar',
      password: await bcrypt.hash('123456', 10),
      investorName: 'عمر بن علي',
      investmentStartDate: new Date('2024-02-10'),
      totalInvestment: 30000,
      status: 'قيد الانتظار',
      profit: 0,
    }
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: user,
    });
    console.log('Demo user created:', user.username);
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
