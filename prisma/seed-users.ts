import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Datos de usuarios reales para screenshots
const USERS_DATA = {
  athletes: [
    {
      name: "Carlos Mendoza",
      email: "carlos.mendoza@example.com",
      password: "password123",
      profile: {
        gender: "male",
        phone: "+34 612 345 678",
        birthdate: new Date("1995-03-15"),
        height: "178",
        currentWeight: "82",
        targetWeight: "78",
        activityLevel: "moderado",
        goal: "perder peso",
        bodyFatPercentage: "18",
        muscleMass: "65",
        trainingFrequency: 5,
        monthsTraining: 24,
        preferredWorkoutTime: "tarde",
        dietaryPreference: "equilibrada",
        dailyCalorieTarget: 2200,
        dailyProteinTarget: 165,
        dailyCarbTarget: 220,
        dailyFatTarget: 73,
        waterIntake: 3.5,
      },
    },
    {
      name: "Ana García",
      email: "ana.garcia@example.com",
      password: "password123",
      profile: {
        gender: "female",
        phone: "+34 623 456 789",
        birthdate: new Date("1992-07-22"),
        height: "165",
        currentWeight: "68",
        targetWeight: "65",
        activityLevel: "activo",
        goal: "ganar músculo",
        bodyFatPercentage: "22",
        muscleMass: "50",
        trainingFrequency: 4,
        monthsTraining: 18,
        preferredWorkoutTime: "mañana",
        dietaryPreference: "alta en proteínas",
        dailyCalorieTarget: 2100,
        dailyProteinTarget: 140,
        dailyCarbTarget: 210,
        dailyFatTarget: 70,
        waterIntake: 2.8,
      },
    },
    {
      name: "Miguel Rodríguez",
      email: "miguel.rodriguez@example.com",
      password: "password123",
      profile: {
        gender: "male",
        phone: "+34 634 567 890",
        birthdate: new Date("1988-11-08"),
        height: "185",
        currentWeight: "90",
        targetWeight: "95",
        activityLevel: "muy activo",
        goal: "ganar músculo",
        bodyFatPercentage: "15",
        muscleMass: "72",
        trainingFrequency: 6,
        monthsTraining: 48,
        preferredWorkoutTime: "tarde",
        dietaryPreference: "volumen",
        dailyCalorieTarget: 3200,
        dailyProteinTarget: 200,
        dailyCarbTarget: 400,
        dailyFatTarget: 107,
        waterIntake: 4.5,
      },
    },
    {
      name: "Laura Fernández",
      email: "laura.fernandez@example.com",
      password: "password123",
      profile: {
        gender: "female",
        phone: "+34 645 678 901",
        birthdate: new Date("1996-01-30"),
        height: "170",
        currentWeight: "72",
        targetWeight: "70",
        activityLevel: "moderado",
        goal: "mantener peso",
        bodyFatPercentage: "25",
        muscleMass: "52",
        trainingFrequency: 3,
        monthsTraining: 12,
        preferredWorkoutTime: "noche",
        dietaryPreference: "vegetariana",
        dailyCalorieTarget: 2000,
        dailyProteinTarget: 120,
        dailyCarbTarget: 250,
        dailyFatTarget: 67,
        waterIntake: 2.5,
      },
    },
    {
      name: "David López",
      email: "david.lopez@example.com",
      password: "password123",
      profile: {
        gender: "male",
        phone: "+34 656 789 012",
        birthdate: new Date("1990-05-12"),
        height: "175",
        currentWeight: "75",
        targetWeight: "80",
        activityLevel: "activo",
        goal: "ganar músculo",
        bodyFatPercentage: "16",
        muscleMass: "60",
        trainingFrequency: 5,
        monthsTraining: 36,
        preferredWorkoutTime: "mañana",
        dietaryPreference: "equilibrada",
        dailyCalorieTarget: 2800,
        dailyProteinTarget: 175,
        dailyCarbTarget: 350,
        dailyFatTarget: 93,
        waterIntake: 3.8,
      },
    },
  ],
  instructors: [
    {
      name: "Roberto Silva",
      email: "roberto.silva@example.com",
      password: "password123",
      instructorProfile: {
        bio: "Entrenador personal certificado con más de 10 años de experiencia. Especializado en entrenamiento de fuerza y acondicionamiento físico. He ayudado a más de 500 clientes a alcanzar sus objetivos.",
        curriculum:
          "Certificado en Entrenamiento Personal (NSCA-CPT), Especialización en Nutrición Deportiva, Certificado en Rehabilitación Funcional",
        pricePerMonth: 89.99,
        contactEmail: "roberto.silva@example.com",
        contactPhone: "+34 667 890 123",
        country: "ES",
        city: "Madrid",
        isRemote: true,
        isVerified: true,
        isPaid: true,
      },
    },
    {
      name: "María González",
      email: "maria.gonzalez@example.com",
      password: "password123",
      instructorProfile: {
        bio: "Entrenadora personal y nutricionista deportiva. Especializada en pérdida de peso y transformación corporal. Enfoque integral: entrenamiento + nutrición para resultados duraderos.",
        curriculum:
          "Licenciada en Ciencias del Deporte, Certificado en Nutrición Deportiva (ISSN), Especialización en Entrenamiento Funcional",
        pricePerMonth: 99.99,
        contactEmail: "maria.gonzalez@example.com",
        contactPhone: "+34 678 901 234",
        country: "ES",
        city: "Barcelona",
        isRemote: true,
        isVerified: true,
        isPaid: true,
      },
    },
    {
      name: "Javier Martínez",
      email: "javier.martinez@example.com",
      password: "password123",
      instructorProfile: {
        bio: "Preparador físico profesional con experiencia en atletas de élite. Especializado en powerlifting y fuerza máxima. Entrenador certificado por la IPF (International Powerlifting Federation).",
        curriculum:
          "Certificado en Powerlifting (IPF), Especialización en Periodización del Entrenamiento, Certificado en Biomecánica Aplicada",
        pricePerMonth: 119.99,
        contactEmail: "javier.martinez@example.com",
        contactPhone: "+34 689 012 345",
        country: "ES",
        city: "Valencia",
        isRemote: true,
        isVerified: true,
        isPaid: true,
      },
    },
    {
      name: "Sofía Ramírez",
      email: "sofia.ramirez@example.com",
      password: "password123",
      instructorProfile: {
        bio: "Entrenadora personal especializada en entrenamiento funcional y movilidad. Certificada en yoga y pilates. Ayudo a personas de todas las edades a mejorar su calidad de vida a través del movimiento.",
        curriculum:
          "Certificado en Entrenamiento Funcional (NASM), Certificación en Yoga (200h), Certificación en Pilates Mat, Especialización en Movilidad y Flexibilidad",
        pricePerMonth: 79.99,
        contactEmail: "sofia.ramirez@example.com",
        contactPhone: "+34 690 123 456",
        country: "ES",
        city: "Sevilla",
        isRemote: true,
        isVerified: true,
        isPaid: true,
      },
    },
    {
      name: "Alejandro Torres",
      email: "alejandro.torres@example.com",
      password: "password123",
      instructorProfile: {
        bio: "Entrenador personal y coach de nutrición. Especializado en culturismo natural y transformación física. Más de 8 años ayudando a personas a alcanzar su mejor versión física.",
        curriculum:
          "Certificado en Culturismo Natural (INBA), Especialización en Nutrición para Ganancia Muscular, Certificado en Suplementación Deportiva",
        pricePerMonth: 109.99,
        contactEmail: "alejandro.torres@example.com",
        contactPhone: "+34 691 234 567",
        country: "ES",
        city: "Málaga",
        isRemote: true,
        isVerified: true,
        isPaid: true,
      },
    },
    {
      name: "Carmen López",
      email: "carmen.lopez@example.com",
      password: "password123",
      instructorProfile: {
        bio: "Entrenadora personal especializada en mujeres. Experta en entrenamiento de fuerza para mujeres, pérdida de grasa y mejora de la composición corporal. Enfoque empático y motivador.",
        curriculum:
          "Certificado en Entrenamiento para Mujeres (NASM), Especialización en Hormonas y Entrenamiento Femenino, Certificado en Nutrición para Mujeres",
        pricePerMonth: 94.99,
        contactEmail: "carmen.lopez@example.com",
        contactPhone: "+34 692 345 678",
        country: "ES",
        city: "Bilbao",
        isRemote: true,
        isVerified: true,
        isPaid: true,
      },
    },
    {
      name: "Diego Fernández",
      email: "diego.fernandez@example.com",
      password: "password123",
      instructorProfile: {
        bio: "Entrenador personal y fisioterapeuta. Especializado en rehabilitación deportiva y prevención de lesiones. Combino entrenamiento funcional con técnicas de fisioterapia para resultados óptimos.",
        curriculum:
          "Licenciado en Fisioterapia, Certificado en Rehabilitación Deportiva, Especialización en Entrenamiento Correctivo, Certificado en Kinesiología Aplicada",
        pricePerMonth: 124.99,
        contactEmail: "diego.fernandez@example.com",
        contactPhone: "+34 693 456 789",
        country: "ES",
        city: "Zaragoza",
        isRemote: true,
        isVerified: true,
        isPaid: true,
      },
    },
    {
      name: "Elena Sánchez",
      email: "elena.sanchez@example.com",
      password: "password123",
      instructorProfile: {
        bio: "Entrenadora personal y nutricionista. Especializada en pérdida de peso sostenible y cambios de hábitos. Mi objetivo es ayudarte a crear un estilo de vida saludable que puedas mantener a largo plazo.",
        curriculum:
          "Licenciada en Nutrición Humana y Dietética, Certificado en Entrenamiento Personal (ACE), Especialización en Psicología del Comportamiento Alimentario",
        pricePerMonth: 89.99,
        contactEmail: "elena.sanchez@example.com",
        contactPhone: "+34 694 567 890",
        country: "ES",
        city: "Murcia",
        isRemote: true,
        isVerified: true,
        isPaid: true,
      },
    },
    {
      name: "Pablo Ruiz",
      email: "pablo.ruiz@example.com",
      password: "password123",
      instructorProfile: {
        bio: "Entrenador personal especializado en calistenia y entrenamiento con peso corporal. Experto en desarrollar fuerza y masa muscular sin necesidad de gimnasio. Ideal para entrenar en casa.",
        curriculum:
          "Certificado en Calistenia Avanzada, Especialización en Entrenamiento con Peso Corporal, Certificado en Movimiento Natural",
        pricePerMonth: 69.99,
        contactEmail: "pablo.ruiz@example.com",
        contactPhone: "+34 695 678 901",
        country: "ES",
        city: "Granada",
        isRemote: true,
        isVerified: true,
        isPaid: true,
      },
    },
    {
      name: "Isabel Morales",
      email: "isabel.morales@example.com",
      password: "password123",
      instructorProfile: {
        bio: "Entrenadora personal y coach de running. Especializada en preparación para carreras, maratones y mejora del rendimiento cardiovascular. Ayudo a corredores de todos los niveles a alcanzar sus metas.",
        curriculum:
          "Certificado en Entrenamiento de Running (RRCA), Especialización en Fisiología del Ejercicio, Certificado en Nutrición para Deportes de Resistencia",
        pricePerMonth: 84.99,
        contactEmail: "isabel.morales@example.com",
        contactPhone: "+34 696 789 012",
        country: "ES",
        city: "Córdoba",
        isRemote: true,
        isVerified: true,
        isPaid: true,
      },
    },
  ],
};

