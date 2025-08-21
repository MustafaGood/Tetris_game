/**
 * Playwright-konfiguration för Tetris Frontend
 * 
 * Denna fil konfigurerar end-to-end testning med Playwright
 * för att säkerställa att spelet fungerar korrekt i alla webbläsare
 * och på alla enheter.
 * 
 * @author Tetris Development Team
 * @version 1.0.0
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // ============================================================================
  // GRUNDLÄGGANDE TESTINSTÄLLNINGAR
  // ============================================================================
  
  testDir: './e2e',                    // Mapp för end-to-end tester
  fullyParallel: true,                 // Kör tester parallellt för snabbare exekvering
  forbidOnly: !!process.env.CI,        // Förbjud .only() i CI-miljö
  
  // ============================================================================
  // RETRY OCH WORKER KONFIGURATION
  // ============================================================================
  
  retries: process.env.CI ? 2 : 0,    // 2 omförsök i CI, 0 lokalt
  workers: process.env.CI ? 1 : undefined, // 1 worker i CI för stabilitet
  
  // ============================================================================
  // RAPPORTERING OCH UTSKRIFT
  // ============================================================================
  
  reporter: 'html',                    // HTML-rapport för testresultat
  
  // ============================================================================
  // GLOBALA TESTINSTÄLLNINGAR
  // ============================================================================
  
  use: {
    baseURL: 'http://localhost:4173',  // Grund-URL för alla tester
    trace: 'on-first-retry',           // Spåra exekvering vid omförsök
    video: 'retain-on-failure',        // Spara video endast vid fel
    screenshot: 'only-on-failure',     // Ta skärmdump endast vid fel
  },
  
  // ============================================================================
  // WEBBLÄSAR- OCH ENHETSPROJEKT
  // ============================================================================
  
  projects: [
    // Desktop-webbläsare
    {
      name: 'chromium',                // Google Chrome/Edge
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',                 // Mozilla Firefox
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',                  // Apple Safari
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobilenheter
    {
      name: 'Mobile Chrome',           // Android Chrome
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',           // iOS Safari
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // ============================================================================
  // WEBSERVER KONFIGURATION
  // ============================================================================
  
  webServer: {
    command: 'npm run preview',        // Kommando för att starta preview-server
    url: 'http://localhost:4173',      // URL för att kontrollera att servern är igång
    reuseExistingServer: !process.env.CI, // Återanvänd befintlig server lokalt
    timeout: 120 * 1000,              // 2 minuter timeout för serverstart
  },
});
