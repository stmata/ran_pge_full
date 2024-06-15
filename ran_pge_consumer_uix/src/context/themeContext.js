import React, { createContext, useState, useEffect, useContext } from 'react';
import { lightTheme, darkTheme } from '../styles/themeStyles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
/**
 * @typedef {Object} ThemeContextType
 * @property {Object} theme - The current theme object.
 * @property {Function} setTheme - Function to update the theme.
 */

/**
 * @type {React.Context<ThemeContextType>}
 */
const ThemeContext = createContext();

/**
 * ThemeProvider component that manages the theme state and persists it to localStorage.
 * It also wraps its children with the StyledThemeProvider, providing the theme to styled components.
 *
 * @param {object} props - The properties passed to the ThemeProvider component.
 * @param {React.ReactNode} props.children - The child components that the ThemeProvider will wrap.
 * @returns {JSX.Element} - The ThemeProvider component that provides the theme context to its children.
 */
export const ThemeProvider = ({ children }) => {
  // Initialize the theme state with the value from localStorage or default to light theme
  const [theme, setTheme] = useState(() => {
    const storedThemeName = localStorage.getItem('themeName') || 'light';
    return storedThemeName === 'light' ? lightTheme : darkTheme;
  });
  // Effect hook to persist the theme to localStorage on theme changes
  useEffect(() => {
    // Save the theme name in localStorage whenever the theme changes
    const themeName = theme.name === 'light' ? 'light' : 'dark';
    localStorage.setItem('themeName', themeName);
  }, [theme]);

  // Provide the theme and setTheme function through context and render children within StyledThemeProvider
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
        <StyledThemeProvider theme={theme}>
            {children}
        </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
/**
 * Custom hook for using theme context.
 * 
 * @returns {ThemeContextType} The theme context with the theme object and setTheme function.
 */
export const useTheme = () => useContext(ThemeContext);