async function seedUsers() {
  console.log("👥 Iniciando seed de usuarios...\n");

  // Hash de contraseña común
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Crear atletas
  console.log("🏃 Creando atletas...");
  const athletes = [];
  for (const athleteData of USERS_DATA.athletes) {
    const { profile, ...userData } = athleteData;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`⏭️  Usuario ya existe: ${userData.name}`);
      athletes.push(existingUser);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        isInstructor: false,
        profile: {
          create: profile,
        },
      },
      include: {
        profile: true,
      },
    });

    athletes.push(user);
    console.log(`✨ Creado atleta: ${userData.name}`);
  }

  // Crear instructores
  console.log("\n💪 Creando instructores...");
  const instructors = [];
  for (const instructorData of USERS_DATA.instructors) {
    const { instructorProfile, ...userData } = instructorData;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
      include: { instructorProfile: true },
    });

    if (existingUser) {
      console.log(`⏭️  Instructor ya existe: ${userData.name}`);
      instructors.push(existingUser);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        isInstructor: true,
        instructorProfile: {
          create: instructorProfile,
        },
      },
      include: {
        instructorProfile: true,
      },
    });

    instructors.push(user);
    console.log(`✨ Creado instructor: ${userData.name}`);
  }

  return { athletes, instructors };
}

