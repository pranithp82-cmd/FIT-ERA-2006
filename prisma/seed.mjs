import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('🌱 Starting EraFit RBAC & Monitor Management Database Seeding...');

  // Clean old test data
  try {
    await prisma.auditLog.deleteMany();
    await prisma.monitorNote.deleteMany();
    await prisma.assignmentHistory.deleteMany();
    await prisma.userMonitorAssignment.deleteMany();
    await prisma.monitorProfile.deleteMany();
    await prisma.assignedWorkoutPlan.deleteMany();
    await prisma.assignedDietPlan.deleteMany();
    await prisma.bloodParameter.deleteMany();
    await prisma.healthReport.deleteMany();
    if (prisma.dXAParameter) await prisma.dXAParameter.deleteMany();
    if (prisma.dXAReport) await prisma.dXAReport.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.log('Clean table error (ignored):', e.message);
  }

  // 1. Create ADMIN Account
  const adminPassword = hashPassword('Admin@123');
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Eleanor Vance (Chief Admin)',
      email: 'admin@erafit.ai',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1594824813583-690226466f1c?w=400&auto=format&fit=crop&q=80',
      phone: '+1 (555) 019-2834',
    },
  });
  console.log('✅ Created Admin:', admin.email);

  // 2. Create MONITOR 1 (Marcus Vance)
  const monitorPassword = hashPassword('Monitor@123');
  const monitorUser1 = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'marcus.vance@erafit.ai',
      passwordHash: monitorPassword,
      role: 'MONITOR',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&auto=format&fit=crop&q=80',
      phone: '+1 (555) 392-8819',
      gender: 'Male',
      age: 34,
      location: 'Boston, MA',
    },
  });

  const monitorProfile1 = await prisma.monitorProfile.create({
    data: {
      userId: monitorUser1.id,
      monitorId: 'ERA-MON-8942',
      specialization: 'Hypertrophy, Clinical Biomechanics & Injury Rehab',
      experienceYears: 7,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created Monitor 1:', monitorProfile1.monitorId, monitorUser1.email);

  // 3. Create MONITOR 2 (Elena Rostova)
  const monitorUser2 = await prisma.user.create({
    data: {
      name: 'Elena Rostova, CSCS',
      email: 'elena.rostova@erafit.ai',
      passwordHash: monitorPassword,
      role: 'MONITOR',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      phone: '+1 (555) 441-2098',
      gender: 'Female',
      age: 31,
      location: 'New York, NY',
    },
  });

  const monitorProfile2 = await prisma.monitorProfile.create({
    data: {
      userId: monitorUser2.id,
      monitorId: 'ERA-MON-4102',
      specialization: 'Endurance, VO2 Max & Metabolic Conditioning',
      experienceYears: 5,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created Monitor 2:', monitorProfile2.monitorId, monitorUser2.email);

  // 4. Create USER 1 (Alex Mercer - Assigned to Marcus)
  const userPassword = hashPassword('User@123');
  const user1 = await prisma.user.create({
    data: {
      name: 'Alex Mercer',
      email: 'alex.mercer@gmail.com',
      passwordHash: userPassword,
      role: 'USER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      phone: '+1 (555) 839-2041',
      age: 28,
      gender: 'Male',
      heightCm: 182,
      weightKg: 78.4,
      goal: 'Hypertrophy & Longevity',
      bloodType: 'O+ Positive',
      location: 'San Francisco, CA',
      trainerSync: true,
    },
  });

  // Assign user1 to Marcus
  await prisma.userMonitorAssignment.create({
    data: {
      userId: user1.id,
      monitorId: monitorProfile1.id,
      status: 'ACTIVE',
      assignedBy: admin.id,
      notes: 'Initial clinical athletic intake. Focus on unilateral quad balance and 140g+ protein adherence.',
    },
  });

  await prisma.assignmentHistory.create({
    data: {
      userId: user1.id,
      userName: user1.name,
      monitorId: monitorProfile1.id,
      monitorName: monitorUser1.name,
      action: 'ASSIGNED',
      performedBy: admin.name,
      details: 'Assigned to Coach Marcus Vance for Hypertrophy & Longevity training.',
    },
  });

  // 5. Create USER 2 (Sarah Jenkins - Assigned to Marcus)
  const user2 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@gmail.com',
      passwordHash: userPassword,
      role: 'USER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      phone: '+1 (555) 772-1049',
      age: 26,
      gender: 'Female',
      heightCm: 168,
      weightKg: 61.2,
      goal: 'Fat Loss & Muscle Tone',
      bloodType: 'A+ Positive',
      location: 'Austin, TX',
      trainerSync: true,
    },
  });

  await prisma.userMonitorAssignment.create({
    data: {
      userId: user2.id,
      monitorId: monitorProfile1.id,
      status: 'ACTIVE',
      assignedBy: admin.id,
      notes: 'Monitored for progressive strength progression and weekly calorie deficit.',
    },
  });

  // 6. Create USER 3 (Michael Chang - Assigned to Elena)
  const user3 = await prisma.user.create({
    data: {
      name: 'Michael Chang',
      email: 'michael.chang@gmail.com',
      passwordHash: userPassword,
      role: 'USER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      phone: '+1 (555) 662-8812',
      age: 32,
      gender: 'Male',
      heightCm: 175,
      weightKg: 74.0,
      goal: 'Strength & Conditioning',
      bloodType: 'B+ Positive',
      location: 'Seattle, WA',
      trainerSync: true,
    },
  });

  await prisma.userMonitorAssignment.create({
    data: {
      userId: user3.id,
      monitorId: monitorProfile2.id,
      status: 'ACTIVE',
      assignedBy: admin.id,
      notes: 'Triathlon baseline conditioning & threshold pacing.',
    },
  });

  // 7. Create USER 4 (David Chen - Unassigned for Admin testing)
  const user4 = await prisma.user.create({
    data: {
      name: 'David Chen',
      email: 'david.chen@gmail.com',
      passwordHash: userPassword,
      role: 'USER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      phone: '+1 (555) 998-1123',
      age: 29,
      gender: 'Male',
      heightCm: 180,
      weightKg: 82.5,
      goal: 'Cardiovascular Endurance',
      bloodType: 'AB+ Positive',
      location: 'Chicago, IL',
      trainerSync: false,
    },
  });
  console.log('✅ Created 4 Users (Alex, Sarah, Michael, David)');

  // 8. Create Blood Reports and Clinical Data for User 1 (Alex)
  const report1 = await prisma.healthReport.create({
    data: {
      userId: user1.id,
      reportDate: new Date(),
      laboratory: 'Quest Diagnostics Clinical Lab',
      packageId: 'AAROGYAM_COMPLETE_50',
      parameters: {
        create: [
          { testName: 'Hemoglobin', value: 14.8, unit: 'g/dL', referenceLow: 13.5, referenceHigh: 17.5, category: 'Complete Blood Count (CBC)', status: 'NORMAL' },
          { testName: 'Total RBC Count', value: 4.9, unit: 'mill/cumm', referenceLow: 4.5, referenceHigh: 5.9, category: 'Complete Blood Count (CBC)', status: 'NORMAL' },
          { testName: 'Total WBC Count', value: 6800, unit: 'cells/cumm', referenceLow: 4000, referenceHigh: 11000, category: 'Complete Blood Count (CBC)', status: 'NORMAL' },
          { testName: 'Fasting Blood Sugar (Glucose)', value: 92, unit: 'mg/dL', referenceLow: 70, referenceHigh: 99, category: 'Metabolic & Diabetic Profile', status: 'NORMAL' },
          { testName: 'Total Cholesterol', value: 184, unit: 'mg/dL', referenceLow: 125, referenceHigh: 200, category: 'Lipid Profile', status: 'NORMAL' },
          { testName: 'HDL Cholesterol (Good)', value: 58, unit: 'mg/dL', referenceLow: 40, referenceHigh: 60, category: 'Lipid Profile', status: 'NORMAL' },
          { testName: 'LDL Cholesterol (Bad)', value: 108, unit: 'mg/dL', referenceLow: 0, referenceHigh: 100, category: 'Lipid Profile', status: 'HIGH' },
          { testName: 'Serum Ferritin', value: 42, unit: 'ng/mL', referenceLow: 30, referenceHigh: 400, category: 'Iron & Anemia Profile', status: 'NORMAL' },
          { testName: 'Vitamin D3 (25-OH)', value: 24, unit: 'ng/mL', referenceLow: 30, referenceHigh: 100, category: 'Vitamin Profile', status: 'LOW' },
          { testName: 'Vitamin B12', value: 290, unit: 'pg/mL', referenceLow: 211, referenceHigh: 911, category: 'Vitamin Profile', status: 'NORMAL' },
          { testName: 'Total Testosterone', value: 640, unit: 'ng/dL', referenceLow: 264, referenceHigh: 916, category: 'Hormone Profile', status: 'NORMAL' },
        ],
      },
    },
  });

  // 9. Create Assigned Workout Plan for User 1 (Alex) by Marcus
  await prisma.assignedWorkoutPlan.create({
    data: {
      userId: user1.id,
      title: 'Hypertrophy & Left Leg Unilateral Split',
      assignedBy: monitorProfile1.id,
      assignedByName: monitorUser1.name,
      notes: 'Perform unilateral single-leg Romanian Deadlifts first before bilateral squats to fix left hamstring asymmetry.',
      exercises: JSON.stringify([
        { name: 'Single-Leg Romanian Deadlift', sets: 3, reps: '10', weightKg: 24, restSeconds: 75, targetMuscle: 'Hamstrings' },
        { name: 'Bulgarian Split Squat', sets: 3, reps: '12', weightKg: 20, restSeconds: 60, targetMuscle: 'Quads & Glutes' },
        { name: 'Incline Dumbbell Bench Press', sets: 4, reps: '8-10', weightKg: 32, restSeconds: 90, targetMuscle: 'Upper Chest' },
        { name: 'Single-Arm Cable Lat Pulldown', sets: 3, reps: '12-15', weightKg: 30, restSeconds: 60, targetMuscle: 'Lats' },
      ]),
    },
  });

  // 10. Create Assigned Diet Plan for User 1 (Alex) by Marcus
  await prisma.assignedDietPlan.create({
    data: {
      userId: user1.id,
      title: 'High-Protein Muscle Recovery & Micronutrient Boost',
      targetCalories: 2850,
      targetProtein: 165,
      targetCarbs: 320,
      targetFat: 75,
      assignedBy: monitorProfile1.id,
      assignedByName: monitorUser1.name,
      notes: 'Include 3 Desi Country boiled eggs and Moringa Keerai soup daily to address low Vitamin D and support recovery.',
      meals: JSON.stringify([
        { mealType: 'Breakfast', name: '4 Boiled Eggs, Oats with Chia & Walnuts', calories: 650, protein: 42, carbs: 65, fats: 22 },
        { mealType: 'Lunch', name: 'Grilled Chicken / Paneer with Brown Rice & Moringa Keerai', calories: 850, protein: 55, carbs: 95, fats: 24 },
        { mealType: 'Dinner', name: 'Wild Ayala Fish / Moong Dal Sprouts with Steamed Veggies', calories: 750, protein: 48, carbs: 70, fats: 18 },
        { mealType: 'Snacks', name: 'Greek Yogurt / Whey Shake with Almonds', calories: 400, protein: 32, carbs: 30, fats: 12 },
      ]),
    },
  });

  // 11. Create Monitor Notes for Alex
  await prisma.monitorNote.create({
    data: {
      userId: user1.id,
      monitorId: monitorProfile1.id,
      title: 'Bi-Weekly Form Analysis: Squat Depth',
      content: 'Alex has shown notable improvement in ankle dorsiflexion during split squats. Increased working weight to 24kg.',
      category: 'WORKOUT',
      isTask: false,
    },
  });

  await prisma.monitorNote.create({
    data: {
      userId: user1.id,
      monitorId: monitorProfile1.id,
      title: 'Check Vitamin D Supplementation Log',
      content: 'Verify that athlete takes 2000 IU Vitamin D3 daily with breakfast fat source.',
      category: 'MEDICAL_OBSERVATION',
      isTask: true,
      completed: false,
    },
  });

  // 12. Create Initial Audit Logs
  await prisma.auditLog.create({
    data: {
      actorId: monitorProfile1.id,
      actorName: monitorUser1.name,
      actorRole: 'MONITOR',
      targetUserId: user1.id,
      action: 'UPDATE_WORKOUT',
      fieldName: 'Single-Leg RDL Weight',
      previousValue: '20 kg',
      newValue: '24 kg',
      notes: 'Progressive overload based on clean movement video check-in.',
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: monitorProfile1.id,
      actorName: monitorUser1.name,
      actorRole: 'MONITOR',
      targetUserId: user1.id,
      action: 'UPDATE_DIET',
      fieldName: 'Daily Target Protein',
      previousValue: '150 g',
      newValue: '165 g',
      notes: 'Adjusted protein goal for hypertrophy recovery.',
    },
  });

  console.log('🎉 Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
