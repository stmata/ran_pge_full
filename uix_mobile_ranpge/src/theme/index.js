import { Dimensions } from 'react-native';

// Get window dimensions
const { height, width } = Dimensions.get('window');

// Define size scaling
const SIZES = {
    base: 8,
    font: 14,
    radius: 30,
    padding: 10,
    padding2: 12,
    padding3: 16,
    largeTitle: 50,
    h1: 30,
    h2: 20,
    h3: 18,
    h4: 16,
    body1: 30,
    body2: 20,
    body3: 18,
    body4: 14,
    body5: 12,
    width,
    height,
};

// Define font styles
const FONTS = {
    largeTitle: { fontFamily: 'black', fontSize: SIZES.largeTitle, lineHeight: 55 },
    h1: { fontSize: SIZES.h1, lineHeight: 36 },
    h2: { fontSize: SIZES.h2, lineHeight: 30 },
    h3: { fontSize: SIZES.h3, lineHeight: 22 },
    h4: { fontSize: SIZES.h4, lineHeight: 20 },
    body1: { fontSize: SIZES.body1, lineHeight: 36 },
    body2: { fontSize: SIZES.body2, lineHeight: 30 },
    body3: { fontSize: SIZES.body3, lineHeight: 22 },
    body4: { fontSize: SIZES.body4, lineHeight: 20 },
};
// Theme.js

// Light Theme Colors
const lightColors = {
    evaluateSelection:'#01153e',
    onlyWhite:'#DCDCDC',
    primary: '#2563eb',
    secondary: '#544C4C',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#6e6e6e',
    secondaryGray: 'rgba(84, 76, 76, 0.14)',
    searchIcon: '#999',
    searchText: '#444',
    searchBackground: '#f0f0f0',
    title: '#000',
    subTitle: '#555',
    storyBorder: '#00f',
    description: '#9f9f9f',
    inputBackground: '#f0f0f0',
    inputText: '#000',
    messageBackground: '#1B5583',
    danger: '#df4759',
    success: '#4b0',
    light: '#ccc',
    halfOpacitySecondary: 'rgba(240, 149, 17, 0.5)',
    halfOpacityPrimary: 'rgba(0, 132, 255, 0.5)',
    transparentBackGray: 'rgba(0,0,0,0.2)',
    transparentBackGray2: 'rgba(0,0,0,0.4)',
    bgColor: opacity => `rgba(59, 130, 246, ${opacity})`,
    lightGray: '#D3D3D3',
    lightBackground: '#F5F5F5',
    darkGray: '#606060',
    dark: '#1d1d1d', // for title
    mediumGray: '#929292', // for subtitle
    lightGray: '#e3e3e3', // for borders
    profileText: '#090909', // profile name
    emailText: '#848484', // profile email
    actionBackground: '#007bff', // profile action background
    white: '#fff',
    black: '#000',
    gray: '#616161', // row value
    sectionHeader: '#a7a7a7', // section header text,
    lighterGray: '#ababab',
    newChatButton:'#f0f0f0',
    border:'#cccccc',
    boxCard:'#FFFFFF',
    boxCardText:'#606060',
    voiceButtonBackground:'#555',

};

// Dark Theme Colors
const darkColors = {
    evaluateSelection:'#1a6d91',
    voiceButtonBackground:'#666',
    onlyWhite:'#DCDCDC',
    primary: '#1D4ED8',
    secondary: '#9CA3AF',
    white: '#1E293B',
    black: '#F9FAFB',
    gray: '#fff',
    secondaryGray: 'rgba(156, 163, 175, 0.14)',
    searchIcon: '#E5E7EB',
    searchText: '#E5E7EB',
    searchBackground: 'rgba(255, 255, 255, 0.8)',
    title: '#F9FAFB',
    subTitle: '#E5E7EB',
    storyBorder: '#6366F1',
    description: '#E5E7EB',
    inputBackground: '#374151',
    inputText: '#F9FAFB',
    messageBackground: '#2563EB',
    danger: '#EF4444',
    success: '#10B981',
    light: '#E5E7EB',
    halfOpacitySecondary: 'rgba(240, 149, 17, 0.5)',
    halfOpacityPrimary: 'rgba(59, 130, 246, 0.5)',
    transparentBackGray: 'rgba(0,0,0,0.1)',
    transparentBackGray2: 'rgba(255, 255, 255, 0.8)',
    bgColor: opacity => `rgba(17, 24, 39, ${opacity})`,
    lightGray: '#fff',
    lightBackground: '#374151',
    darkGray: '#fff',
    dark: '#e3e3e3', // Utilisé pour le texte sur fond sombre, plus clair que le noir original
    mediumGray: '#7a7a7a', // Légèrement plus clair pour contraster avec le fond sombre
    lightGray: '#555', // Pour les bordures, plus sombre que le gris clair original pour se distinguer sur fond sombre
    profileText: '#FFFFFF', // Texte de profil blanc pour se démarquer sur le fond sombre
    emailText: '#CCCCCC', // Texte d'email plus clair pour une meilleure lisibilité
    actionBackground: '#0056b3', // Fond d'action plus sombre pour correspondre au thème sombre
    white: '#121212', // Fond principalement utilisé, très sombre pour simuler le noir
    black: '#FFFFFF', // Utilisé pour le texte pour contraster avec le fond sombre
    gray: '#9E9E9E', // Valeur de gris ajustée pour le texte et les éléments sur fond sombre
    sectionHeader: '#CCCCCC', // Texte d'en-tête de section plus clair pour une meilleure lisibilité
    lighterGray: '#636363', // Un gris plus sombre pour les éléments moins importants
    newChatButton:'#303030',
    border:'#444444',
    boxCard: 'rgba(0,0,0,15)',
    boxCardText:'rgba(255, 255, 255, 0.8)',

};


// Theme configuration
const theme = {
    colors: {
        'dark':darkColors,
        'light':lightColors,
    },
    sizes: SIZES,
    fonts: FONTS,
}

// Export the theme
export default theme;
