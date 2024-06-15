import React, { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import theme from '../theme'
import { useTheme } from '../context/ThemeContext';
const { height, width } = Dimensions.get('window');

const VerificationCodeScreen = () => {
  const [code, setCode] = useState(new Array(6).fill(''));
  const [isCodeValid, setIsCodeValid] = useState(true);
  const [timer, setTimer] = useState(60); // Compteur de 60 secondes
  const [isResendButtonActive, setIsResendButtonActive] = useState(false);
  const navigation = useNavigation();
  const inputRefs = useRef([]);
  const route = useRoute();
  const { email } = route.params;
  const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
  const mode = isDarkTheme ? 'dark' : 'light';
  const styles = getStyles(mode);

  inputRefs.current = code.map(
    (_, i) => inputRefs.current[i] ?? React.createRef()
  );
  
  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(interval);
          setIsResendButtonActive(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const onKeyPress = ({ nativeEvent: { key }, index }) => {
    if ((key === 'Backspace' || key === 'Delete') && code[index] === '') {
      // S'il s'agit d'une suppression et que le champ actuel est vide, déplacez le focus sur le champ précédent et effacez son contenu.
      const newCode = [...code];
      if (index > 0) {
        newCode[index - 1] = ''; // Effacez le caractère du champ précédent
        setCode(newCode);
        inputRefs.current[index - 1].current.focus();
      }
    }
  };

  const onCodeEntered = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Passez au champ suivant si le texte a été entré
    if (text && index < code.length - 1) {
      inputRefs.current[index + 1].current.focus();
    } else if (!text && index > 0) {
      // Si l'utilisateur commence à effacer, revenez au champ précédent
      inputRefs.current[index - 1].current.focus();
    }
  };

  const onSubmit = async () => {
    const codeString = code.join('');
    try {
      const response = await fetch(`http://20.19.90.68:80/verify_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: codeString,
          mobile:true
        })
      });

        const json = await response.json();
        console.log(json)
        if (json.success) {
          // Sauvegarder l'état de connexion de manière sécurisée
          await SecureStore.setItemAsync('userIsLoggedIn', 'true');
          await SecureStore.setItemAsync('userEmail', email);

          if (json._id) {
            await SecureStore.setItemAsync('userId', json._id);
          }

          if(json.existingLevel == true){
            await SecureStore.setItemAsync('levelChoice', json.level);
            navigation.navigate('tabNavigator',{ screen: 'Home'});
          }
          else{
            // Navigation vers l'écran suivant
            navigation.navigate('choiceLevel');
          }
         
        } else {
          // Le code est incorrect, montrer une erreur
          setIsCodeValid(false);
        }
    } catch (error) {
      console.error('Erreur lors de la récupération ou de la comparaison du code:', error);
      setIsCodeValid(false);
      // En cas d'erreur, vous pouvez décider si vous souhaitez naviguer ou non vers l'écran suivant ou simplement afficher l'erreur.
    }
  };
  
  

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const resendVerificationCode = async (email) => {
    try {
    
      const response = await fetch('http://20.19.90.68:80/send_verifyMail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email:email}),
      });
  
      const json = await response.json();
  
      if (response.ok) {
        console.log('Code sent successfully:', json);
        setTimer(60);
        setIsResendButtonActive(false);
      
        let interval = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer === 1) {
              clearInterval(interval);
              setIsResendButtonActive(true);
              return 0;
            }
            return prevTimer - 1;
          });
        }, 1000);
      } else {
        console.error('Failed to send code:', json.message);
      }
    } catch (error) {
      console.error('Error sending verification code or checking email:', error);
    }
  };

 

  const handleResendCodePress = () => {
    resendVerificationCode(email)
  };

  return (
    <KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "android" ? 100 : 0}
			style={{ flex: 1 }}
		>
       <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>

          <TouchableOpacity style={styles.backButtonContainer} onPress={() => navigation.navigate('Login')}>
            <Ionicons name="arrow-back-outline" size={24} color={theme.colors[mode].black} /> 
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.header}>Verification Code</Text>
            <Text style={styles.subHeader}>
              Enter your verification code that we sent you through your e-mail.
            </Text>
          </View>

          <View style={styles.codeInputContainer}>
            {code.map((digit, index) => (
              <TextInput
                ref={inputRefs.current[index]}
                key={index}
                style={[styles.codeInput, !isCodeValid && styles.codeInputError]}
                maxLength={1}
                keyboardType="number-pad"
                returnKeyType={index === code.length - 1 ? 'done' : 'next'}
                onChangeText={(text) => onCodeEntered(text, index)}
                onKeyPress={(e) => onKeyPress(e, index)}
              />
            ))}
          </View>

          {!isCodeValid && <Text style={styles.errorText}>Verification code invalid</Text>}

          {!isResendButtonActive ? (
            <View style={styles.timerContainer}>
              <Ionicons name="timer-outline" size={24} color={theme.colors[mode].darkGray} />
              <Text style={styles.timer}>{formatTime()}</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={handleResendCodePress}>
              <Text style={styles.resendButtonText}>Resend Code</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
          
        </SafeAreaView>
        </KeyboardAvoidingView>
  );
};

const getStyles = (mode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors[mode].white,
  },
  timerContainer: {
    flexDirection: 'row',  // Afficher les éléments en ligne
    alignItems: 'center',   // Centrer verticalement les éléments
    justifyContent: 'center', // Centrer horizontalement les éléments
    marginTop: 10,          // Marge en haut
  },  
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'space-between', // S'assure que le contenu est réparti sur tout l'espace disponible
  },
  backButtonContainer: {
    marginTop: 10,
    marginLeft: 10,
    alignSelf: 'flex-start',
  },
  headerContainer: {
    marginTop: 50, // Ajustez en fonction de la mise en page souhaitée
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors[mode].black,
  },
  subHeader: {
    fontSize: 18,
    color: theme.colors[mode].darkGray,
    textAlign: 'center',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    marginHorizontal: width * 0.1, 
  },
  codeInput: {
    width: width * 0.12, 
    height: width * 0.12, 
    marginHorizontal: 8, 
    borderWidth: 1,
    borderColor: theme.colors[mode].darkGray,
    textAlign: 'center',
    fontSize: 24,
    borderRadius: 10,
    color: theme.colors[mode].black,

  },
  codeInputError: {
    borderColor: theme.colors[mode].danger,
  },
  errorText: {
    textAlign: 'center',
    color: theme.colors[mode].danger,
    fontSize: 16,
  },
  timer: {
    fontSize: 18,
    color: theme.colors[mode].darkGray,
    textAlign: 'center',
    marginVertical: 20,
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  resendButtonText: {
    fontSize: 16,
    color: theme.colors[mode].primary, // iOS blue color
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: theme.colors[mode].primary,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 75, 
    padding: 10, 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    alignSelf: 'center', 
  },
  
  submitButtonText: {
    fontSize: 18,
    color: theme.colors[mode].white,
    fontWeight: 'bold',
  },
});

export default VerificationCodeScreen;