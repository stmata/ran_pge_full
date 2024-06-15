import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Keyboard
} from "react-native";
import { useTheme } from '../context/ThemeContext';
import theme from '../theme';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure this library is installed
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

const Contact = () => {
    const { isDarkTheme } = useTheme();
    const mode = isDarkTheme ? 'dark' : 'light';
    const styles = getStyles(mode);
    const navigation = useNavigation();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("");
    const [error, setError] = useState(false);
    const [emailerror, setemailerror] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Nouvel état pour le spinner

    const isValidEmail = email => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    const handleConfirm = async () => {
        
        // Vérifiez que tous les champs sont remplis
        if (!name || !email || !subject || !message || !isValidEmail(email)) {
            setError(true); // Active l'erreur de validation
            if (!isValidEmail(email) && email) {
                setemailerror(true)
            }
            return;
        }
        Keyboard.dismiss();
        setIsLoading(true);
    
        // Préparez le corps de la requête
        const dataToSend = {
            email: email,
            name: name,
            subject: subject,
            content: message,
        };
    
        try {
            // Envoyez la requête POST
            const response = await fetch('http://20.19.90.68:80/send_ContactMail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });
    
            const responseJson = await response.json();
    
            // Gérez la réponse
            if (response.status === 200) {
                Alert.alert("Succès", responseJson.message);
                setEmail("");
                setMessage("");
                setName("");
                setSubject("");
                setError(false);
                setemailerror(false);
            } else {
                Alert.alert("Erreur", responseJson.message);
                setError(false);
                setemailerror(false);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Erreur", "Une erreur est survenue lors de l'envoi de l'email.");
            setError(false);
            setemailerror(false);
        }
        setIsLoading(false);
    };
    

    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "android" ? 100 : 0}
            style={styles.flexContainer}
        >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => {
                console.log('Back button pressed');
                navigation.goBack();
              }}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={30} color={theme.colors[mode].primary} />
            </TouchableOpacity>
            <View style={{justifyContent: 'center',alignItems: 'center'}}>
              <Text style={styles.title}>Contact Us</Text>
            </View>
            <View style={{ width: 30 }}></View>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error && !name && styles.errorBorder]}
              placeholder="Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor={'gray'}
            />
            {error && !name && <Text style={styles.errorText}>This field is required.</Text>}
            
            <TextInput
              style={[styles.input, error && !email && styles.errorBorder]}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={'gray'}
            />
            {error &&!email && <Text style={styles.errorText}>This field is required.</Text>}
            {emailerror && <Text style={styles.errorText}>Please enter a valid email address.</Text>}
            <TextInput
              style={[styles.input, error && !subject && styles.errorBorder]}
              placeholder="Subject"
              value={subject}
              onChangeText={setSubject}
              placeholderTextColor={'gray'}
            />
            {error &&!subject && <Text style={styles.errorText}>This field is required.</Text>}
            <TextInput
              style={[styles.messageInput, error && !message && styles.errorBorder]}
              placeholder="Your message..."
              placeholderTextColor={'gray'}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            {error &&!message && <Text style={styles.errorText}>This field is required.</Text>}
          </View>
        </ScrollView>

        {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors[mode].primary} /> // Spinner
        ) : (
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmText}>Submit</Text>
            </TouchableOpacity>
        )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
};

const getStyles = (mode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors[mode].white,
  },
  flexContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  inputContainer: {
    flex: 1, // Make input container take up all available space
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  input: {
    backgroundColor: theme.colors[mode].white,
    color: theme.colors[mode].dark,
    borderRadius: 10,
    fontSize: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors[mode].border,
  },
  messageInput: {
    flex: 1, // Make message input expand to take up available space
    backgroundColor: theme.colors[mode].white,
    color: theme.colors[mode].dark,
    borderRadius: 10,
    fontSize: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors[mode].border,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: theme.colors[mode].dark,
    paddingVertical: 15,
    margin: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 18,
    color: theme.colors[mode].white,
  },
  headerContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors[mode].dark,
    textAlign: 'center', 
  },
  errorBorder: {
    borderColor: theme.colors[mode].danger, // Définissez la couleur de bordure sur rouge pour l'erreur
  },
  errorText: {
    color: theme.colors[mode].danger, // Définissez la couleur de bordure sur rouge pour l'erreur
    fontSize: 12,
    marginLeft: 5,
    marginBottom:5
  },
  // Other styles remain unchanged
});

export default Contact;

