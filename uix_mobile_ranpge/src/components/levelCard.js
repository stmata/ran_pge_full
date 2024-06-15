import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet , Image} from 'react-native';
import theme  from "../theme";
import { useTheme } from '../context/ThemeContext';

export default function LevelCard({ level, onSelect }) {
    const { isDarkTheme } = useTheme(); // Utilisez le contexte du thème
    const mode = isDarkTheme ? 'dark' : 'light';
  return (
    <TouchableOpacity
        style={{ width: 270, borderRadius: 40, backgroundColor: theme.colors[mode].primary }}
        className="mx-5 pb-2"
        onPress={onSelect}>
        <View
        className='flex-row justify-center'
        style={{
            shadowColor: theme.colors[mode].white,
            shadowRadius: 40,
            shadowOffset: { width: 0, height: 50 },
            shadowOpacity: 0.6
        }}
        >
        <Image source={level.image} style={{ width: 270, height: 210, borderTopRightRadius: 40, borderTopLeftRadius:40 }} />
        </View>
        <View className='ml-4 my-4'>
        <Text
            style={{
            fontWeight: 'bold',
            fontSize: 24, // 'text-xl' usually corresponds to 24pt font size
            color: theme.colors[mode].dark,
            textShadowColor: theme.colors[mode].shadowColor,
            //textShadowOffset: { width: -1, height: 1 },
            //textShadowRadius: 10
            }}
        >
            {level.name}
        </Text>
        </View>
    </TouchableOpacity>
    
  );
}

