import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native'; // Importez Appearance

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      // Tentez d'abord de charger le thème depuis le stockage local
      const storedTheme = await AsyncStorage.getItem('darkMode');
      if (storedTheme !== null) {
        setIsDarkTheme(storedTheme === 'true');
      } else {
        // Si aucun thème n'est stocké, utilisez la préférence du système
        const colorScheme = Appearance.getColorScheme();
        const isSystemDark = colorScheme === 'dark';
        setIsDarkTheme(isSystemDark);
        // Optionnel : Sauvegarder la préférence de thème du système dans le stockage local
        await AsyncStorage.setItem('darkMode', isSystemDark.toString());
      }
    };

    // Abonnez-vous aux changements de thème du système
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const isSystemDark = colorScheme === 'dark';
      setIsDarkTheme(isSystemDark);
      AsyncStorage.setItem('darkMode', isSystemDark.toString());
    });

    loadTheme();

    // Nettoyez l'abonnement lorsque le composant est démonté
    return () => subscription.remove();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    await AsyncStorage.setItem('darkMode', newTheme.toString());
  };

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
