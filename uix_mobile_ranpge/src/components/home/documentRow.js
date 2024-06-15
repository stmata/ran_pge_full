import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, {useState} from 'react'
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function DocumentRow({name, stars, id, image,chapter,description,level, module, documentName}) {
    const navigation = useNavigation();
    const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
    const mode = isDarkTheme ? 'dark' : 'light';
    // Fonction de navigation quand la carte est pressée
    const onCardPress = () => {
        navigation.navigate('chapter',
        {   
            id:id, 
            title: name, 
            imgUrl: image, 
            rating: stars,
            chapter:chapter,
            description:description,
            level: level,
            module: module,
            documentName:documentName
        });
    };

    const imageMap = {
        '../../assets/images/skema_test.jpg': require('../../../assets/images/skema_test.jpg')
      };
      
    // Dans CoursCard
    const imageSource = imageMap[image] || require('../../../assets/images/skema_test.jpg');
    if (!imageSource || !name) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <Text style={{ color: theme.colors[mode].boxCardText, fontSize: 16 }}>
                    This course does not have any documents at the moment.
                </Text>
            </View>
        );
    }
  return (
     <TouchableOpacity key={id }onPress={onCardPress}>
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
            </View>
        </View>
    </TouchableOpacity>

    
    
  )
}