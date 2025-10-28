import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

// Emula __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, "../src/components");
const PROJECT_ROOT = path.join(__dirname, "../src");

function getAllComponentFiles(dir: string, basePath = "components"): string[] {
  const files = fs.readdirSync(dir);
  let results: string[] = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(basePath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getAllComponentFiles(fullPath, relativePath));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(relativePath.replace(/\\/g, "/"));
    }
  }

  return results;
}

function getAllProjectFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (
      entry.isDirectory() &&
      !["node_modules", ".git", ".next", "dist", "out", "public"].includes(
        entry.name,
      )
    ) {
      files = files.concat(getAllProjectFiles(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function checkUsage(component: string, projectFiles: string[]): boolean {
  const componentName = path.basename(component).replace(/\.(tsx|ts)$/, "");
  const regex = new RegExp(
    `\\b${componentName}\\b|['"\`]${componentName}['"\`]`,
    "i",
  );

  return projectFiles.some((file) => {
    const content = fs.readFileSync(file, "utf8");
    return regex.test(content);
  });
}

async function promptConfirmDelete(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "¿Deseas BORRAR los componentes no usados? (sí/no): ",
      (answer) => {
        rl.close();
        resolve(
          answer.trim().toLowerCase() === "sí" ||
            answer.trim().toLowerCase() === "si",
        );
      },
    );
  });
}

async function main() {
  const componentFiles = getAllComponentFiles(COMPONENTS_DIR);
  const projectFiles = getAllProjectFiles(PROJECT_ROOT);

  console.log(`🔍 Analizando ${componentFiles.length} componentes...\n`);
  const used: string[] = [];
  const unused: string[] = [];

  for (const component of componentFiles) {
    const isUsed = checkUsage(component, projectFiles);
    if (isUsed) used.push(component);
    else unused.push(component);
  }

  console.log(`✅ Componentes usados (${used.length}):`);
  used.forEach((comp) => console.log("  -", comp));

  console.log(`\n⚠️ Componentes NO usados (${unused.length}):`);
  unused.forEach((comp) => console.log("  -", comp));

  if (unused.length === 0) return;

  const confirm = await promptConfirmDelete();
  if (!confirm) {
    console.log("\n❌ Cancelado. No se borró ningún componente.");
    return;
  }

  for (const unusedComponent of unused) {
    const fullPath = path.join(
      COMPONENTS_DIR,
      unusedComponent.replace("components/", ""),
    );
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️ Eliminado: ${unusedComponent}`);
    }
  }

  console.log(`\n✅ Todos los componentes no usados han sido eliminados.`);
}

main();
