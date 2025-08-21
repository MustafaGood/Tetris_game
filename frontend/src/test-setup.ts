import '@testing-library/jest-dom';
import { vi } from 'vitest';
declare const global: any;

// Test-setup: Shimma jest-funktioner när vi kör Vitest så gamla Jest-baserade
// tester som använder `jest.fn()` fortfarande fungerar.
if (typeof global !== 'undefined' && typeof (global as any).jest === 'undefined') {
  (global as any).jest = {
    fn: vi.fn,
    spyOn: vi.spyOn,
    clearAllMocks: vi.clearAllMocks,
    resetAllMocks: vi.resetAllMocks,
    restoreAllMocks: vi.restoreAllMocks,
  };
}
