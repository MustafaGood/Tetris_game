import express from "express";
import cors from "cors";

// Enkel server för att testa CORS-inställningar lokalt
// Innehåller några enkla endpoints för hälsokontroll och test

const app = express();

// Tillåt alla origin för teständamål (ej för produktion)
app.use(cors({
  origin: true, 
  credentials: false
}));

// Parsar inkommande JSON-kroppar
app.use(express.json());

// Hälsokontroll-endpoint
app.get('/api/health', (req, res) => {
  console.log('🏥 Hälsokontroll förfrågan från:', req.headers.origin);
  res.json({ 
    ok: true, 
    message: 'Servern är igång',
    timestamp: new Date().toISOString(),
    cors: 'aktiverad'
  });
});

// Enkel GET-test för CORS
app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS-test lyckades' });
});

// Enkel POST-test som returnerar mottagen data
app.post('/api/test', (req, res) => {
  res.json({ message: 'POST-test lyckades', data: req.body });
});

// Port för testservern
const PORT = 3001;

// Starta servern
app.listen(PORT, () => {
  console.log(`✅ CORS-testserver körs på http://localhost:${PORT}`);
  console.log(`🌐 CORS: Alla origin tillåtna för testning`);
});

export default app;
