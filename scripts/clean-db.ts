// Script to clean database - keeps only Exercise and Food tables
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...');
  console.log('⚠️  This will delete ALL user data except Exercise and Food tables');

  try {
    // Delete in correct order to respect foreign key constraints

    console.log('Deleting ChatMessages...');
    await prisma.chatMessage.deleteMany({});

    console.log('Deleting Chats...');
    await prisma.chat.deleteMany({});

    console.log('Deleting StudentInstructor relationships...');
    await prisma.studentInstructor.deleteMany({});

    console.log('Deleting InstructorProfiles...');
    await prisma.instructorProfile.deleteMany({});

    console.log('Deleting PushSubscriptions...');
    await prisma.pushSubscription.deleteMany({});

    console.log('Deleting VerificationCodes...');
    await prisma.verificationCode.deleteMany({});

    console.log('Deleting Invoices...');
    await prisma.invoice.deleteMany({});

    console.log('Deleting Notifications...');
    await prisma.notification.deleteMany({});

    console.log('Deleting SetSessions...');
    await prisma.setSession.deleteMany({});

    console.log('Deleting ExerciseSessions...');
    await prisma.exerciseSession.deleteMany({});

    console.log('Deleting WorkoutSessions...');
    await prisma.workoutSession.deleteMany({});

    console.log('Deleting WorkoutStreaks...');
    await prisma.workoutStreak.deleteMany({});

    console.log('Deleting MealPlanEntries...');
    await prisma.mealPlanEntry.deleteMany({});

    console.log('Deleting MealPlanMeals...');
    await prisma.mealPlanMeal.deleteMany({});

    console.log('Deleting FoodRecommendations...');
    await prisma.foodRecommendation.deleteMany({});

    console.log('Deleting FoodPlans...');
    await prisma.foodPlan.deleteMany({});

    console.log('Deleting MealEntryRecipes...');
    await prisma.mealEntryRecipe.deleteMany({});

    console.log('Deleting MealLogs...');
    await prisma.mealLog.deleteMany({});

    console.log('Deleting DailyWaterIntake...');
    await prisma.dailyWaterIntake.deleteMany({});

    console.log('Deleting RecipeIngredients...');
    await prisma.recipeIngredient.deleteMany({});

    console.log('Deleting Recipes...');
    await prisma.recipe.deleteMany({});

    console.log('Deleting GoalProgress...');
    await prisma.goalProgress.deleteMany({});

    console.log('Deleting Goals...');
    await prisma.goal.deleteMany({});

    console.log('Deleting Weights...');
    await prisma.weight.deleteMany({});

    console.log('Deleting ProgressPhotos...');
    await prisma.progressPhoto.deleteMany({});

    console.log('Deleting WorkoutExercises...');
    await prisma.workoutExercise.deleteMany({});

    console.log('Deleting Workouts...');
    await prisma.workout.deleteMany({});

    console.log('Deleting Profiles...');
    await prisma.profile.deleteMany({});

    console.log('Deleting Accounts...');
    await prisma.account.deleteMany({});

    console.log('Deleting Sessions...');
    await prisma.session.deleteMany({});

    console.log('Deleting Users...');
    await prisma.user.deleteMany({});

    console.log('✅ Database cleaned successfully!');
    console.log('📊 Kept: Exercise and Food tables');

    // Show counts
    const exerciseCount = await prisma.exercise.count();
    const foodCount = await prisma.food.count();

    console.log(`\n📈 Remaining data:`);
    console.log(`   - Exercises: ${exerciseCount}`);
    console.log(`   - Foods: ${foodCount}`);

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase()
  .then(() => {
    console.log('\n✨ Done! You can now sign in with a fresh account.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
