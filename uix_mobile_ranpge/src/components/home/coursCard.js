import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import React from 'react';
import theme from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as SecureStore from 'expo-secure-store';

export default function CoursCard({
    id,
    title,
    imgUrl,
    rating,
    topics,
    description,
    module,
    level,
    hasEvaluation,
    status
}) {
    const navigation = useNavigation();
    const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
    const mode = isDarkTheme ? 'dark' : 'light';

    console.log(status)
   
    const getImageSource = (name) => {
        switch (name) {
            case 'Accounting & Finance':
                return require('../../../assets/images/Accounting & Finance.png');
            case 'Geopolitics':
                return require('../../../assets/images/Geopolitics.png');
            case 'Economics':
                return require('../../../assets/images/Economics.png');
            case 'Marketing':
                return require('../../../assets/images/Marketing.png');
            case 'Economics':
                return require('../../../assets/images/Economics.png');
            case 'Stats maths':
                return require('../../../assets/images/Stats & Maths.png');
            case 'Accounting':
                return require('../../../assets/images/Accounting.png');
            default:
                return require('../../../assets/images/skema_test.jpg');
        }
    };

    // Utilisez la fonction getImageSource pour définir la source de l'image
    const imageSource = getImageSource(title);
    const onCardPress = async () => {
        if (!topics || topics.length === 0) {
            Alert.alert(
                "No Information Available",
                "This course does not have any information available at the moment.",
                [{ text: "OK" }]
            );
        } else {
            const userId = await SecureStore.getItemAsync('userId');
            if (!userId) {
                console.log('UserID non trouvé.');
                return;
            }
            
            // Définition de la fonction asynchrone pour l'appel API
            const sendClickData = async () => {
                try {
                    const apiUrl = `http://20.19.90.68:80/click_checkandsave`;
                    const requestBody = {
                        user_id: userId,
                        target_type: "course", // Ou "document"
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
            
            // Appeler la fonction asynchrone sans attendre la réponse
            sendClickData();
    
            // Continuer l'exécution sans attendre la réponse de l'API
            if (hasEvaluation) {
                navigation.navigate('chapter', {
                    id: id, 
                    title: title, 
                    imgUrl: imageSource, 
                    rating: rating,
                    topics: topics,
                    description: description,
                    level: level,
                    module: module
                });
            } else {
                navigation.navigate('Evaluate', { level: level, courseName: module });
            }
        }
    };
    
    

    

      const opacityStyle = { opacity: !status ? 0.5 : 1 };

    return (
        <TouchableOpacity
            onPress={onCardPress}
            disabled={!status} // Désactive le toucher si `status` est true
            style={[
                {
                    shadowColor: theme.colors[mode].bgColor(0.2),
                    shadowRadius: 7,
                    marginBottom: 10,
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10,
                },
                opacityStyle, // Appliquez le style d'opacité
            ]}
        >
            <View className=" w-10/12 rounded-3xl shadow-lg"  style={{ backgroundColor:theme.colors[mode].boxCard }}>
                <Image className="h-36 w-full rounded-t-3xl" source={imageSource} />
                <View className="px-3 pb-4 space-y-2">
                    <Text className="text-lg font-bold pt-2" style={{color: theme.colors[mode].boxCardText}}>{title}</Text>
                    <View className="flex-row items-center space-x-1">
                        <Icon name="eye" size={16} color={theme.colors[mode].boxCardText} />
                        <Text className="text-xs">
                            <Text style={{ color:theme.colors[mode].success }}>{rating}</Text>
                            <Text style={{ color:theme.colors[mode].boxCardText }}> people have viewed this content.</Text>
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}




