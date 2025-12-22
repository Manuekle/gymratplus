#!/usr/bin/env node

/**
 * Script to fix auth import paths with correct relative depth calculation
 */

const fs = require("fs");
const path = require("path");

// Calculate correct relative path from a file to root auth.ts
function getCorrectPath(filePath) {
  // Get absolute paths
  const fileAbsolute = path.resolve(filePath);
  const authAbsolute = path.resolve("auth.ts");

  // Calculate relative path
  const relativePath = path.relative(path.dirname(fileAbsolute), authAbsolute);

  // Convert to forward slashes for consistency
  return relativePath.replace(/\\/g, "/");
}

// Process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Check if file has auth import
  if (!content.includes('from "../../') || !content.includes('auth"')) {
    return false;
  }

  const correctPath = getCorrectPath(filePath);

  console.log(`Processing: ${filePath}`);
  console.log(`  Correct path: ${correctPath}`);

  // Replace any auth import with the correct path
  content = content.replace(
    /import\s*{\s*auth\s*}\s*from\s*["'][^"']*auth["'];?/g,
    `import { auth } from "${correctPath}";`,
  );

  // Also replace handlers import if present
  content = content.replace(
    /import\s*{\s*handlers\s*}\s*from\s*["'][^"']*auth["'];?/g,
    `import { handlers } from "${correctPath}";`,
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✓ Fixed: ${filePath}\n`);
  return true;
}

// Find all .ts files in src/app/api
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
const apiDir = path.join(process.cwd(), "src", "app", "api");
const libDir = path.join(process.cwd(), "src", "lib", "subscriptions");

console.log("Fixing auth import paths...\n");

let updatedCount = 0;

// Fix API routes
const apiFiles = findFiles(apiDir);
apiFiles.forEach((file) => {
  if (processFile(file)) {
    updatedCount++;
  }
});

// Fix lib files
const libFiles = findFiles(libDir);
libFiles.forEach((file) => {
  if (processFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✓ Fix complete!`);
console.log(`Fixed ${updatedCount} files`);
