import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const user = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      age: 28,
      heightCm: 180,
      weightKg: 78,
      location: 'San Francisco, CA',
    },
  });

  console.log('Created user:', user);

  const report = await prisma.healthReport.create({
    data: {
      userId: user.id,
      reportDate: new Date('2024-05-10T08:00:00Z'),
      laboratory: 'Quest Diagnostics',
      parameters: {
        create: [
          { testName: 'Total Cholesterol', value: 185, unit: 'mg/dL', referenceLow: 125, referenceHigh: 200, category: 'Lipids', status: 'NORMAL' },
          { testName: 'LDL Cholesterol', value: 115, unit: 'mg/dL', referenceLow: 0, referenceHigh: 100, category: 'Lipids', status: 'HIGH' },
          { testName: 'HDL Cholesterol', value: 55, unit: 'mg/dL', referenceLow: 40, referenceHigh: 60, category: 'Lipids', status: 'NORMAL' },
          { testName: 'Triglycerides', value: 95, unit: 'mg/dL', referenceLow: 0, referenceHigh: 150, category: 'Lipids', status: 'NORMAL' },
          { testName: 'Fasting Glucose', value: 88, unit: 'mg/dL', referenceLow: 65, referenceHigh: 99, category: 'Metabolic', status: 'NORMAL' },
          { testName: 'Testosterone (Total)', value: 450, unit: 'ng/dL', referenceLow: 264, referenceHigh: 916, category: 'Hormones', status: 'NORMAL' },
          { testName: 'Vitamin D', value: 28, unit: 'ng/mL', referenceLow: 30, referenceHigh: 100, category: 'Vitamins', status: 'LOW' }
        ]
      }
    }
  });

  console.log('Created report:', report);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
