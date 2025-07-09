import { readFile, readdir } from "fs/promises";
import { join } from "path";

// Get current directory
const __dirname = process.cwd();

// Path to the API directory
const API_DIR = join(__dirname, "src/app/api");

// List of all Prisma models from the schema
const PRISMA_MODELS = [
  "Account",
  "Session",
  "User",
  "Profile",
  "Exercise",
  "Workout",
  "WorkoutExercise",
  "Food",
  "Recipe",
  "RecipeIngredient",
  "MealEntry",
  "MealEntryRecipe",
  "MealLog",
  "DailyWaterIntake",
  "Weight",
  "Goal",
  "GoalProgress",
  "Notification",
  "WorkoutSession",
  "ExerciseSession",
  "InstructorProfile",
  "StudentInstructor",
  "FoodRecommendation",
  "FoodPlan",
  "WorkoutStreak",
];

// Track model usage
const modelUsage: Record<
  string,
  {
    count: number;
    files: string[];
  }
> = Object.fromEntries(
  PRISMA_MODELS.map((model) => [model, { count: 0, files: [] }]),
);

// Function to check file for Prisma model usage
async function checkFileForPrismaUsage(filePath: string) {
  try {
    const content = await readFile(filePath, "utf-8");
    const relativePath = filePath.replace(process.cwd(), "");

    // Check for Prisma client import patterns
    const prismaClientPattern =
      /(?:import\s+.*\s+from\s+['"]@prisma\/client['"]|const\s+prisma\s*=\s*new\s+PrismaClient)/;
    if (!prismaClientPattern.test(content)) {
      return; // Skip files that don't use Prisma
    }

    PRISMA_MODELS.forEach((model) => {
      // Look for prisma.modelName pattern (with or without client variable name)
      // This will match patterns like: prisma.model, db.model, prismaClient.model, etc.
      const patterns = [
        new RegExp(`[a-zA-Z0-9_]*\.${model}\\b`, "g"), // Basic pattern
        new RegExp(`await\s+[a-zA-Z0-9_]*\.${model}\\b`, "g"), // With await
        new RegExp(
          `const\s+[a-zA-Z0-9_]*\s*=\s*await\s+[a-zA-Z0-9_]*\.${model}\\b`,
          "g",
        ), // With const assignment
      ];

      let matchFound = false;

      patterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches?.length) {
          matchFound = true;
          if (modelUsage[model]) {
            modelUsage[model].count += matches.length;
          }
        }
      });

      if (matchFound && modelUsage[model] && !modelUsage[model].files.includes(relativePath)) {
        modelUsage[model].files.push(relativePath);
      }
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
}

// Recursively process directory
async function processDirectory(directory: string) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and .next directories
        if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
        await processDirectory(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
      ) {
        await checkFileForPrismaUsage(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
  }
}

// Main function
async function main() {
  console.log("🔍 Analyzing API routes for Prisma model usage...\n");

  await processDirectory(API_DIR);

  // Sort models by usage count (descending)
  const sortedModels = Object.entries(modelUsage).sort(
    ([, a], [, b]) => b.count - a.count,
  );

  // Generate report
  console.log("📊 Prisma Model Usage in API Routes\n");
  console.log("Model".padEnd(25) + "Count".padEnd(10) + "Files");
  console.log("-".repeat(80));

  for (const [model, { count, files }] of sortedModels) {
    if (count === 0) continue;

    console.log(`${model.padEnd(25)}${count.toString().padEnd(10)}${files[0]}`);

    // Print additional files if any
    for (let i = 1; i < files.length; i++) {
      console.log(" ".repeat(35) + files[i]);
    }
  }

  // Show unused models
  const unusedModels = sortedModels
    .filter(([, { count }]) => count === 0)
    .map(([model]) => model);

  if (unusedModels.length > 0) {
    console.log("\n🚫 Unused Models in API Routes:");
    console.log(unusedModels.join(", "));
  }

  console.log("\n✅ Analysis complete!");
}

// Run the analysis
main().catch(console.error);
