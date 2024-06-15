import { View, Text, TouchableOpacity, Image,StyleSheet } from 'react-native'
import React, {useState} from 'react'
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import theme from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function GeneralRow({ level, module }) {
    const navigation = useNavigation();
    const { isDarkTheme } = useTheme(); // Utilisez le contexte du thème
    const mode = isDarkTheme ? 'dark' : 'light';
    const styles = getStyles(mode); // Utilisez une fonction pour obtenir les styles en fonction du mode

    const sendDataToBackendChat = async () => {
        const userId = await SecureStore.getItemAsync('userId');
        if (!userId) {
          console.log('UserID non trouvé.'); // Corrected log message to reflect the missing userId
          setIsLoading(false);
          return;
        }
        try {
            const response = await fetch('http://20.19.90.68:80/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level: level,
                    module: module,
                    userId: userId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Données reçues du serveur:', data);
                navigation.navigate('Main', { screen: 'Chats', params: { selectedValue: module, newChatConv: true } })
            }else {
                const errorData = await response.json();
                console.error('Réponse du serveur non OK:', errorData.message);
                // Afficher une alerte ou une notification avec le message d'erreur
                alert(`Erreur: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi des données:', error);
            // Afficher une alerte ou une notification avec le message d'erreur
            alert(`Erreur lors de l'envoi des données: ${error}`);
        }
    };

    const sendDataToBackendEvaluation = async () => {
        const userId = await SecureStore.getItemAsync('userId');
        if (!userId) {
          console.log('UserID non trouvé.'); // Corrected log message to reflect the missing userId
          setIsLoading(false);
          return;
        }
        // try {
        //     const response = await fetch('http://20.19.90.68:80/evalution', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             level: level,
        //             module: module,
        //             documentName:documentName,
        //             chapterName:selectedValue,
        //             userId:userId,
        //         }),
        //     });
        //     const data = await response.json();
        //     if (data) {
               
        //         console.log('Données reçues du serveur:', data);
        navigation.navigate('Evaluate',{ level:level , courseName: module})
        //     } else {
        //         const errorData = await response.json();
        //         console.error('Réponse du serveur non OK:', errorData.message);
        //         // Afficher une alerte ou une notification avec le message d'erreur
        //         alert(`Erreur: ${errorData.message}`);
        //     }
        // } catch (error) {
        //     console.error('Erreur lors de l\'envoi des données:', error);
        //     // Afficher une alerte ou une notification avec le message d'erreur
        //     alert(`Erreur lors de l'envoi des données: ${error}`);
        // }
    };


    const handlePressChat = () => {
       
        sendDataToBackendChat()
    }

    const handlePressEvaluation = () => {
     
        sendDataToBackendEvaluation()
        
    }   

    return (
        <View style={styles.container}>
            <Text style={styles.title}>General</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => handlePressChat()} style={[styles.button, styles.chatButton]}>
                    <Text style={styles.buttonText}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handlePressEvaluation()} style={[styles.button, styles.evaluateButton]}>
                    <Text style={styles.buttonText}>Evaluate</Text>
                </TouchableOpacity>
            </View> 
        </View>
    );
}

// Définition des styles en fonction du thème
const getStyles = (mode) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors[mode].boxCard,
        borderRadius: 20,
        padding: 15,
        margin: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 22,
        color: theme.colors[mode].boxCardText,
        textAlign: 'center',
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
    },
    chatButton: {
        backgroundColor: theme.colors[mode].primary,
    },
    evaluateButton: {
        backgroundColor: theme.colors[mode].success,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
