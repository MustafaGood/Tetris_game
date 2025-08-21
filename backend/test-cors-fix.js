// Enkel testfil för att kontrollera CORS-svar från backend
// Loggar response headers och status på svenska för enklare felsökning
// Enkel test för att kontrollera CORS-konfigurationen
// Skickar en GET mot /api/health med Origin-header och loggar headers
async function testCors() {
  const backendUrl = 'http://localhost:3001';
  const frontendOrigin = 'http://localhost:3000';

  console.log('🔍 Testar CORS-konfiguration...');
  console.log(`Backend-URL: ${backendUrl}`);
  console.log(`Frontend-origin: ${frontendOrigin}`);

  try {
    const response = await fetch(`${backendUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Origin': frontendOrigin,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Svarstatus: ${response.status} ${response.statusText}`);
    console.log('📡 CORS-headers:');
    console.log(`  Access-Control-Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);
    console.log(`  Access-Control-Allow-Methods: ${response.headers.get('access-control-allow-methods')}`);
    console.log(`  Access-Control-Allow-Headers: ${response.headers.get('access-control-allow-headers')}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Lyckades! Svar:', data);
    } else {
      console.log(`❌ Misslyckades med status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Testet misslyckades:', error.message);
  }
}

testCors();
