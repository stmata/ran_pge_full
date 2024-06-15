import { View, Text, StatusBar, ScrollView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import ChapterRow from '../components/home/chapterRow';
import CourseRow from '../components/home/documentRow';
import * as Icon from "react-native-feather";
import theme from '../theme';
import { useTheme } from '../context/ThemeContext';
import GeneralRow from '../components/home/GeneralRow';

export default function ChapterScreen() {
    const navigation = useNavigation();
    const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
    const mode = isDarkTheme ? 'dark' : 'light';
    const {params: {
        id, 
        title, 
        description,
        topics,
        imgUrl,
        level,
        module,
        rating,
    }} = useRoute();

    
      const filteredTopics = topics?.filter(chapters => chapters.status) || [];

  return (
    <>
        <ScrollView  key={id} style={{ backgroundColor:theme.colors[mode].white }}>
            <View className="relative">
                <Image className="w-full h-72" source={imgUrl} />
                <TouchableOpacity 
                    onPress={()=>navigation.goBack()} 
                    className="absolute top-14 left-4 p-2 rounded-full shadow"  style={{ backgroundColor:theme.colors[mode].lightGray }}>
                    <Icon.ArrowLeft strokeWidth={3} stroke={theme.colors[mode].bgColor(1)} />
                </TouchableOpacity>
            </View>
            <View 
                style={{borderTopLeftRadius: 40, borderTopRightRadius: 40, backgroundColor:theme.colors[mode].white }} 
                className="-mt-12 pt-6">
                <View className="px-5">
                    <Text className="text-3xl font-bold" style={{color: theme.colors[mode].black}}>{title}</Text>
                    {/* copy this code from restaurant card */}
                    <View className="flex-row space-x-2 my-1">

                    </View>
                    <Text className=" mt-2" style={{ color:theme.colors[mode].darkGray }}>{description}</Text>                    
                </View>
                
            </View>
            {filteredTopics.length > 0 ? (
            // Afficher les chapitres filtrés s'il y en a
            <View className="pb-36" style={{ backgroundColor: theme.colors[mode].white }}>
                <Text className="px-4 py-4 text-2xl font-bold"></Text>
                {/* <GeneralRow level={level} module={module} /> */}
                {filteredTopics.map(chapters => (
                <ChapterRow
                    key={chapters._id}
                    id={chapters._id}
                    image={chapters.image}
                    name={chapters.name}
                    stars={chapters.stars}
                    start_date={chapters.start_date}
                    level={level}
                    module={module}
                    topicsName={chapters.name}
                />
                ))}
            </View>
            ) : (
            // Afficher un message s'il n'y a aucun chapitre à afficher
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <Text style={{ color: theme.colors[mode].text, fontSize: 16 }}>
                This Course does not have any topics at the moment.
                </Text>
            </View>
            )}

            
            
      
        </ScrollView>
    </>
    
  )
}