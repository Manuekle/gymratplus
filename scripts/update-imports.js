const fs = require("fs");
const path = require("path");

// Files that import AnimatedLayout from the old path
const filesToUpdate = [
  "src/app/dashboard/workout/layout.tsx",
  "src/app/dashboard/instructors/[id]/layout.tsx",
  "src/app/dashboard/notifications/layout.tsx",
  "src/app/dashboard/instructors/layout.tsx",
  "src/app/dashboard/profile/payment/layout.tsx",
  "src/app/dashboard/workout/[id]/layout.tsx",
  "src/app/dashboard/profile/layout.tsx",
  "src/app/dashboard/instructors/search/layout.tsx",
  "src/app/dashboard/workout/history/layout.tsx",
  "src/app/dashboard/health/goal/layout.tsx",
  "src/app/dashboard/health/history/layout.tsx",
  "src/app/dashboard/nutrition/food-plans/layout.tsx",
  "src/app/dashboard/students/list/layout.tsx",
  "src/app/dashboard/health/layout.tsx",
  "src/app/dashboard/students/list/[id]/layout.tsx",
  "src/app/dashboard/students/layout.tsx",
  "src/app/dashboard/nutrition/layout.tsx",
  "src/app/onboarding/recommendations/layout.tsx",
  "src/app/dashboard/nutrition/register-food/layout.tsx",
  "src/app/auth/signup/layout.tsx",
  "src/app/onboarding/layout.tsx",
  "src/app/auth/signin/layout.tsx",
];

// Update each file
filesToUpdate.forEach((filePath) => {
  const fullPath = path.join(process.cwd(), filePath);

  try {
    // Read the file
    let content = fs.readFileSync(fullPath, "utf8");

    // Update the import statement
    const updatedContent = content.replace(
      /from ["']@\/components\/layouts\/animated-layout["']/g,
      'from "@/components/layout/animated-layout"',
    );

    // Write the updated content back to the file
    fs.writeFileSync(fullPath, updatedContent, "utf8");
    console.log(`✅ Updated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log("\n🎉 All files have been updated!");
