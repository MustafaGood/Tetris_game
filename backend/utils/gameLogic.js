// Hjälpfunktioner för spel-logik (enklare generator/validering av seed och poäng)

// Generera en enkel spel-seed som en kombination av slump och tidsstämpel
export function generateGameSeed() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Enkel validering av seed: minst 8 tecken och av typ string
export function validateGameSeed(seed) {
  return typeof seed === 'string' && seed.length >= 8;
}

// Grundläggande validering av inskickad poängdata
// Återvänder ett objekt { isValid: boolean, reason?: string }
export function validateScore({ name, points, level, lines }) {
  // Namnet måste vara en icke-tom sträng
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { isValid: false, reason: 'Invalid name' };
  }

  // Poäng måste vara ett icke-negativt tal
  if (!Number.isFinite(points) || points < 0) {
    return { isValid: false, reason: 'Invalid points' };
  }

  // Nivå måste vara mellan 1 och 20 (inklusive)
  if (!Number.isFinite(level) || level < 1 || level > 20) {
    return { isValid: false, reason: 'Invalid level' };
  }

  // Rader måste vara ett icke-negativt tal
  if (!Number.isFinite(lines) || lines < 0) {
    return { isValid: false, reason: 'Invalid lines' };
  }

  return { isValid: true };
}