async function seedWorkoutStreaks(athletes: any[]) {
  console.log("\n🔥 Creando rachas de entrenamiento...");

  for (const athlete of athletes) {
    // Crear racha con datos variados
    const daysAgo = Math.floor(Math.random() * 7); // 0-6 días
    const lastWorkoutAt = new Date();
    lastWorkoutAt.setDate(lastWorkoutAt.getDate() - daysAgo);
    lastWorkoutAt.setHours(8 + Math.floor(Math.random() * 12), 0, 0, 0); // Entre 8am y 8pm

    const currentStreak =
      daysAgo === 0 ? Math.floor(Math.random() * 30) + 5 : 0;
    const longestStreak = Math.max(
      currentStreak,
      Math.floor(Math.random() * 60) + 10,
    );

    await prisma.workoutStreak.upsert({
      where: { userId: athlete.id },
      update: {
        currentStreak,
        longestStreak,
        lastWorkoutAt: daysAgo < 7 ? lastWorkoutAt : null,
      },
      create: {
        userId: athlete.id,
        currentStreak,
        longestStreak,
        lastWorkoutAt: daysAgo < 7 ? lastWorkoutAt : null,
      },
    });

    console.log(`✨ Racha creada para ${athlete.name}: ${currentStreak} días`);
  }
}

