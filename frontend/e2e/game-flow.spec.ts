/**
 * E2E-tester för Tetris-spelet
 * 
 * Denna fil testar hela spelupplevelsen från start till slut
 * med hjälp av Playwright för att säkerställa att allt fungerar
 * som förväntat i en riktig webbläsarmiljö.
 * 
 * @author Tetris Development Team
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';

// ============================================================================
// HUVUDTESTSUIT
// ============================================================================

test.describe('Tetris Spel E2E-tester', () => {
  /**
   * Setup som körs före varje test
   * Navigerar till startsidan och väntar på att sidan ska laddas
   */
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // ============================================================================
  // KOMPLETT SPELFLÖDE TESTER
  // ============================================================================

  test('Komplett spelflöde - start till spel över', async ({ page }) => {
    // Vänta på att spelet ska laddas
    await expect(page.getByText(/tetris/i)).toBeVisible();
    
    // Starta spelet
    await page.getByRole('button', { name: /start/i }).click();
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
    
    // Verifiera att spelet körs
    await expect(page.locator('canvas')).toBeVisible();
    
    // Spela i några sekunder för att testa spellogiken
    await page.keyboard.press('ArrowLeft');   // Flytta vänster
    await page.keyboard.press('ArrowRight');  // Flytta höger
    await page.keyboard.press('ArrowUp');     // Rotera
    await page.keyboard.press('ArrowDown');   // Mjuk drop
    await page.keyboard.press(' ');           // Hård drop
    
    // Vänta lite för att spelet ska utvecklas
    await page.waitForTimeout(2000);
    
    // Pausa spelet
    await page.getByRole('button', { name: /pause/i }).click();
    await expect(page.getByRole('button', { name: /resume/i })).toBeVisible();
    
    // Återuppta spelet
    await page.getByRole('button', { name: /resume/i }).click();
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
    
    // Återställ spelet
    await page.getByRole('button', { name: /reset/i }).click();
    await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
  });

  // ============================================================================
  // TANGENTBORDKONTROLLER TESTER
  // ============================================================================

  test('Tangentbordskontroller fungerar korrekt', async ({ page }) => {
    // Starta spelet
    await page.getByRole('button', { name: /start/i }).click();
    
    // Testa alla tangentbordskontroller
    const controls = [
      { key: 'ArrowLeft', description: 'Flytta vänster' },
      { key: 'ArrowRight', description: 'Flytta höger' },
      { key: 'ArrowDown', description: 'Mjuk drop' },
      { key: 'ArrowUp', description: 'Rotera' },
      { key: ' ', description: 'Hård drop' },
      { key: 'c', description: 'Håll pjäs' },
      { key: 'p', description: 'Pausa' },
    ];
    
    for (const control of controls) {
      await page.keyboard.press(control.key);
      // Liten fördröjning för att säkerställa att tangenttryckningen registreras
      await page.waitForTimeout(100);
    }
    
    // Verifiera att spelet fortfarande körs
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
  });

  // ============================================================================
  // POÄNG OCH NIVÅPROGRESSION TESTER
  // ============================================================================

  test('Poäng och nivåprogression', async ({ page }) => {
    // Starta spelet
    await page.getByRole('button', { name: /start/i }).click();
    
    // Hämta initiala värden
    const initialScore = await page.locator('[data-testid="score"]').textContent();
    const initialLevel = await page.locator('[data-testid="level"]').textContent();
    const initialLines = await page.locator('[data-testid="lines"]').textContent();
    
    // Spela i några sekunder för att potentiellt få poäng
    await page.keyboard.press('ArrowDown'); // Mjuk drop
    await page.keyboard.press(' ');         // Hård drop
    await page.waitForTimeout(1000);
    
    // Hämta nya värden
    const newScore = await page.locator('[data-testid="score"]').textContent();
    const newLevel = await page.locator('[data-testid="level"]').textContent();
    const newLines = await page.locator('[data-testid="lines"]').textContent();
    
    // Verifiera att värdena har ändrats (spelet utvecklas)
    expect(newScore).not.toBe(initialScore);
    expect(newLevel).not.toBe(initialLevel);
    expect(newLines).not.toBe(initialLines);
  });

  // ============================================================================
  // SPELSTATUSHANTERING TESTER
  // ============================================================================

  test('Spelstatushantering', async ({ page }) => {
    // Testa spelstart
    await page.getByRole('button', { name: /start/i }).click();
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
    
    // Testa paus
    await page.getByRole('button', { name: /pause/i }).click();
    await expect(page.getByRole('button', { name: /resume/i })).toBeVisible();
    
    // Testa återupptagande
    await page.getByRole('button', { name: /resume/i }).click();
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
    
    // Testa återställning
    await page.getByRole('button', { name: /reset/i }).click();
    await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
    
    // Verifiera att spelet är i ursprungligt tillstånd
    await expect(page.locator('[data-testid="score"]')).toContainText('0');
    await expect(page.locator('[data-testid="level"]')).toContainText('1');
    await expect(page.locator('[data-testid="lines"]')).toContainText('0');
  });

  // ============================================================================
  // PJÄSRÖRELSE OCH ROTATION TESTER
  // ============================================================================

  test('Pjäsrörelse och rotation', async ({ page }) => {
    // Starta spelet
    await page.getByRole('button', { name: /start/i }).click();
    
    // Testa pjäsrörelse
    await page.keyboard.press('ArrowLeft');  // Flytta vänster
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowRight'); // Flytta höger
    await page.waitForTimeout(100);
    
    // Testa pjäsrotation
    await page.keyboard.press('ArrowUp');    // Rotera
    await page.waitForTimeout(100);
    
    // Testa mjuk drop
    await page.keyboard.press('ArrowDown');  // Mjuk drop
    await page.waitForTimeout(100);
    
    // Testa hård drop
    await page.keyboard.press(' ');          // Hård drop
    await page.waitForTimeout(100);
    
    // Verifiera att spelet fortfarande körs
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
  });

  // ============================================================================
  // HÅLL-FUNKTIONALITET TESTER
  // ============================================================================

  test('Håll-funktionalitet', async ({ page }) => {
    // Starta spelet
    await page.getByRole('button', { name: /start/i }).click();
    
    // Testa håll pjäs
    await page.keyboard.press('c');
    await page.waitForTimeout(100);
    
    // Verifiera att hållområdet är synligt (om implementerat)
    await expect(page.locator('[data-testid="hold-piece"]')).toBeVisible();
  });

  // ============================================================================
  // NÄSTA PJÄS FÖRHANDSVISNING TESTER
  // ============================================================================

  test('Nästa pjäs förhandsvisning', async ({ page }) => {
    // Starta spelet
    await page.getByRole('button', { name: /start/i }).click();
    
    // Verifiera att nästa pjäs-område är synligt
    await expect(page.locator('[data-testid="next-piece"]')).toBeVisible();
  });

  // ============================================================================
  // SPEL ÖVER DETEKTERING TESTER
  // ============================================================================

  test('Spel över detektering', async ({ page }) => {
    // Starta spelet
    await page.getByRole('button', { name: /start/i }).click();
    
    // Spela ett tag för att potentiellt trigga spel över
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowDown'); // Mjuk drop
      await page.keyboard.press(' ');         // Hård drop
      await page.waitForTimeout(500);
    }
    
    // Kontrollera om spel över-tillståndet nås
    const gameOverElement = page.locator('[data-testid="game-over"]');
    if (await gameOverElement.isVisible()) {
      await expect(gameOverElement).toBeVisible();
      // Verifiera att omstartsalternativet finns tillgängligt
      await expect(page.getByRole('button', { name: /restart/i })).toBeVisible();
    }
  });

  // ============================================================================
  // RESPONSIV DESIGN TESTER
  // ============================================================================

  test('Responsiv design på olika skärmstorlekar', async ({ page }) => {
    // Testa mobil viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText(/tetris/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
    
    // Testa tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText(/tetris/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
    
    // Testa desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByText(/tetris/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
  });

  // ============================================================================
  // TILLGÄNGLIGHETSFUNKTIONER TESTER
  // ============================================================================

  test('Tillgänglighetsfunktioner', async ({ page }) => {
    // Testa tangentbordsnavigation
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /start/i })).toBeFocused();
    
    // Testa ARIA-etiketter
    const startButton = page.getByRole('button', { name: /start/i });
    await expect(startButton).toHaveAttribute('aria-label');
    
    // Testa skärmläsarstöd
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  // ============================================================================
  // PRESTANDA UNDER SPELANDE TESTER
  // ============================================================================

  test('Prestanda under spelande', async ({ page }) => {
    // Starta spelet
    await page.getByRole('button', { name: /start/i }).click();
    
    // Mät prestanda under spelande
    const startTime = Date.now();
    
    // Utför flera åtgärder snabbt
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('ArrowLeft');  // Flytta vänster
      await page.keyboard.press('ArrowRight'); // Flytta höger
      await page.keyboard.press('ArrowUp');    // Rotera
      await page.keyboard.press('ArrowDown');  // Mjuk drop
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Ska slutföra 200 tangenttryckningar på rimlig tid
    expect(totalTime).toBeLessThan(5000);
    
    // Verifiera att spelet fortfarande är responsivt
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
  });
});
