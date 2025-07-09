#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, extname, relative } from "path";

interface RouteError {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning";
}

class NextJSRouteChecker {
  private projectRoot: string;
  private routesDir: string;
  private apiRoutesDir: string;
  private errors: RouteError[] = [];

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.routesDir = join(projectRoot, "src/app");
    this.apiRoutesDir = join(projectRoot, "src/pages/api");
  }

  /**
   * Ejecuta el script principal
   */
  async run(): Promise<void> {
    console.log("🔍 Analizando rutas de Next.js...\n");

    // Verificar si existe tsconfig.json
    if (!this.hasTsConfig()) {
      console.error("❌ No se encontró tsconfig.json en el proyecto");
      process.exit(1);
    }

    // Encontrar archivos de rutas
    const routeFiles = this.findRouteFiles();

    if (routeFiles.length === 0) {
      console.log("ℹ️  No se encontraron archivos de rutas");
      return;
    }

    console.log(`📁 Encontrados ${routeFiles.length} archivos de rutas`);

    // Analizar cada archivo
    for (const file of routeFiles) {
      await this.analyzeRouteFile(file);
    }

    // Ejecutar verificación de tipos con TypeScript
    await this.runTypeCheck();

    // Mostrar resultados
    this.showResults();
  }

  /**
   * Verifica si existe tsconfig.json
   */
  private hasTsConfig(): boolean {
    return existsSync(join(this.projectRoot, "tsconfig.json"));
  }

  /**
   * Encuentra todos los archivos de rutas
   */
  private findRouteFiles(): string[] {
    const routeFiles: string[] = [];

    // Buscar en app router (Next.js 13+)
    if (existsSync(this.routesDir)) {
      this.scanDirectory(this.routesDir, routeFiles, ["route.ts", "route.js"]);
    }

    // Buscar en pages/api (Next.js tradicional)
    if (existsSync(this.apiRoutesDir)) {
      this.scanDirectory(this.apiRoutesDir, routeFiles, [".ts", ".js"]);
    }

    return routeFiles;
  }

  /**
   * Escanea un directorio recursivamente
   */
  private scanDirectory(
    dir: string,
    files: string[],
    extensions: string[],
  ): void {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        this.scanDirectory(fullPath, files, extensions);
      } else if (stat.isFile()) {
        const ext = extname(item);
        const filename = item;

        if (extensions.some((e) => filename.endsWith(e) || e === ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  /**
   * Analiza un archivo de ruta específico
   */
  private analyzeRouteFile(filePath: string): void {
    const content = readFileSync(filePath, "utf-8");
    const relativePath = relative(this.projectRoot, filePath);

    // Verificaciones básicas
    this.checkBasicSyntax(content, relativePath);

    // Verificaciones específicas de Next.js
    this.checkNextJSRoutePatterns(content, relativePath);

    // Verificar imports problemáticos
    this.checkProblematicImports(content, relativePath);

    // Verificar tipos de Request/Response
    this.checkRequestResponseTypes(content, relativePath);
  }

  /**
   * Verificaciones sintácticas básicas
   */
  private checkBasicSyntax(content: string, filePath: string): void {
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Verificar imports problemáticos
      if (line.includes("import") && !line.includes("from")) {
        if (!line.includes("* as") && !line.includes("type")) {
          this.addError(
            filePath,
            lineNumber,
            1,
            "Import statement posiblemente mal formado",
            "warning",
          );
        }
      }

      // Verificar exports
      if (
        line.includes("export") &&
        !line.includes("export default") &&
        !line.includes("export function")
      ) {
        if (!line.includes("export const") && !line.includes("export async")) {
          this.addError(
            filePath,
            lineNumber,
            1,
            "Export statement posiblemente mal formado",
            "warning",
          );
        }
      }
    });
  }

  /**
   * Verificaciones específicas de Next.js
   */
  private checkNextJSRoutePatterns(content: string, filePath: string): void {
    const lines = content.split("\n");
    let inRouteHandler = false;
    let currentHandlerType = "";

    lines.forEach((line, index) => {
      // Check for route handler exports
      const routeHandlerMatch = line.match(
        /export\s+(?:async\s+)?(?:const|function|let|var)\s*([A-Za-z0-9_]+)\s*[=:]/i,
      );
      if (routeHandlerMatch?.[1]) {
        const handlerName = routeHandlerMatch[1].toUpperCase();
        if (
          ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"].includes(
            handlerName,
          )
        ) {
          inRouteHandler = true;
          currentHandlerType = handlerName;

          // Check for proper request parameter typing
          const requestParamMatch = line.match(/\(([^)]*)\)/);
          if (requestParamMatch?.[1]) {
            const params = requestParamMatch[1].trim();
            if (!params || params === "req" || params === "request") {
              this.addError(
                filePath,
                index + 1,
                1,
                `El manejador ${currentHandlerType} debería tipar el parámetro de solicitud (ej: req: NextRequest)`,
                "warning",
              );
            } else if (params.includes("any") || params.includes("unknown")) {
              this.addError(
                filePath,
                index + 1,
                1,
                `Evita usar 'any' o 'unknown' para el tipo del parámetro de solicitud en ${currentHandlerType}`,
                "warning",
              );
            }
          }
        }
      }
      // Check for traditional function syntax
      else if (
        line.match(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/i)
      ) {
        const funcMatch = line.match(
          /export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/i,
        );
        if (funcMatch?.[1]) {
          const funcName = funcMatch[1].toUpperCase();
          if (
            [
              "GET",
              "POST",
              "PUT",
              "DELETE",
              "PATCH",
              "OPTIONS",
              "HEAD",
            ].includes(funcName)
          ) {
            inRouteHandler = true;
            currentHandlerType = funcName;

            const requestParamMatch = line.match(/\(([^)]*)\)/);
            if (requestParamMatch?.[1]) {
              const params = requestParamMatch[1].trim();
              if (!params || params === "req" || params === "request") {
                this.addError(
                  filePath,
                  index + 1,
                  1,
                  `El manejador ${currentHandlerType} debería tipar el parámetro de solicitud (ej: req: NextRequest)`,
                  "warning",
                );
              }
            }
          }
        }
      }

      // Check return type
      if (inRouteHandler && line.includes("return")) {
        if (
          !line.includes("NextResponse") &&
          !line.includes("Response") &&
          !line.includes("NextApiResponse")
        ) {
          this.addError(
            filePath,
            index + 1,
            1,
            `El manejador ${currentHandlerType} debería devolver una respuesta NextResponse/Response`,
            "warning",
          );
        }
      }

      // Check for function closing
      if (inRouteHandler && line.includes("}")) {
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;

        if (closeBraces > openBraces) {
          inRouteHandler = false;
          currentHandlerType = "";
        }
      }
    });
  }

  /**
   * Verifica imports problemáticos
   */
  private checkProblematicImports(content: string, filePath: string): void {
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Verificar imports de módulos no válidos
      if (line.includes("import") && line.includes("from")) {
        // Verificar imports de módulos internos de Next.js que no deberían usarse en rutas
        if (line.includes("next/client") || line.includes("next/document")) {
          this.addError(
            filePath,
            lineNumber,
            1,
            "No deberías importar módulos de cliente en rutas de API",
            "warning",
          );
        }

        // Verificar imports relativos problemáticos
        if (line.includes("../../..") || line.includes("../../../..")) {
          this.addError(
            filePath,
            lineNumber,
            1,
            "Import con muchos niveles relativos, considera usar alias",
            "warning",
          );
        }
      }
    });
  }

  /**
   * Verifica tipos de Request/Response
   */
  private checkRequestResponseTypes(content: string, filePath: string): void {
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Verificar si se usan tipos correctos para Request/Response
      if (line.includes("Request") && !line.includes("NextRequest")) {
        if (line.includes("export") && (line.includes("GET") || line.includes("POST") || line.includes("PUT") || line.includes("DELETE"))) {
          this.addError(
            filePath,
            lineNumber,
            1,
            "Considera usar NextRequest en lugar de Request genérico",
            "warning",
          );
        }
      }

      // Verificar imports de tipos de Next.js
      if (line.includes("import") && line.includes("next/server")) {
        if (!line.includes("NextRequest") && !line.includes("NextResponse")) {
          this.addError(
            filePath,
            lineNumber,
            1,
            "Asegúrate de importar NextRequest y NextResponse de next/server",
            "warning",
          );
        }
      }
    });
  }

  /**
   * Ejecuta verificación de tipos con TypeScript
   */
  private async runTypeCheck(): Promise<void> {
    return new Promise((resolve) => {
      try {
        console.log("\n🔍 Ejecutando verificación de tipos de TypeScript...");
        execSync("npx tsc --noEmit --pretty false", {
          cwd: this.projectRoot,
          stdio: "pipe",
          encoding: "utf-8",
        });
        console.log("✅ La verificación de tipos se completó sin errores");
      } catch (error: any) {
        const output =
          error.stdout?.toString() || error.stderr?.toString() || error.message;
        const errors = this.parseTypeScriptErrors(output);
        errors.forEach((err) => {
          this.addError(err.file, err.line, err.column, err.message, err.severity);
        });
      } finally {
        resolve();
      }
    });
  }

  /**
   * Parsea errores de TypeScript
   */
  private parseTypeScriptErrors(output: string): RouteError[] {
    const errors: RouteError[] = [];
    const errorPattern =
      /(.+)\((\d+),(\d+)\):\s+(error|warning)\s+TS\d+:\s+(.+)/g;
    let match;

    while ((match = errorPattern.exec(output)) !== null) {
      const [, file, line, column, severity, message] = match;

      // Solo incluir errores de archivos de rutas
      if (file && this.isRouteFile(file)) {
        errors.push({
          file: relative(this.projectRoot, file),
          line: parseInt(line || '1'),
          column: parseInt(column || '1'),
          message: message || 'Error desconocido',
          severity: (severity as "error" | "warning") || 'error',
        });
      }
    }
    
    return errors;
  }

  /**
   * Verifica si un archivo es un archivo de ruta
   */
  private isRouteFile(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, "/");
    return (
      normalizedPath.includes("/src/app/") ||
      normalizedPath.includes("/pages/api/")
    );
  }

  /**
   * Añade un error a la lista
   */
  private addError(
    file: string,
    line: number,
    column: number,
    message: string,
    severity: "error" | "warning",
  ): void {
    this.errors.push({
      file: relative(this.projectRoot, file),
      line,
      column,
      message,
      severity,
    });
  }

  /**
   * Muestra los resultados
   */
  private showResults(): void {
    if (this.errors.length === 0) {
      console.log("\n✅ No se encontraron problemas en las rutas");
      return;
    }

    console.log("\n📊 RESULTADOS DEL ANÁLISIS");
    console.log("=".repeat(60));

    const errors = this.errors.filter((e) => e.severity === "error");
    const warnings = this.errors.filter((e) => e.severity === "warning");

    console.log(`❌ Errores: ${errors.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}\n`);

    // Group by file
    const groupedByFile = this.errors.reduce(
      (acc: Record<string, RouteError[]>, error) => {
        if (!acc[error.file]) {
          acc[error.file] = [];
        }
        acc[error.file]?.push(error);
        return acc;
      },
      {} as Record<string, RouteError[]>,
    );

    // Show errors by file
    for (const [file, fileErrors] of Object.entries(groupedByFile)) {
      console.log(`📄 ${file}`);

      // Sort errors by line number
      fileErrors.sort((a, b) => a.line - b.line);

      for (const error of fileErrors) {
        const icon = error.severity === "error" ? "❌" : "⚠️";
        console.log(`  ${icon} Línea ${error.line}: ${error.message}`);
      }
      console.log();
    }

    // Show summary
    if (errors.length > 0) {
      console.log("\n❌ Se encontraron errores que necesitan ser corregidos.");
      process.exit(1);
    } else if (warnings.length > 0) {
      console.log("\n⚠️  Se encontraron advertencias. Considera revisarlas.");
    }
  }

}

// Ejecutar el script
if (require.main === module) {
  const checker = new NextJSRouteChecker();
  checker.run().catch(console.error);
}

export default NextJSRouteChecker;