async function seedWeights(athletes: any[]) {
  console.log("\n⚖️  Creando registros de peso...");

  for (const athlete of athletes) {
    const profile = await prisma.profile.findUnique({
      where: { userId: athlete.id },
    });

    if (!profile) continue;

    const currentWeight = parseFloat(profile.currentWeight || "70");
    const records = [];

    // Crear registros de los últimos 90 días
    for (let i = 90; i >= 0; i -= 7) {
      // Un registro por semana
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Variación de peso realista (±2kg)
      const variation = (Math.random() - 0.5) * 4;
      const weight = Math.max(50, Math.min(120, currentWeight + variation));

      records.push({
        userId: athlete.id,
        weight: parseFloat(weight.toFixed(1)),
        date,
      });
    }

    await prisma.weight.createMany({
      data: records,
      skipDuplicates: true,
    });

    console.log(
      `✨ ${records.length} registros de peso creados para ${athlete.name}`,
    );
  }
}

async function seedGoals(athletes: any[]) {
  console.log("\n🎯 Creando objetivos...");

  const goalTypes = [
    {
      type: "weight",
      title: "Perder peso",
      description: "Alcanzar mi peso objetivo",
      unit: "kg",
    },
    {
      type: "strength",
      title: "Aumentar fuerza en press banca",
      description: "Llegar a 100kg en press banca",
      exerciseType: "benchPress",
      unit: "kg",
    },
    {
      type: "measurement",
      title: "Reducir cintura",
      description: "Reducir la medida de cintura a 80cm",
      measurementType: "waist",
      unit: "cm",
    },
  ];

  for (const athlete of athletes) {
    const profile = await prisma.profile.findUnique({
      where: { userId: athlete.id },
    });

    if (!profile) continue;

    // Crear 1-2 objetivos por atleta
    const numGoals = Math.floor(Math.random() * 2) + 1;
    const selectedGoals = goalTypes
      .sort(() => Math.random() - 0.5)
      .slice(0, numGoals);

    for (const goalTemplate of selectedGoals) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60));
      const targetDate = new Date(startDate);
      targetDate.setDate(targetDate.getDate() + 90);

      let targetValue: number | undefined;
      let currentValue: number | undefined;
      let initialValue: number | undefined;

      if (goalTemplate.type === "weight") {
        targetValue = parseFloat(profile.targetWeight || "70");
        currentValue = parseFloat(profile.currentWeight || "75");
        initialValue = currentValue + (Math.random() * 5 + 2);
      } else if (goalTemplate.type === "strength") {
        targetValue = 100;
        currentValue = 70 + Math.random() * 20;
        initialValue = currentValue - 10;
      } else {
        targetValue = 80;
        currentValue = 85 + Math.random() * 5;
        initialValue = currentValue + 5;
      }

      const progress =
        targetValue && currentValue && initialValue
          ? Math.max(
              0,
              Math.min(
                100,
                ((initialValue - currentValue) / (initialValue - targetValue)) *
                  100,
              ),
            )
          : 0;

      const status = progress >= 100 ? "completed" : "active";

      await prisma.goal.create({
        data: {
          userId: athlete.id,
          type: goalTemplate.type,
          title: goalTemplate.title,
          description: goalTemplate.description,
          targetValue,
          currentValue,
          initialValue,
          unit: goalTemplate.unit,
          exerciseType: goalTemplate.exerciseType || null,
          measurementType: goalTemplate.measurementType || null,
          startDate,
          targetDate,
          status,
          progress,
        },
      });
    }

    console.log(`✨ Objetivos creados para ${athlete.name}`);
  }
}

