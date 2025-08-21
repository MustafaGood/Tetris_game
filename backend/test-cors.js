import fetch from 'node-fetch';

// Enkel test för att kontrollera CORS-svar från backend
// Skickar en GET mot /api/health med Origin-header för att inspektera headers
async function testCORS() {
  console.log('🧪 Testar CORS-konfiguration...');

  try {
    const response = await fetch('http://localhost:3001/api/health', {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Svarstatus:', response.status);
    console.log('📋 Svarhuvuden:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ CORS-test lyckades:', data);
    } else {
      console.log('❌ CORS-test misslyckades');
    }
  } catch (error) {
    console.error('❌ CORS-test fel:', error.message);
  }
}

testCORS();
