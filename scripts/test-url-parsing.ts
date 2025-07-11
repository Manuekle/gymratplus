// Script para probar la extracción del ID de la URL
const testUrl = "http://localhost:3000/api/student-instructor-requests/cmcy1zlu6000wv90wst4737a6/accept";

console.log('🔍 Probando extracción de ID de URL:');
console.log(`URL: ${testUrl}`);

const url = new URL(testUrl);
console.log(`Pathname: ${url.pathname}`);

const pathParts = url.pathname.split("/");
console.log(`Path parts: ${JSON.stringify(pathParts)}`);

// Método anterior (incorrecto)
const oldExtractedId = pathParts.pop();
console.log(`Old method - Extracted ID: ${oldExtractedId}`);

// Método nuevo (correcto)
const newExtractedId = pathParts[pathParts.length - 2];
console.log(`New method - Extracted ID: ${newExtractedId}`);

// Verificar si el ID extraído es correcto
const expectedId = 'cmcy1zlu6000wv90wst4737a6';
console.log(`Expected ID: ${expectedId}`);
console.log(`Old method match: ${oldExtractedId === expectedId ? '✅' : '❌'}`);
console.log(`New method match: ${newExtractedId === expectedId ? '✅' : '❌'}`);

// Simular el comportamiento del endpoint
if (!newExtractedId) {
  console.log('❌ ID no proporcionado');
} else {
  console.log('✅ ID extraído correctamente');
} 