async function seedWorkoutSessions(athletes: any[]) {
  console.log("\n💪 Creando sesiones de entrenamiento...");

  // Obtener algunos ejercicios
  const exercises = await prisma.exercise.findMany({
    take: 20,
  });

  if (exercises.length === 0) {
    console.log(
      "⚠️  No hay ejercicios en la base de datos. Ejecuta SEED_EXERCISES=true npm run seed primero.",
    );
    return;
  }

  for (const athlete of athletes) {
    // Crear 10-20 sesiones de entrenamiento en los últimos 30 días
    const numSessions = Math.floor(Math.random() * 11) + 10;

    for (let i = 0; i < numSessions; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(
        8 + Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 60),
        0,
        0,
      );

      const duration = 45 + Math.floor(Math.random() * 60); // 45-105 minutos
      const completed = Math.random() > 0.1; // 90% completadas

      // Seleccionar 3-6 ejercicios aleatorios
      const numExercises = Math.floor(Math.random() * 4) + 3;
      const selectedExercises = exercises
        .sort(() => Math.random() - 0.5)
        .slice(0, numExercises);

      const workoutSession = await prisma.workoutSession.create({
        data: {
          userId: athlete.id,
          date,
          completed,
          duration,
          exercises: {
            create: selectedExercises.map((exercise, exIndex) => ({
              exerciseId: exercise.id,
              completed,
              sets: {
                create: Array.from(
                  { length: 3 + Math.floor(Math.random() * 2) },
                  (_, setIndex) => ({
                    setNumber: setIndex + 1,
                    weight: completed ? 20 + Math.random() * 80 : null,
                    reps: completed ? 8 + Math.floor(Math.random() * 8) : null,
                    completed,
                  }),
                ),
              },
            })),
          },
        },
      });

      console.log(
        `✨ Sesión creada para ${athlete.name} - ${date.toLocaleDateString()}`,
      );
    }
  }
}

