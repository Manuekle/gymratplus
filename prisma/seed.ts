import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Limpiar base de datos
  await prisma.goalProgress.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.setSession.deleteMany();
  await prisma.exerciseSession.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.studentInstructor.deleteMany();
  await prisma.instructorProfile.deleteMany();
  await prisma.workoutStreak.deleteMany();
  await prisma.foodPlan.deleteMany();
  await prisma.foodRecommendation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.weight.deleteMany();
  await prisma.dailyWaterIntake.deleteMany();
  await prisma.mealEntryRecipe.deleteMany();
  await prisma.mealEntry.deleteMany();
  await prisma.mealLog.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.food.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios
  const hashedPassword = await hash('123456', 12);
  
  // First create the users
  const userCreates = [
    // Instructor 1
    {
      data: {
        id: 'instructor-1',
        name: 'Carlos Martínez',
        email: 'carlos@fitness.com',
        password: hashedPassword,
        isInstructor: true,
        experienceLevel: 'advanced',
        interests: ['strength', 'bodybuilding', 'nutrition'],
        profile: {
          create: {
            gender: 'male',
            birthdate: new Date('1988-05-15'),
            height: '175',
            currentWeight: '80',
            activityLevel: 'muy activo',
            goal: 'ganar músculo',
            trainingFrequency: 6,
            monthsTraining: 120,
            preferredWorkoutTime: 'mañana',
            dietaryPreference: 'balanced',
            dailyCalorieTarget: 2800,
            dailyProteinTarget: 140,
            dailyCarbTarget: 350,
            dailyFatTarget: 93,
            waterIntake: 3.5,
          }
        },
        instructorProfile: {
          create: {
            bio: 'Entrenador personal certificado con 10 años de experiencia en culturismo y nutrición deportiva.',
            curriculum: 'Certificado ACSM, Especialista en Nutrición Deportiva, Entrenador Nacional de Powerlifting',
            pricePerMonth: 150.0,
            contactEmail: 'carlos@fitness.com',
            contactPhone: '+57 300 123 4567',
            country: 'Colombia',
            city: 'Bogotá',
            isRemote: true,
            isVerified: true,
            isPaid: true,
          }
        }
      },
      include: {
        instructorProfile: true
      }
    },
    
    // Instructor 2
    {
      data: {
        id: 'instructor-2',
        name: 'Ana García',
        email: 'ana@fitness.com',
        password: hashedPassword,
        isInstructor: true,
        experienceLevel: 'advanced',
        interests: ['cardio', 'weight_loss', 'functional'],
        profile: {
          create: {
            gender: 'female',
            birthdate: new Date('1992-08-22'),
            height: '165',
            currentWeight: '58',
            activityLevel: 'muy activo',
            goal: 'mantener peso',
            trainingFrequency: 5,
            monthsTraining: 84,
            preferredWorkoutTime: 'tarde',
            dietaryPreference: 'vegetarian',
            dailyCalorieTarget: 2200,
            dailyProteinTarget: 110,
            dailyCarbTarget: 275,
            dailyFatTarget: 73,
            waterIntake: 2.8,
          }
        },
        instructorProfile: {
          create: {
            bio: 'Especialista en entrenamiento funcional y pérdida de peso. Enfoque integral en bienestar.',
            curriculum: 'Licenciada en Educación Física, Certificada en Entrenamiento Funcional, Nutrición Holística',
            pricePerMonth: 120.0,
            contactEmail: 'ana@fitness.com',
            contactPhone: '+57 300 987 6543',
            country: 'Colombia',
            city: 'Medellín',
            isRemote: false,
            isVerified: true,
            isPaid: true,
          }
        }
      },
      include: {
        instructorProfile: true
      }
    },
    
    // Estudiante 1
    {
      data: {
        id: 'student-1',
        name: 'Juan Pérez',
        email: 'juan@email.com',
        password: hashedPassword,
        isInstructor: false,
        experienceLevel: 'beginner',
        interests: ['weight_loss', 'cardio'],
        profile: {
          create: {
            gender: 'male',
            birthdate: new Date('1995-03-10'),
            height: '170',
            currentWeight: '85',
            targetWeight: '75',
            activityLevel: 'ligero',
            goal: 'perder peso',
            trainingFrequency: 3,
            monthsTraining: 2,
            preferredWorkoutTime: 'noche',
            dietaryPreference: 'balanced',
            dailyCalorieTarget: 2000,
            dailyProteinTarget: 100,
            dailyCarbTarget: 200,
            dailyFatTarget: 89,
            waterIntake: 2.5,
          }
        }
      }
    },
    
    // Estudiante 2
    {
      data: {
        id: 'student-2',
        name: 'María López',
        email: 'maria@email.com',
        password: hashedPassword,
        isInstructor: false,
        experienceLevel: 'intermediate',
        interests: ['strength', 'bodybuilding'],
        profile: {
          create: {
            gender: 'female',
            birthdate: new Date('1990-12-05'),
            height: '160',
            currentWeight: '55',
            targetWeight: '60',
            activityLevel: 'moderado',
            goal: 'ganar músculo',
            trainingFrequency: 4,
            monthsTraining: 18,
            preferredWorkoutTime: 'mañana',
            dietaryPreference: 'high_protein',
            dailyCalorieTarget: 2300,
            dailyProteinTarget: 115,
            dailyCarbTarget: 230,
            dailyFatTarget: 102,
            waterIntake: 3.0,
          }
        }
      }
    },
    
    // Estudiante 3
    {
      data: {
        id: 'student-3',
        name: 'Pedro Ramírez',
        email: 'pedro@email.com',
        password: hashedPassword,
        isInstructor: false,
        experienceLevel: 'advanced',
        interests: ['powerlifting', 'strength'],
        profile: {
          create: {
            gender: 'male',
            birthdate: new Date('1985-07-18'),
            height: '180',
            currentWeight: '90',
            targetWeight: '95',
            activityLevel: 'muy activo',
            goal: 'ganar músculo',
            trainingFrequency: 5,
            monthsTraining: 72,
            preferredWorkoutTime: 'mañana',
            dietaryPreference: 'balanced',
            dailyCalorieTarget: 3000,
            dailyProteinTarget: 150,
            dailyCarbTarget: 375,
            dailyFatTarget: 100,
            waterIntake: 4.0,
          }
        }
      }
    }
  ];

  console.log('✅ Users created');

  // First, create all users
  const createdUsers = [];
  
  for (const userData of userCreates) {
    const user = await prisma.user.create({
      data: userData.data,
      include: userData.include
    });
    createdUsers.push(user);
  }

  // Get all instructor profiles
  const instructorProfiles = [];
  
  // For each created user that is an instructor, get their profile
  for (const user of createdUsers) {
    if (user.isInstructor) {
      const profile = await prisma.instructorProfile.findFirst({
        where: { userId: user.id }
      });
      
      if (profile) {
        instructorProfiles.push(profile);
      }
    }
  }
  
  if (instructorProfiles.length < 2) {
    throw new Error('Failed to create instructor profiles');
  }

  // Create student-instructor relationships
  if (instructorProfiles.length < 2) {
    throw new Error('Not enough instructor profiles created');
  }
  
  const instructor1 = instructorProfiles[0];
  const instructor2 = instructorProfiles[1];
  
  if (!instructor1 || !instructor2) {
    throw new Error('Failed to get instructor profiles');
  }
  
  await prisma.studentInstructor.createMany({
    data: [
      {
        studentId: 'student-1',
        instructorProfileId: instructor1.id,
        status: 'active',
        agreedPrice: 140.0,
      },
      {
        studentId: 'student-2',
        instructorProfileId: instructor2.id,
        status: 'active',
        agreedPrice: 120.0,
      },
      {
        studentId: 'student-3',
        instructorProfileId: instructor1.id,
        status: 'pending',
        agreedPrice: 150.0,
      }
    ]
  });

  console.log('✅ Student-Instructor relationships created');

  // Crear ejercicios
  const exercises = await Promise.all([
    prisma.exercise.create({
      data: {
        name: 'Press de Banca',
        description: 'Ejercicio para pecho, hombros y tríceps',
        muscleGroup: 'pecho',
        equipment: 'barra',
        videoUrl: 'https://example.com/bench-press',
        imageUrl: 'https://example.com/bench-press.jpg',
      }
    }),
    prisma.exercise.create({
      data: {
        name: 'Sentadilla',
        description: 'Ejercicio para piernas y glúteos',
        muscleGroup: 'piernas',
        equipment: 'barra',
        videoUrl: 'https://example.com/squat',
        imageUrl: 'https://example.com/squat.jpg',
      }
    }),
    prisma.exercise.create({
      data: {
        name: 'Peso Muerto',
        description: 'Ejercicio para espalda, piernas y core',
        muscleGroup: 'espalda',
        equipment: 'barra',
        videoUrl: 'https://example.com/deadlift',
        imageUrl: 'https://example.com/deadlift.jpg',
      }
    }),
    prisma.exercise.create({
      data: {
        name: 'Dominadas',
        description: 'Ejercicio para espalda y bíceps',
        muscleGroup: 'espalda',
        equipment: 'barra de dominadas',
        videoUrl: 'https://example.com/pullups',
        imageUrl: 'https://example.com/pullups.jpg',
      }
    }),
    prisma.exercise.create({
      data: {
        name: 'Flexiones',
        description: 'Ejercicio para pecho usando peso corporal',
        muscleGroup: 'pecho',
        equipment: 'peso corporal',
        videoUrl: 'https://example.com/pushups',
        imageUrl: 'https://example.com/pushups.jpg',
      }
    }),
    prisma.exercise.create({
      data: {
        name: 'Curl de Bíceps',
        description: 'Ejercicio para bíceps con mancuernas',
        muscleGroup: 'brazos',
        equipment: 'mancuernas',
        videoUrl: 'https://example.com/bicep-curl',
        imageUrl: 'https://example.com/bicep-curl.jpg',
      }
    })
  ]);

  console.log('✅ Exercises created');

  // Crear rutinas
  const workouts = await Promise.all([
    // Rutina creada por instructor para estudiante
    prisma.workout.create({
      data: {
        name: 'Rutina Fuerza - Principiante',
        description: 'Rutina básica para desarrollo de fuerza',
        createdById: 'instructor-1',
        instructorId: 'instructor-1',
        assignedToId: 'student-1',
        assignedDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'assigned',
        type: 'assigned',
        notes: 'Enfócate en la técnica correcta',
        exercises: {
          create: [
            {
              exerciseId: exercises[0].id,
              sets: 3,
              reps: 10,
              weight: 60,
              restTime: 120,
              order: 1,
              notes: 'Controla el descenso'
            },
            {
              exerciseId: exercises[1].id,
              sets: 3,
              reps: 12,
              weight: 40,
              restTime: 90,
              order: 2,
              notes: 'Mantén la espalda recta'
            },
            {
              exerciseId: exercises[4].id,
              sets: 2,
              reps: 15,
              restTime: 60,
              order: 3,
              notes: 'Modificar a rodillas si es necesario'
            }
          ]
        }
      }
    }),
    
    // Rutina personal del estudiante 2
    prisma.workout.create({
      data: {
        name: 'Mi Rutina Personal',
        description: 'Rutina personalizada para ganar músculo',
        createdById: 'student-2',
        status: 'draft',
        type: 'personal',
        exercises: {
          create: [
            {
              exerciseId: exercises[0].id,
              sets: 4,
              reps: 8,
              weight: 70,
              restTime: 180,
              order: 1
            },
            {
              exerciseId: exercises[2].id,
              sets: 4,
              reps: 6,
              weight: 100,
              restTime: 180,
              order: 2
            },
            {
              exerciseId: exercises[3].id,
              sets: 3,
              reps: 8,
              restTime: 120,
              order: 3
            }
          ]
        }
      }
    }),
    
    // Rutina avanzada para estudiante 3
    prisma.workout.create({
      data: {
        name: 'Rutina Powerlifting',
        description: 'Rutina avanzada para competencia',
        createdById: 'instructor-1',
        instructorId: 'instructor-1',
        assignedToId: 'student-3',
        assignedDate: new Date(),
        status: 'assigned',
        type: 'assigned',
        exercises: {
          create: [
            {
              exerciseId: exercises[0].id,
              sets: 5,
              reps: 5,
              weight: 120,
              restTime: 300,
              order: 1,
              notes: 'Peso máximo, técnica perfecta'
            },
            {
              exerciseId: exercises[1].id,
              sets: 5,
              reps: 5,
              weight: 140,
              restTime: 300,
              order: 2,
              notes: 'Profundidad completa'
            },
            {
              exerciseId: exercises[2].id,
              sets: 3,
              reps: 3,
              weight: 160,
              restTime: 300,
              order: 3,
              notes: 'Despegue explosivo'
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ Workouts created');

  // Crear alimentos
  const foods = await Promise.all([
    prisma.food.create({
      data: {
        name: 'Pechuga de Pollo',
        calories: 165,
        protein: 31.0,
        carbs: 0.0,
        fat: 3.6,
        fiber: 0.0,
        sugar: 0.0,
        serving: 100,
        category: 'proteína',
        mealType: ['almuerzo', 'cena'],
        imageUrl: 'https://example.com/chicken-breast.jpg',
      }
    }),
    prisma.food.create({
      data: {
        name: 'Arroz Integral',
        calories: 111,
        protein: 2.6,
        carbs: 23.0,
        fat: 0.9,
        fiber: 1.8,
        sugar: 0.4,
        serving: 100,
        category: 'carbohidrato',
        mealType: ['almuerzo', 'cena'],
        imageUrl: 'https://example.com/brown-rice.jpg',
      }
    }),
    prisma.food.create({
      data: {
        name: 'Avena',
        calories: 389,
        protein: 16.9,
        carbs: 66.3,
        fat: 6.9,
        fiber: 10.6,
        sugar: 0.0,
        serving: 100,
        category: 'carbohidrato',
        mealType: ['desayuno'],
        imageUrl: 'https://example.com/oats.jpg',
      }
    }),
    prisma.food.create({
      data: {
        name: 'Plátano',
        calories: 89,
        protein: 1.1,
        carbs: 22.8,
        fat: 0.3,
        fiber: 2.6,
        sugar: 12.2,
        serving: 100,
        category: 'fruta',
        mealType: ['desayuno', 'snack'],
        imageUrl: 'https://example.com/banana.jpg',
      }
    }),
    prisma.food.create({
      data: {
        name: 'Almendras',
        calories: 579,
        protein: 21.2,
        carbs: 21.6,
        fat: 49.9,
        fiber: 12.5,
        sugar: 4.4,
        serving: 100,
        category: 'grasa',
        mealType: ['snack'],
        imageUrl: 'https://example.com/almonds.jpg',
      }
    }),
    prisma.food.create({
      data: {
        name: 'Huevo',
        calories: 155,
        protein: 13.0,
        carbs: 1.1,
        fat: 11.0,
        fiber: 0.0,
        sugar: 1.1,
        serving: 100,
        category: 'proteína',
        mealType: ['desayuno'],
        imageUrl: 'https://example.com/eggs.jpg',
      }
    })
  ]);

  console.log('✅ Foods created');

  // Crear recetas
  const recipes = await Promise.all([
    prisma.recipe.create({
      data: {
        name: 'Pollo con Arroz y Verduras',
        description: 'Comida completa alta en proteína',
        instructions: '1. Cocinar el pollo a la plancha\n2. Cocinar el arroz\n3. Saltear verduras\n4. Servir junto',
        preparationTime: 30,
        servings: 2,
        imageUrl: 'https://example.com/chicken-rice.jpg',
        mealType: ['almuerzo', 'cena'],
        calories: 450,
        protein: 35.0,
        carbs: 45.0,
        fat: 8.0,
        fiber: 3.0,
        sugar: 2.0,
        ingredients: {
          create: [
            {
              foodId: foods[0].id,
              quantity: 150,
              unit: 'g'
            },
            {
              foodId: foods[1].id,
              quantity: 100,
              unit: 'g'
            }
          ]
        }
      }
    }),
    prisma.recipe.create({
      data: {
        name: 'Avena con Plátano',
        description: 'Desayuno energético y nutritivo',
        instructions: '1. Cocinar avena con agua\n2. Agregar plátano cortado\n3. Mezclar y servir',
        preparationTime: 10,
        servings: 1,
        imageUrl: 'https://example.com/oatmeal-banana.jpg',
        mealType: ['desayuno'],
        calories: 300,
        protein: 12.0,
        carbs: 58.0,
        fat: 4.0,
        fiber: 8.0,
        sugar: 8.0,
        ingredients: {
          create: [
            {
              foodId: foods[2].id,
              quantity: 50,
              unit: 'g'
            },
            {
              foodId: foods[3].id,
              quantity: 120,
              unit: 'g'
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ Recipes created');

  // Crear registros de comida
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  await Promise.all([
    // Registros para estudiante 1
    prisma.mealLog.create({
      data: {
        userId: 'student-1',
        mealType: 'desayuno',
        consumedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0),
        recipeId: recipes[1].id,
        quantity: 1,
        calories: 300,
        protein: 12.0,
        carbs: 58.0,
        fat: 4.0,
        notes: 'Desayuno energético'
      }
    }),
    prisma.mealLog.create({
      data: {
        userId: 'student-1',
        mealType: 'almuerzo',
        consumedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0),
        recipeId: recipes[0].id,
        quantity: 1,
        calories: 450,
        protein: 35.0,
        carbs: 45.0,
        fat: 8.0,
        notes: 'Almuerzo completo'
      }
    }),
    
    // Registros para estudiante 2
    prisma.mealLog.create({
      data: {
        userId: 'student-2',
        mealType: 'desayuno',
        consumedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 30),
        foodId: foods[5].id,
        quantity: 2,
        calories: 310,
        protein: 26.0,
        carbs: 2.2,
        fat: 22.0,
        notes: 'Huevos revueltos'
      }
    }),
    prisma.mealLog.create({
      data: {
        userId: 'student-2',
        mealType: 'snack',
        consumedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0),
        foodId: foods[4].id,
        quantity: 0.3,
        calories: 174,
        protein: 6.4,
        carbs: 6.5,
        fat: 15.0,
        notes: 'Snack post-entrenamiento'
      }
    })
  ]);

  console.log('✅ Meal logs created');

  // Crear registros de peso
  await Promise.all([
    prisma.weight.create({
      data: {
        userId: 'student-1',
        weight: 85.0,
        bodyFatPercentage: 18.5,
        muscleMassPercentage: 42.0,
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        notes: 'Peso inicial'
      }
    }),
    prisma.weight.create({
      data: {
        userId: 'student-1',
        weight: 83.5,
        bodyFatPercentage: 17.8,
        muscleMassPercentage: 42.8,
        date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        notes: 'Progreso a los 15 días'
      }
    }),
    prisma.weight.create({
      data: {
        userId: 'student-1',
        weight: 82.0,
        bodyFatPercentage: 17.2,
        muscleMassPercentage: 43.5,
        date: now,
        notes: 'Peso actual'
      }
    }),
    
    prisma.weight.create({
      data: {
        userId: 'student-2',
        weight: 55.0,
        bodyFatPercentage: 22.0,
        muscleMassPercentage: 38.0,
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        notes: 'Peso inicial'
      }
    }),
    prisma.weight.create({
      data: {
        userId: 'student-2',
        weight: 56.5,
        bodyFatPercentage: 21.5,
        muscleMassPercentage: 39.2,
        date: now,
        notes: 'Ganando masa muscular'
      }
    })
  ]);

  console.log('✅ Weight records created');

  // Crear objetivos
  // Create goals
  await Promise.all([
    prisma.goal.create({
      data: {
        userId: 'student-1',
        type: 'weight',
        title: 'Perder 10 kg',
        description: 'Reducir peso corporal de manera saludable',
        targetValue: 75.0,
        currentValue: 82.0,
        initialValue: 85.0,
        unit: 'kg',
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        targetDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        status: 'active',
        progress: 30.0,
        progressUpdates: {
          create: [
            {
              value: 83.5,
              date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
              notes: 'Buen progreso'
            },
            {
              value: 82.0,
              date: now,
              notes: 'Continuando la tendencia'
            }
          ]
        }
      }
    }),
    
    prisma.goal.create({
      data: {
        userId: 'student-2',
        type: 'strength',
        title: 'Press de banca 80kg',
        description: 'Alcanzar 80kg en press de banca',
        targetValue: 80.0,
        currentValue: 70.0,
        initialValue: 50.0,
        unit: 'kg',
        exerciseType: 'benchPress',
        startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        targetDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        status: 'active',
        progress: 66.7,
        progressUpdates: {
          create: [
            {
              value: 60.0,
              date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
              notes: 'Mejorando técnica'
            },
            {
              value: 70.0,
              date: now,
              notes: 'Gran progreso!'
            }
          ]
        }
      }
    }),
    
    prisma.goal.create({
      data: {
        userId: 'student-3',
        type: 'strength',
        title: 'Sentadilla 200kg',
        description: 'Objetivo para competencia de powerlifting',
        targetValue: 200.0,
        currentValue: 180.0,
        initialValue: 140.0,
        unit: 'kg',
        exerciseType: 'squat',
        startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        targetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        progress: 66.7,
        progressUpdates: {
          create: [
            {
              value: 160.0,
              date: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
              notes: 'Mejorando profundidad'
            },
            {
              value: 180.0,
              date: now,
              notes: 'Preparándose para competencia'
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ Goals created');

  // Crear sesiones de entrenamiento
  // Create workout sessions
  await Promise.all([
    prisma.workoutSession.create({
      data: {
        userId: 'student-1',
        workoutId: workouts[0].id,
        date: yesterday,
        completed: true,
        duration: 45,
        notes: 'Buen entrenamiento, técnica mejorada',
        exercises: {
          create: [
            {
              exerciseId: exercises[0].id,
              completed: true,
              sets: {
                create: [
                  { setNumber: 1, weight: 60, reps: 10, completed: true },
                  { setNumber: 2, weight: 60, reps: 9, completed: true },
                  { setNumber: 3, weight: 60, reps: 8, completed: true }
                ]
              }
            },
            {
              exerciseId: exercises[1].id,
              completed: true,
              sets: {
                create: [
                  { setNumber: 1, weight: 40, reps: 12, completed: true },
                  { setNumber: 2, weight: 40, reps: 11, completed: true },
                  { setNumber: 3, weight: 40, reps: 10, completed: true }
                ]
              }
            },
            {
              exerciseId: exercises[4].id,
              completed: true,
              sets: {
                create: [
                  { setNumber: 1, reps: 15, completed: true },
                  { setNumber: 2, reps: 12, completed: true }
                ]
              }
            }
          ]
        }
      }
    }),
    
    prisma.workoutSession.create({
      data: {
        userId: 'student-2',
        workoutId: workouts[1].id,
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        completed: true,
        duration: 60,
        notes: 'Excelente sesión, aumenté peso en press',
        exercises: {
          create: [
            {
              exerciseId: exercises[0].id,
              completed: true,
              sets: {
                create: [
                  { setNumber: 1, weight: 70, reps: 8, completed: true },
                  { setNumber: 2, weight: 70, reps: 7, completed: true },
                  { setNumber: 3, weight: 70, reps: 6, completed: true },
                  { setNumber: 4, weight: 65, reps: 8, completed: true }
                ]
              }
            },
            {
              exerciseId: exercises[2].id,
              completed: true,
              sets: {
                create: [
                  { setNumber: 1, weight: 100, reps: 6, completed: true },
                  { setNumber: 2, weight: 100, reps: 5, completed: true },
                  { setNumber: 3, weight: 100, reps: 5, completed: true },
                  { setNumber: 4, weight: 95, reps: 6, completed: true }
                ]
              }
            }
          ]
        }
      }
    }),
    
    prisma.workoutSession.create({
      data: {
        userId: 'student-3',
        workoutId: workouts[2].id,
        date: now,
        completed: false,
        duration: 90,
        notes: 'Sesión de powerlifting - trabajo pesado',
        exercises: {
          create: [
            {
              exerciseId: exercises[0].id,
              completed: true,
              sets: {
                create: [
                  { setNumber: 1, weight: 120, reps: 5, completed: true },
                  { setNumber: 2, weight: 120, reps: 4, completed: true },
                  { setNumber: 3, weight: 120, reps: 3, completed: true },
                  { setNumber: 4, weight: 115, reps: 5, completed: true },
                  { setNumber: 5, weight: 115, reps: 4, completed: true }
                ]
              }
            },
            {
              exerciseId: exercises[1].id,
              completed: true,
              sets: {
                create: [
                  { setNumber: 1, weight: 140, reps: 5, completed: true },
                  { setNumber: 2, weight: 140, reps: 4, completed: true },
                  { setNumber: 3, weight: 140, reps: 3, completed: true },
                  { setNumber: 4, weight: 135, reps: 5, completed: true },
                  { setNumber: 5, weight: 135, reps: 4, completed: true }
                ]
              }
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ Workout sessions created');

  // Crear registros de consumo de agua
  await Promise.all([
    prisma.dailyWaterIntake.create({
      data: {
        userId: 'student-1',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        intake: 2.3
      }
    }),
    prisma.dailyWaterIntake.create({
      data: {
        userId: 'student-1',
        date: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
        intake: 2.8
      }
    }),
    prisma.dailyWaterIntake.create({
      data: {
        userId: 'student-2',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        intake: 3.2
      }
    }),
    prisma.dailyWaterIntake.create({
      data: {
        userId: 'student-3',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        intake: 4.1
      }
    })
  ]);

  console.log('✅ Water intake records created');

  // Crear rachas de entrenamiento
  await Promise.all([
    prisma.workoutStreak.create({
      data: {
        userId: 'student-1',
        currentStreak: 3,
        longestStreak: 5,
        lastWorkoutAt: yesterday,
        lastRestDayAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.workoutStreak.create({
      data: {
        userId: 'student-2',
        currentStreak: 7,
        longestStreak: 12,
        lastWorkoutAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        lastRestDayAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.workoutStreak.create({
      data: {
        userId: 'student-3',
        currentStreak: 15,
        longestStreak: 28,
        lastWorkoutAt: now,
        lastRestDayAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      }
    })
  ]);

  console.log('✅ Workout streaks created');

  // Crear planes alimenticios
  await Promise.all([
    prisma.foodPlan.create({
      data: {
        userId: 'student-1',
        name: 'Plan de Pérdida de Peso',
        description: 'Plan balanceado para perder peso de manera saludable',
        goal: 'cutting',
        calorieTarget: 2000,
        protein: 150,
        carbs: 200,
        fat: 89,
        isActive: true
      }
    }),
    prisma.foodPlan.create({
      data: {
        userId: 'student-2',
        name: 'Plan de Ganancia Muscular',
        description: 'Plan alto en proteínas para ganar masa muscular',
        goal: 'bulking',
        calorieTarget: 2500,
        protein: 140,
        carbs: 280,
        fat: 100,
        isActive: true
      }
    }),
    prisma.foodPlan.create({
      data: {
        userId: 'student-3',
        name: 'Plan de Mantenimiento',
        description: 'Plan para mantener peso y rendimiento',
        goal: 'maintenance',
        calorieTarget: 3000,
        protein: 180,
        carbs: 375,
        fat: 120,
        isActive: true
      }
    })
  ]);

  console.log('✅ Food plans created');

  // Crear recomendaciones alimenticias
  await Promise.all([
    prisma.foodRecommendation.create({
      data: {
        userId: 'student-1',
        date: now,
        macros: {
          protein: 150,
          carbs: 200,
          fat: 89,
          description: 'Recomendación para pérdida de peso'
        },
        meals: {
          breakfast: {
            calories: 400,
            entries: [
              { name: 'Avena con plátano', calories: 300, protein: 12 },
              { name: 'Café negro', calories: 5, protein: 0 }
            ]
          },
          lunch: {
            calories: 600,
            entries: [
              { name: 'Pollo con arroz y verduras', calories: 450, protein: 35 },
              { name: 'Ensalada verde', calories: 150, protein: 3 }
            ]
          },
          dinner: {
            calories: 500,
            entries: [
              { name: 'Pescado a la plancha', calories: 300, protein: 40 },
              { name: 'Verduras al vapor', calories: 100, protein: 4 }
            ]
          },
          snacks: {
            calories: 500,
            entries: [
              { name: 'Almendras', calories: 200, protein: 8 },
              { name: 'Yogur griego', calories: 150, protein: 15 }
            ]
          }
        },
        calorieTarget: 2000
      }
    }),
    prisma.foodRecommendation.create({
      data: {
        userId: 'student-2',
        date: now,
        macros: {
          protein: 140,
          carbs: 280,
          fat: 100,
          description: 'Recomendación para ganancia muscular'
        },
        meals: {
          breakfast: {
            calories: 500,
            entries: [
              { name: 'Batido de proteína con avena', calories: 400, protein: 30 },
              { name: 'Plátano', calories: 100, protein: 1 }
            ]
          },
          lunch: {
            calories: 700,
            entries: [
              { name: 'Pollo con quinoa', calories: 500, protein: 40 },
              { name: 'Aguacate', calories: 200, protein: 3 }
            ]
          },
          dinner: {
            calories: 600,
            entries: [
              { name: 'Salmón con batata', calories: 450, protein: 35 },
              { name: 'Brócoli', calories: 50, protein: 5 }
            ]
          },
          snacks: {
            calories: 700,
            entries: [
              { name: 'Frutos secos', calories: 300, protein: 12 },
              { name: 'Batido post-entrenamiento', calories: 250, protein: 25 }
            ]
          }
        },
        calorieTarget: 2500
      }
    })
  ]);

  console.log('✅ Food recommendations created');

  // Crear notificaciones
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: 'student-1',
        title: '¡Nuevo entrenamiento asignado!',
        message: 'Carlos Martínez te ha asignado una nueva rutina de fuerza',
        type: 'workout',
        read: false
      }
    }),
    prisma.notification.create({
      data: {
        userId: 'student-1',
        title: '¡Racha de 3 días!',
        message: 'Felicitaciones, llevas 3 días consecutivos entrenando',
        type: 'streak',
        read: true
      }
    }),
    prisma.notification.create({
      data: {
        userId: 'student-2',
        title: 'Logro desbloqueado',
        message: '¡Has alcanzado tu objetivo de fuerza en press de banca!',
        type: 'achievement',
        read: false
      }
    }),
    prisma.notification.create({
      data: {
        userId: 'student-2',
        title: 'Día de descanso',
        message: 'Recuerda tomar un día de descanso para recuperarte',
        type: 'rest_day',
        read: false
      }
    }),
    prisma.notification.create({
      data: {
        userId: 'student-3',
        title: 'Próxima competencia',
        message: 'Tu competencia de powerlifting es en 30 días',
        type: 'workout',
        read: false
      }
    }),
    prisma.notification.create({
      data: {
        userId: 'instructor-1',
        title: 'Nuevo estudiante',
        message: 'Pedro Ramírez ha solicitado ser tu alumno',
        type: 'student_request',
        read: false
      }
    })
  ]);

  console.log('✅ Notifications created');

  // Crear algunos alimentos personalizados
  await Promise.all([
    prisma.food.create({
      data: {
        name: 'Proteína Whey Personalizada',
        calories: 120,
        protein: 25.0,
        carbs: 2.0,
        fat: 1.0,
        fiber: 0.0,
        sugar: 1.0,
        serving: 30,
        category: 'proteína',
        mealType: ['snack'],
        userId: 'student-2',
        isFavorite: true
      }
    }),
    prisma.food.create({
      data: {
        name: 'Mix de Nueces Casero',
        calories: 600,
        protein: 18.0,
        carbs: 20.0,
        fat: 52.0,
        fiber: 8.0,
        sugar: 5.0,
        serving: 100,
        category: 'grasa',
        mealType: ['snack'],
        userId: 'student-3',
        isFavorite: true
      }
    })
  ]);

  console.log('✅ Custom foods created');

  // Crear recetas personalizadas
  await Promise.all([
    prisma.recipe.create({
      data: {
        name: 'Batido Post-Entrenamiento',
        description: 'Batido rico en proteínas para después del entrenamiento',
        instructions: '1. Mezclar proteína con agua\n2. Agregar plátano\n3. Licuar hasta obtener consistencia suave',
        preparationTime: 5,
        servings: 1,
        mealType: ['snack'],
        calories: 250,
        protein: 30.0,
        carbs: 25.0,
        fat: 2.0,
        fiber: 3.0,
        sugar: 15.0,
        userId: 'student-2',
        isFavorite: true,
        ingredients: {
          create: [
            {
              foodId: foods[3].id, // Plátano
              quantity: 100,
              unit: 'g'
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ Custom recipes created');

  // Agregar algunos registros de entrada de comida más detallados
  const mealLogs = await prisma.mealLog.findMany({
    where: { userId: 'student-1' },
    take: 1
  });

  if (mealLogs.length > 0 && mealLogs[0]) {
    const mealLog = mealLogs[0];
    await prisma.mealEntry.create({
      data: {
        mealLogId: mealLog.id,
        foodId: foods[2].id, // Avena
        quantity: 0.5
      }
    });

    await prisma.mealEntryRecipe.create({
      data: {
        mealLogId: mealLog.id,
        recipeId: recipes[1].id, // Avena con plátano
        servings: 1
      }
    });
  }

  console.log('✅ Meal entries created');

  // Crear más registros de agua para diferentes fechas
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    return date;
  });

  await Promise.all(
    dates.map(date => {
      const intakeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const intakeValue = 2.5 + Math.random() * 1.5; // Entre 2.5 y 4.0 litros
      
      return prisma.dailyWaterIntake.upsert({
        where: {
          userId_date: {
            userId: 'student-2',
            date: intakeDate
          }
        },
        update: {},
        create: {
          userId: 'student-2',
          date: intakeDate,
          intake: intakeValue
        }
      });
    })
  );

  console.log('✅ Additional water intake records created');

  // Crear cuentas de OAuth simuladas
  await Promise.all([
    prisma.account.create({
      data: {
        userId: 'student-1',
        type: 'oauth',
        provider: 'google',
        providerAccountId: '1234567890',
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'Bearer',
        scope: 'email profile'
      }
    }),
    prisma.account.create({
      data: {
        userId: 'instructor-1',
        type: 'oauth',
        provider: 'github',
        providerAccountId: '0987654321',
        access_token: 'fake-github-token',
        token_type: 'Bearer',
        scope: 'user:email'
      }
    })
  ]);

  console.log('✅ OAuth accounts created');

  // Crear sesiones
  await Promise.all([
    prisma.session.create({
      data: {
        userId: 'student-1',
        sessionToken: 'fake-session-token-1',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      }
    }),
    prisma.session.create({
      data: {
        userId: 'instructor-1',
        sessionToken: 'fake-session-token-2',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      }
    })
  ]);

  console.log('✅ Sessions created');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📊 Database populated with:');
  console.log('- 5 users (2 instructors, 3 students)');
  console.log('- 3 student-instructor relationships');
  console.log('- 6 exercises');
  console.log('- 3 workouts with exercises');
  console.log('- 3 workout sessions with detailed sets');
  console.log('- 8 foods (6 general + 2 custom)');
  console.log('- 3 recipes (2 general + 1 custom)');
  console.log('- Multiple meal logs and entries');
  console.log('- Weight tracking records');
  console.log('- 3 goals with progress tracking');
  console.log('- Water intake records');
  console.log('- Workout streaks');
  console.log('- 3 food plans');
  console.log('- 2 food recommendations');
  console.log('- 6 notifications');
  console.log('- OAuth accounts and sessions');
  console.log('\n✨ Ready to test your fitness app!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });