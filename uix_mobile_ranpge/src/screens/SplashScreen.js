import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import theme from '../theme';
import { useTheme } from '../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const logoWidth = screenWidth * 0.6;
const logoHeight = (logoWidth * 872) / 2935;
import { useAuth } from '../context/AuthContext';
export default function SplashScreen() {
  const navigation = useNavigation();
  const { isDarkTheme } = useTheme();
  const mode = isDarkTheme ? 'dark' : 'light';
  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity is 1
  const { isLoggedIn } = useAuth();
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isLoggedIn = await SecureStore.getItemAsync('userIsLoggedIn');
        if (isLoggedIn === 'true') {
          const levelChoice = await SecureStore.getItemAsync('levelChoice');
          console.log(levelChoice);
          if (levelChoice) {
            navigation.navigate('tabNavigator', { screen: 'Home' });
          } else {
            navigation.replace('Onboarding');
          }
        } else {
          // Si aucun utilisateur n'est connecté, attendez un peu plus longtemps avant de naviguer vers Onboarding
          const timer = setTimeout(() => {
            fadeOutLogo();
          }, 3000); // Attend 3 secondes avant de commencer l'animation de disparition

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        fadeOutLogo(); // Assurez la navigation vers Onboarding en cas d'erreur
      }
    };
    if(!isLoggedIn){checkLoginStatus();}
  }, [navigation, isLoggedIn]);

  const fadeOutLogo = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => navigation.replace('Onboarding')); // Naviguez vers Onboarding après l'effet de fondu
  };

  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors[mode].white
    }}>
      <Animated.Image
        source={isDarkTheme ? require('../../assets/images/Logo-SKEMA-Blanc.png') : require('../../assets/images/Logo-SKEMA-Noir.png')}
        style={{ height: logoHeight, width: logoWidth, opacity: fadeAnim }}
      />
    </View>
  );
}