async function seedStudentInstructorRelationships(
  athletes: any[],
  instructors: any[],
) {
  console.log("\n👨‍🏫 Creando relaciones estudiante-instructor...");

  for (const athlete of athletes) {
    // Cada atleta tiene 1-2 instructores asignados
    const numInstructors = Math.floor(Math.random() * 2) + 1;
    const selectedInstructors = instructors
      .sort(() => Math.random() - 0.5)
      .slice(0, numInstructors);

    for (const instructor of selectedInstructors) {
      if (!instructor.instructorProfile) continue;

      await prisma.studentInstructor.upsert({
        where: {
          studentId_instructorProfileId: {
            studentId: athlete.id,
            instructorProfileId: instructor.instructorProfile.id,
          },
        },
        update: {},
        create: {
          studentId: athlete.id,
          instructorProfileId: instructor.instructorProfile.id,
          status: "accepted",
          agreedPrice: instructor.instructorProfile.pricePerMonth,
        },
      });

      console.log(`✨ Relación creada: ${athlete.name} -> ${instructor.name}`);
    }
  }
}

async function seedFoodPlans(athletes: any[], instructors: any[]) {
  console.log("\n🍎 Creando planes nutricionales...");

  // Obtener algunos alimentos
  const foods = await prisma.food.findMany({
    where: { userId: null },
    take: 50,
  });

  if (foods.length === 0) {
    console.log(
      "⚠️  No hay alimentos en la base de datos. Ejecuta npm run seed primero.",
    );
    return;
  }

  for (const athlete of athletes) {
    const profile = await prisma.profile.findUnique({
      where: { userId: athlete.id },
    });

    if (!profile) continue;

    // Encontrar un instructor asignado
    const studentInstructor = await prisma.studentInstructor.findFirst({
      where: {
        studentId: athlete.id,
        status: "accepted",
      },
      include: {
        instructor: {
          include: {
            user: true,
          },
        },
      },
    });

    const instructorId = studentInstructor?.instructor?.user?.id || null;

    // Crear 1-2 planes nutricionales
    const numPlans = Math.floor(Math.random() * 2) + 1;

    for (let planIndex = 0; planIndex < numPlans; planIndex++) {
      const planDate = new Date();
      planDate.setDate(planDate.getDate() - planIndex * 30);

      const calorieTarget = profile.dailyCalorieTarget || 2000;
      const proteinTarget = profile.dailyProteinTarget || 150;
      const carbsTarget = profile.dailyCarbTarget || 250;
      const fatTarget = profile.dailyFatTarget || 67;

      const mealTypes = ["breakfast", "lunch", "dinner", "snacks"];

      // Crear el plan nutricional
      const foodRecommendation = await prisma.foodRecommendation.create({
        data: {
          userId: athlete.id,
          instructorId,
          assignedToId: instructorId ? athlete.id : null,
          date: planDate,
          name: `Plan de ${profile.goal === "perder peso" ? "Definición" : profile.goal === "ganar músculo" ? "Volumen" : "Mantenimiento"}`,
          calorieTarget,
          proteinTarget,
          carbsTarget,
          fatTarget,
          description: `Plan nutricional personalizado para ${profile.goal}`,
          notes: instructorId
            ? "Plan creado por tu instructor. Sigue las recomendaciones para mejores resultados."
            : null,
        },
      });

      // Crear las comidas y sus entradas
      for (let mealIndex = 0; mealIndex < mealTypes.length; mealIndex++) {
        const mealType = mealTypes[mealIndex];

        // Seleccionar 3-5 alimentos por comida
        const numFoods = Math.floor(Math.random() * 3) + 3;
        const selectedFoods = foods
          .sort(() => Math.random() - 0.5)
          .slice(0, numFoods);

        // Crear MealPlanMeal
        const mealPlanMeal = await prisma.mealPlanMeal.create({
          data: {
            foodRecommendationId: foodRecommendation.id,
            mealType,
            order: mealIndex,
          },
        });

        // Crear MealPlanEntry para cada alimento
        for (let foodIndex = 0; foodIndex < selectedFoods.length; foodIndex++) {
          const food = selectedFoods[foodIndex];
          await prisma.mealPlanEntry.create({
            data: {
              mealPlanMealId: mealPlanMeal.id,
              foodId: food.id,
              quantity: 50 + Math.random() * 200, // 50-250g
              order: foodIndex,
            },
          });
        }
      }

      console.log(`✨ Plan nutricional creado para ${athlete.name}`);
    }
  }
}

