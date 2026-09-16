import { createContext, useContext, useState, useEffect } from 'react';

// ============================================================================
// THEME CONTEXT — Dark/Light mode management
// Persists theme preference to localStorage
// ============================================================================

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('besmindo-theme');
    console.log('🎨 Loading theme from localStorage:', savedTheme);
    
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
    } else {
      console.log('🎨 No valid theme found, defaulting to light');
      localStorage.setItem('besmindo-theme', 'light');
    }
    
    setMounted(true);
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    console.log('🎨 Applying theme:', theme);
    
    // Remove both classes first
    root.classList.remove('dark', 'light');
    
    // Add the current theme class
    if (theme === 'dark') {
      root.classList.add('dark');
      console.log('✅ Dark mode activated');
    } else {
      // Light mode - no class needed (default)
      console.log('✅ Light mode activated');
    }
    
    // Save to localStorage
    localStorage.setItem('besmindo-theme', theme);
    console.log('💾 Saved to localStorage:', theme);
    
    // Verify
    console.log('🔍 Current HTML classes:', root.className);
    console.log('🔍 Has dark class:', root.classList.contains('dark'));
    
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('🔄 Toggle: %s → %s', theme, newTheme);
    setTheme(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  // Don't render children until theme is loaded
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
