import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StatusBar, Image, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatureRow from '../components/home/featuredRow';
import * as Icon from "react-native-feather";
import theme from '../theme';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen() {
    const navigation = useNavigation();
    const { isDarkTheme, toggleTheme } = useTheme();
    const mode = isDarkTheme ? 'dark' : 'light';
    const route = useRoute();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        if (route.params?.erreurEvaluation) {
            Alert.alert("Error", "Error with server, please try later");
        }
        if (route.params?.evaluationDone) {
            setRefreshKey(prevKey => prevKey + 1);
        }
    }, [route.params]);

    return (
        <SafeAreaView style={{ backgroundColor: theme.colors[mode].white, flex: 1 }}>
            <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} />
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 24, borderWidth: 1, borderColor: theme.colors[mode].lightGray }}>
                    <Icon.Search height={25} width={25} stroke={theme.colors[mode].darkGray} />
                    <TextInput
                        placeholder='Search...'
                        style={{ marginLeft: 8, flex: 1 }}
                        keyboardType='default'
                        placeholderTextColor={theme.colors[mode].darkGray}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ paddingBottom: 12 }}>
                <View style={{ marginTop: 20 }}>
                    <FeatureRow searchQuery={searchQuery} key={refreshKey} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
