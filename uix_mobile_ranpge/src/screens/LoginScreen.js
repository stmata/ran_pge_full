import React,{useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons'; // Assurez-vous d'importer les icônes que vous souhaitez utiliser
import Animated, { FadeInUp } from 'react-native-reanimated';
import theme from '../theme'
import { useTheme } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;
const logoWidth = screenWidth * 0.6; // Exemple: 50% de la largeur de l'écran
const logoHeight = (logoWidth * 872) / 2935; // Conserver le ratio d'aspect original du logo
export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
  const mode = isDarkTheme ? 'dark' : 'light';
  const styles = getStyles(mode);
  const [isLoading, setIsLoading] = useState(false); // Nouvel état pour le spinner


  const validateEmail = (inputEmail) => {
    const emailRegex = /^[^\s@]+@skema\.edu$/i;

    const isValid = emailRegex.test(inputEmail.trim());
  
    setIsEmailValid(isValid);
  
    if (!isValid) {
      setIsEmailValid(false);
      // Ne pas naviguer si l'email est invalide
    } else {
      setIsEmailValid(true);
      sendVerificationCode(inputEmail.trim())
    }
  };

  const sendVerificationCode = async (email) => {
    setIsLoading(true); // Activez le spinner

    try {
      const response = await fetch('http://20.19.90.68:80/send_verifyMail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });
  
      const json = await response.json();
  
      if (response.ok) {
        console.log('Code sent successfully:', json);
        navigation.navigate('Confirm', { email: email });
      } else {
        // Vérifiez si le message d'erreur vient de `message` ou `error`
        const errorMessage = json.error || json.message || "Une erreur inconnue est survenue.";
        console.error('Failed to send code:', errorMessage);
      }
    } catch (error) {
      console.error('Error sending verification code or checking email:', error);
    }
    setIsLoading(false); // Désactivez le spinner

  };
  
  
  
  
  const onLoginPress = () => {
    validateEmail(email); // La navigation est gérée dans validateEmail
  };
  
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <StatusBar style="dark" />
          <View className="flex-grow items-center justify-end">
          <Animated.Image
            entering={FadeInUp.duration(1000).springify()}
            style={{ height: logoHeight, width: logoWidth }}
            source={isDarkTheme? require('../../assets/images/Logo-SKEMA-Blanc.png') : require('../../assets/images/Logo-SKEMA-Noir.png')}
            />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Please sign in to continue.</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter your skema email ..."
                style={[styles.input, !isEmailValid && styles.inputError]}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.colors[mode].gray}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setIsEmailValid(true)
                }}
              />
              {!isEmailValid && (
                <Text style={styles.errorText}>Invalid email format (ex: ...@skema.edu)</Text>
              )}
            </View>
            
            <View style={styles.loginButtonContainer}>
              {isLoading ? (
              <ActivityIndicator size="large" color={theme.colors[mode].primary} /> // Spinner
              ) : (
                <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
                <Text style={styles.loginButtonText}>LOGIN</Text>
                <MaterialIcons name="arrow-forward-ios" size={16} color='white' />
                </TouchableOpacity>
                )}
            </View>
        
          </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (mode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors[mode].white
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors[mode].black,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors[mode].gray,
    marginBottom: 32
  },
  inputContainer: {
    marginBottom: 16
  },
  input: {
    backgroundColor: theme.colors[mode].inputBackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
    color:theme.colors[mode].inputText,
  },
  inputError: {
    borderWidth: 1,
    borderColor: theme.colors[mode].danger, // Bordure en rouge pour indiquer l'erreur
  },
  errorText: {
    color: theme.colors[mode].danger, // Texte d'erreur en rouge
    fontSize: 14,
    padding: 5, // Marge pour séparer le message d'erreur de l'input
    textAlign: 'center'

  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors[mode].primary,
    borderRadius: 10,
    padding: 15,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  loginButtonText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 16
  },
  loginButtonContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  }
});
