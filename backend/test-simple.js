import fetch from 'node-fetch';

// Enkel test som kontrollerar att backend-svaret och headers fungerar
// Använder Origin-header för att inspektera CORS-relaterade headers
async function testSimple() {
  console.log('🧪 Enkelt test av CORS-server...');

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
      console.log('✅ Test lyckades:', data);
    } else {
      console.log('❌ Test misslyckades');
    }
  } catch (error) {
    console.error('❌ Testfel:', error.message);
  }
}

testSimple();
