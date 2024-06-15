import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, {useState} from 'react'
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import theme from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';


export default function ChapterRow({name, stars, id, image,level,module,topicsName,start_date}) {
    const navigation = useNavigation();
    const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
    const mode = isDarkTheme ? 'dark' : 'light';
    //console.log(level,module,documentName,chapterName)
    // Définition de la fonction asynchrone pour l'appel API
    const sendClickData = async () => {
        const userId = await SecureStore.getItemAsync('userId');
        if (!userId) {
            console.log('UserID non trouvé.');
            return;
        }
        try {
            const apiUrl = `http://20.19.90.68:80/click_checkandsave`;
            const requestBody = {
                user_id: userId,
                target_type: "topic", // Ou "document"
                target_id: id,
            };

            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => console.log(data.message))
            .catch(error => console.error("Fetching error: ", error));
        } catch (error) {
            console.error("Error sending click data: ", error);
        }
    };
    const sendDataToBackendChat = async (selectedValue) => {
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
                    topicsName:topicsName,
                    userId: userId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Données reçues du serveur:', data);
                navigation.navigate('Main', { screen: 'Chats', params: { selectedValue: selectedValue, newChatConv: true } })
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

    const sendDataToBackendEvaluation = async (selectedValue) => {
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
        navigation.navigate('Evaluate',{ level:level , courseName: module, chapterName: name , topicsName:topicsName})
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

    const containsSession = name.toLowerCase().includes('session');
    const getImageSource = () => {
        if (containsSession){
            return require('../../../assets/images/Session.png');
        }
        else{
            return require('../../../assets/images/Module.png');
        }
            
    };

    // Utilisez la fonction getImageSource pour définir la source de l'image
    const imageSource = getImageSource();
    

    const handlePressChat = (chapterName) => {
        console.log("Le chapitre sélectionné est :", chapterName);
        sendDataToBackendChat(chapterName)
        sendClickData()
    }

    const handlePressEvaluation = (chapterName) => {
        console.log("Le chapitre sélectionné est :", chapterName);
        sendDataToBackendEvaluation(chapterName)
        sendClickData()
        
    }

    const startDate = new Date(start_date);
    const currentDate = new Date();

    // Vérifier si start_date est dans le futur
    if(startDate > currentDate) {
        const formattedStartDate = startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        return (
            <>
                    <View key={id} className="flex-row items-center  p-3 rounded-3xl shadow-2xl mb-3 mx-2"  style={{ backgroundColor:theme.colors[mode].boxCard }}>
                        <Image className="rounded-3xl" style={{height: 100, width: 100}} source={imageSource}/>
                        <View className="flex flex-1 space-y-3">
                            <View className="pl-3">
                                <Text className="text-xl" style={{color: theme.colors[mode].boxCardText}}>{name}</Text>
                                <View className="flex-row items-center space-x-1">
                                <Icon name="eye" size={16} color={theme.colors[mode].boxCardText} />
                                <Text className="text-xs">
                                    <Text style={{ color:theme.colors[mode].success }}>{stars}</Text>
                                    <Text style={{ color:theme.colors[mode].boxCardText }}> people have viewed this content.</Text>
                                </Text>
                            </View>
                            </View>
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text style={{ color: theme.colors[mode].dark }}>This chapter will be available from: {formattedStartDate}</Text>
                            </View>

                        </View>
                        
                    </View>
                    
            </>
            
            
          )
    }
  return (
    <>
            <View key={id} className="flex-row items-center  p-3 rounded-3xl shadow-2xl mb-3 mx-2"  style={{ backgroundColor:theme.colors[mode].boxCard }}>
                <Image className="rounded-3xl" style={{height: 100, width: 100}} source={imageSource}/>
                <View className="flex flex-1 space-y-3">
                    <View className="pl-3">
                        <Text className="text-xl" style={{color: theme.colors[mode].boxCardText}}>{name}</Text>
                        <View className="flex-row items-center space-x-1">
                        <Icon name="eye" size={16} color={theme.colors[mode].boxCardText} />
                        <Text className="text-xs">
                            <Text style={{ color:theme.colors[mode].success }}>{stars}</Text>
                            <Text style={{ color:theme.colors[mode].boxCardText }}> people have viewed this content.</Text>
                        </Text>
                    </View>
                    </View>
                    <View className="flex-row justify-evenly p-4 " style={{ backgroundColor:theme.colors[mode].boxCard }}>
                        <TouchableOpacity onPress={() => handlePressChat(topicsName)} className="px-6 py-2 rounded-full shadow"  style={{ backgroundColor:theme.colors[mode].primary }}>
                            <Text className="text-white font-bold">Chat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handlePressEvaluation(topicsName)} className="px-6 py-2 rounded-full shadow"  style={{ backgroundColor:theme.colors[mode].success }}>
                            <Text className="text-white font-bold">Evaluate</Text>
                        </TouchableOpacity>
                    </View> 
                </View>
                
            </View>
            
    </>
    
    
  )
}