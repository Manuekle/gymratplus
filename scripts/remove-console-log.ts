import { promisify } from 'util';
import { glob as globCb } from 'glob';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const glob = promisify(globCb);

async function removeConsoleLogs() {
  // Busca todos los archivos .ts y .tsx excepto node_modules y .next
  const files = await glob('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**', 'dist/**', 'out/**', 'coverage/**'],
  }) as string[];

  let totalRemoved = 0;

  for (const file of files) {
    const filePath = path.resolve(file);
    const content = await readFile(filePath, 'utf8');
    const lines = content.split('\n');
    // Elimina líneas con console.log que no estén comentadas
    const filtered = lines.filter(line => {
      // Quita espacios al inicio
      const trimmed = line.trimStart();
      // Si la línea comienza con //, la dejamos
      if (trimmed.startsWith('//')) return true;
      // Si contiene console.log fuera de comentario, la eliminamos
      return !/console\.log\s*\(/.test(trimmed);
    });
    const removed = lines.length - filtered.length;
    if (removed > 0) {
      await writeFile(filePath, filtered.join('\n'), 'utf8');
      console.log(`Limpiado ${removed} console.log en ${file}`);
      totalRemoved += removed;
    }
  }
  console.log(`\nListo. Se eliminaron ${totalRemoved} console.log en total.`);
}

removeConsoleLogs().catch(err => {
  console.error('Error eliminando console.log:', err);
  process.exit(1);
}); 