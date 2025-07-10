import fs from 'fs';
import { glob } from 'glob';

// Función para migrar un archivo
function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // Buscar y reemplazar importaciones de hugeicons-react
  const hugeiconsReactRegex = /import\s+{([^}]+)}\s+from\s+['"]hugeicons-react['"];?/g;
  const matches = content.match(hugeiconsReactRegex);
  
  if (matches) {
    hasChanges = true;
    
    // Extraer todos los iconos importados
    let allIcons = [];
    matches.forEach(match => {
      const iconMatch = match.match(/import\s+{([^}]+)}\s+from\s+['"]hugeicons-react['"];?/);
      if (iconMatch) {
        const icons = iconMatch[1].split(',').map(icon => icon.trim());
        allIcons.push(...icons);
      }
    });

    // Crear las nuevas importaciones
    const hugeiconsReactImport = `import { HugeiconsIcon } from "@hugeicons/react";`;
    const coreFreeIconsImport = `import { ${allIcons.join(', ')} } from "@hugeicons/core-free-icons";`;

    // Reemplazar las importaciones antiguas
    content = content.replace(hugeiconsReactRegex, '');
    
    // Agregar las nuevas importaciones después de las importaciones existentes
    const importRegex = /^import\s+.*$/gm;
    const imports = content.match(importRegex) || [];
    const lastImportIndex = content.lastIndexOf(imports[imports.length - 1] || '');
    
    if (lastImportIndex !== -1) {
      const beforeImports = content.substring(0, lastImportIndex + imports[imports.length - 1].length);
      const afterImports = content.substring(lastImportIndex + imports[imports.length - 1].length);
      content = beforeImports + '\n' + hugeiconsReactImport + '\n' + coreFreeIconsImport + afterImports;
    } else {
      content = hugeiconsReactImport + '\n' + coreFreeIconsImport + '\n' + content;
    }

    // Reemplazar el uso de iconos
    allIcons.forEach(icon => {
      const iconName = icon.trim();
      // Buscar uso directo del icono como componente
      const iconUsageRegex = new RegExp(`<${iconName}\\s+([^>]*?)>`, 'g');
      content = content.replace(iconUsageRegex, (match, props) => {
        return `<HugeiconsIcon icon={${iconName}} ${props}>`;
      });
      
      // Buscar uso con auto-cerrar
      const iconUsageSelfClosingRegex = new RegExp(`<${iconName}\\s+([^>]*?)\\s*/>`, 'g');
      content = content.replace(iconUsageSelfClosingRegex, (match, props) => {
        return `<HugeiconsIcon icon={${iconName}} ${props} />`;
      });
    });
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Migrado: ${filePath}`);
  }
}

// Buscar todos los archivos TypeScript/JavaScript
const files = await glob('src/**/*.{ts,tsx,js,jsx}');

console.log('🚀 Iniciando migración de hugeicons-react a @hugeicons/react...');
console.log(`📁 Encontrados ${files.length} archivos para procesar`);

for (const file of files) {
  try {
    migrateFile(file);
  } catch (error) {
    console.error(`❌ Error procesando ${file}:`, error.message);
  }
}

console.log('✅ Migración completada!'); 