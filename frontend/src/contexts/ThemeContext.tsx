import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ThemeContext
// Svenska kommentarer: En enkel context för att hantera appens tema (ljust/mörkt).
// Inkluderar hjälp-funktioner för att växla tema och spara valet i localStorage.

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Säkerställ att hooken alltid används inom en ThemeProvider
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Läs initialt tema från localStorage, fall tillbaka till 'dark' om inget sparat värde finns
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('tetris-theme') as Theme | null;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        return savedTheme;
      }
    } catch (e) {
      // localStorage kan misslyckas i vissa miljöer; då använder vi default
      // (vi fångar felet tyst)
    }
    return 'dark';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('tetris-theme', newTheme);
    } catch (e) {
      // Ignorera skrivfel mot localStorage
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Applicera tema på <html> genom att sätta klass på rot-elementet.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