async function seedMealLogs(athletes: any[]) {
  console.log("\n🍽️  Creando registros de comida...");

  // Obtener algunos alimentos
  const foods = await prisma.food.findMany({
    where: { userId: null },
    take: 30,
  });

  if (foods.length === 0) {
    console.log("⚠️  No hay alimentos en la base de datos.");
    return;
  }

  for (const athlete of athletes) {
    // Crear registros de los últimos 7 días
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);

      const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

      for (const mealType of mealTypes) {
        // 1-3 alimentos por comida
        const numFoods = Math.floor(Math.random() * 3) + 1;
        const selectedFoods = foods
          .sort(() => Math.random() - 0.5)
          .slice(0, numFoods);

        for (const food of selectedFoods) {
          const quantity = 50 + Math.random() * 200;
          const multiplier = quantity / food.serving;

          const consumedAt = new Date(date);
          if (mealType === "breakfast") {
            consumedAt.setHours(
              8 + Math.floor(Math.random() * 2),
              Math.floor(Math.random() * 60),
              0,
              0,
            );
          } else if (mealType === "lunch") {
            consumedAt.setHours(
              13 + Math.floor(Math.random() * 2),
              Math.floor(Math.random() * 60),
              0,
              0,
            );
          } else if (mealType === "dinner") {
            consumedAt.setHours(
              20 + Math.floor(Math.random() * 2),
              Math.floor(Math.random() * 60),
              0,
              0,
            );
          } else {
            consumedAt.setHours(
              10 + Math.floor(Math.random() * 10),
              Math.floor(Math.random() * 60),
              0,
              0,
            );
          }

          await prisma.mealLog.create({
            data: {
              userId: athlete.id,
              foodId: food.id,
              mealType,
              consumedAt,
              quantity,
              calories: Math.round(food.calories * multiplier),
              protein: parseFloat((food.protein * multiplier).toFixed(1)),
              carbs: parseFloat((food.carbs * multiplier).toFixed(1)),
              fat: parseFloat((food.fat * multiplier).toFixed(1)),
            },
          });
        }
      }
    }

    console.log(`✨ Registros de comida creados para ${athlete.name}`);
  }
}

