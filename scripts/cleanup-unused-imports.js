#!/usr/bin/env node

/**
 * Script to remove unused getServerSession imports from migrated files
 */

const fs = require("fs");
const path = require("path");

// Process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Check if file has unused getServerSession import
  if (
    content.includes("getServerSession") &&
    content.includes('from "next-auth')
  ) {
    console.log(`Processing: ${filePath}`);

    // Remove the getServerSession import line
    content = content.replace(
      /import\s*{\s*getServerSession\s*}\s*from\s*["']next-auth[^"']*["'];?\n/g,
      "",
    );

    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✓ Removed unused import from: ${filePath}`);
    return true;
  }

  return false;
}

// Recursively find all .ts files
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
    } else if (file.endsWith(".ts")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
const apiDir = path.join(process.cwd(), "src", "app", "api");
console.log(`Scanning ${apiDir} for unused getServerSession imports...\n`);

const files = findFiles(apiDir);
console.log(`Found ${files.length} TypeScript files\n`);

let updatedCount = 0;
files.forEach((file) => {
  if (processFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✓ Cleanup complete!`);
console.log(`Removed unused imports from ${updatedCount} files`);
