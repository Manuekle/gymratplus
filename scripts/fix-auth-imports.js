#!/usr/bin/env node

/**
 * Script to fix incorrect auth import paths
 * Replaces overly long relative paths with correct ones
 */

const fs = require("fs");
const path = require("path");

// Calculate correct relative path from a file to root auth.ts
function getCorrectRelativePath(filePath) {
  // Get path relative to project root
  const relativePath = path.relative(process.cwd(), filePath);

  // Count directory depth from src/
  const parts = relativePath.split(path.sep);
  const srcIndex = parts.indexOf("src");

  if (srcIndex === -1) return null;

  // Count how many levels deep we are from src/
  const depth = parts.length - srcIndex - 2; // -2 for src/ and filename

  // Generate correct relative path
  return "../".repeat(depth + 1) + "auth";
}

// Process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Check if file has auth import with any relative path
  const authImportRegex =
    /import\s*{\s*auth\s*}\s*from\s*["'](\.\.\/+)auth["'];?/;
  const match = content.match(authImportRegex);

  if (match) {
    const currentPath = match[1] + "auth";
    const correctPath = getCorrectRelativePath(filePath);

    if (correctPath && currentPath !== correctPath) {
      console.log(`Processing: ${filePath}`);
      console.log(`  Current: ${currentPath}`);
      console.log(`  Correct: ${correctPath}`);

      // Replace with correct path
      content = content.replace(
        /import\s*{\s*auth\s*}\s*from\s*["']\.\.\/+auth["'];?/,
        `import { auth } from "${correctPath}";`,
      );

      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✓ Updated: ${filePath}\n`);
    return true;
  }

  return false;
}

// Recursively find all .ts and .tsx files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith(".") &&
      file !== "node_modules"
    ) {
      findFiles(filePath, fileList);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
const srcDir = path.join(process.cwd(), "src");
console.log(`Scanning ${srcDir} for files with incorrect auth imports...\n`);

const files = findFiles(srcDir);
console.log(`Found ${files.length} TypeScript files\n`);

let updatedCount = 0;
files.forEach((file) => {
  if (processFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✓ Fix complete!`);
console.log(`Updated ${updatedCount} files`);
