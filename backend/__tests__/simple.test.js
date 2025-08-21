// Enkla tester för att verifiera testmiljön

// --- Grundläggande Jest-tester ---
// Bekräftar att testmiljön fungerar och hanterar asynkron kod
describe('Enkla Jest-tester', () => {
  test('ska fungera korrekt', () => {
    // Enkel sanity-check
    expect(1 + 1).toBe(2);
  });

  test('ska hantera miljövariabler', () => {
    // NODE_ENV ska vara 'test' när vi kör tester
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('ska hantera asynkrona operationer', async () => {
    // Simulerar en asynkron operation som resolves
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });
});

// --- Matematiska basfunktioner ---
// Enkla matematiktester för att verifiera beteende
describe('Matematiska operationer', () => {
  test('addition fungerar', () => {
    expect(5 + 3).toBe(8);
  });

  test('multiplikation fungerar', () => {
    expect(4 * 6).toBe(24);
  });

  test('division fungerar', () => {
    expect(15 / 3).toBe(5);
  });
});
