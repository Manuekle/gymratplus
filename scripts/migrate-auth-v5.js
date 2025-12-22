#!/usr/bin/env node

/**
 * Script to migrate NextAuth v4 getServerSession to v5 auth() helper
 * Updates all API route files in src/app/api
 */

const fs = require("fs");
const path = require("path");

// Calculate relative path from a file to root auth.ts
function getRelativePath(filePath) {
  const depth = filePath.split("/").filter((p) => p && p !== ".").length - 3; // -3 for src/app/api
  return "../".repeat(depth + 3) + "auth";
}

// Process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Check if file uses getServerSession
  if (!content.includes("getServerSession")) {
    return false;
  }

  console.log(`Processing: ${filePath}`);

  // Calculate relative import path
  const relativePath = getRelativePath(filePath);

  // Replace imports
  if (content.includes('import { getServerSession } from "next-auth"')) {
    content = content.replace(
      /import { getServerSession } from "next-auth";?\n/g,
      "",
    );
    modified = true;
  }

  if (content.includes('import { authOptions } from "@/lib/auth/auth"')) {
    content = content.replace(
      /import { authOptions } from "@\/lib\/auth\/auth";?\n/g,
      "",
    );
    modified = true;
  }

  // Add new import if not already present
  if (!content.includes(`import { auth } from "${relativePath}"`)) {
    // Find the last import statement
    const importMatch = content.match(/^import .* from .*;\n/gm);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      content =
        content.slice(0, lastImportIndex + lastImport.length) +
        `import { auth } from "${relativePath}";\n` +
        content.slice(lastImportIndex + lastImport.length);
      modified = true;
    }
  }

  // Replace getServerSession(authOptions) with auth()
  if (content.includes("getServerSession(authOptions)")) {
    content = content.replace(/getServerSession\(authOptions\)/g, "auth()");
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✓ Updated: ${filePath}`);
    return true;
  }

  return false;
}

// Recursively find all route.ts files
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === "route.ts") {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
const projectRoot = path.join(__dirname, "..");
const apiDir = path.join(projectRoot, "src", "app", "api");
console.log(`Scanning ${apiDir} for API routes...`);

const routeFiles = findRouteFiles(apiDir);
console.log(`Found ${routeFiles.length} route files`);

let updatedCount = 0;
routeFiles.forEach((file) => {
  if (processFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✓ Migration complete!`);
console.log(`Updated ${updatedCount} out of ${routeFiles.length} files`);