async function clearDatabase() {
  console.log("🗑️  Limpiando base de datos (excepto Exercise y Food)...\n");

  try {
    // Eliminar en orden inverso de dependencias (de más dependiente a menos dependiente)
    // Nota: Exercise y Food NO se eliminan

    console.log("Eliminando SetSession...");
    await prisma.setSession.deleteMany();

    console.log("Eliminando ExerciseSession...");
    await prisma.exerciseSession.deleteMany();

    console.log("Eliminando WorkoutSession...");
    await prisma.workoutSession.deleteMany();

    console.log("Eliminando MealEntryRecipe...");
    await prisma.mealEntryRecipe.deleteMany();

    console.log("Eliminando MealLog...");
    await prisma.mealLog.deleteMany();

    console.log("Eliminando MealPlanEntry...");
    await prisma.mealPlanEntry.deleteMany();

    console.log("Eliminando MealPlanMeal...");
    await prisma.mealPlanMeal.deleteMany();

    console.log("Eliminando FoodRecommendation...");
    await prisma.foodRecommendation.deleteMany();

    console.log("Eliminando GoalProgress...");
    await prisma.goalProgress.deleteMany();

    console.log("Eliminando Goal...");
    await prisma.goal.deleteMany();

    console.log("Eliminando Weight...");
    await prisma.weight.deleteMany();

    console.log("Eliminando DailyWaterIntake...");
    await prisma.dailyWaterIntake.deleteMany();

    console.log("Eliminando RecipeIngredient...");
    await prisma.recipeIngredient.deleteMany();

    console.log("Eliminando Recipe...");
    await prisma.recipe.deleteMany();

    console.log("Eliminando WorkoutExercise...");
    await prisma.workoutExercise.deleteMany();

    console.log("Eliminando Workout...");
    await prisma.workout.deleteMany();

    console.log("Eliminando ChatMessage...");
    await prisma.chatMessage.deleteMany();

    console.log("Eliminando Chat...");
    await prisma.chat.deleteMany();

    console.log("Eliminando StudentInstructor...");
    await prisma.studentInstructor.deleteMany();

    console.log("Eliminando WorkoutStreak...");
    await prisma.workoutStreak.deleteMany();

    console.log("Eliminando Notification...");
    await prisma.notification.deleteMany();

    console.log("Eliminando FoodPlan...");
    await prisma.foodPlan.deleteMany();

    console.log("Eliminando InstructorProfile...");
    await prisma.instructorProfile.deleteMany();

    console.log("Eliminando Profile...");
    await prisma.profile.deleteMany();

    console.log("Eliminando Session...");
    await prisma.session.deleteMany();

    console.log("Eliminando Account...");
    await prisma.account.deleteMany();

    console.log("Eliminando User...");
    await prisma.user.deleteMany();

    console.log(
      "\n✨ Base de datos limpiada! (Exercise y Food se mantienen)\n",
    );
  } catch (error: any) {
    console.error("❌ Error al limpiar la base de datos:", error.message);
    throw error;
  }
}

async function main() {
  console.log("🚀 Iniciando seed de usuarios y datos...\n");

  try {
    // 0. Limpiar base de datos (excepto Exercise y Food)
    await clearDatabase();

    // 1. Crear usuarios
    const { athletes, instructors } = await seedUsers();

    // 2. Crear rachas de entrenamiento
    await seedWorkoutStreaks(athletes);

    // 3. Crear registros de peso
    await seedWeights(athletes);

    // 4. Crear objetivos
    await seedGoals(athletes);

    // 5. Crear sesiones de entrenamiento
    await seedWorkoutSessions(athletes);

    // 6. Crear relaciones estudiante-instructor
    await seedStudentInstructorRelationships(athletes, instructors);

    // 7. Crear planes nutricionales
    await seedFoodPlans(athletes, instructors);

    // 8. Crear registros de comida
    await seedMealLogs(athletes);

    console.log("\n✨ Seed de usuarios completado!");
    console.log("\n📋 Resumen:");
    console.log(`   👥 Atletas: ${athletes.length}`);
    console.log(`   💪 Instructores: ${instructors.length}`);
    console.log("\n🔑 Credenciales de acceso:");
    console.log("   Todos los usuarios tienen la contraseña: password123");
    console.log("\n📧 Emails de ejemplo:");
    athletes.forEach((a) => console.log(`   - ${a.email} (${a.name})`));
    instructors.forEach((i) => console.log(`   - ${i.email} (${i.name})`));
  } catch (error) {
    console.error("❌ Error en el seed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Error fatal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
