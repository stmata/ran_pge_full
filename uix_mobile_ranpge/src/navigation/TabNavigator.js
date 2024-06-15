import {  Text,  View, Image, Platform , Dimensions } from 'react-native';
import  HomeScreen  from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useUpdate } from '../context/UpdateContext';
import React, {useState, useEffect} from 'react';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');
const isTablet = width > 750; // Une largeur commune pour considérer un appareil comme une tablette
// Thanks for watching
const Tab =createBottomTabNavigator();

export default function TabNavigator() {
  const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
  const mode = isDarkTheme ? 'dark' : 'light';
  const { refresh } = useUpdate();
  const [profileImageUri, setProfileImageUri] = useState(null);

  useEffect(() => {
    const fetchEmailAndProfileImage = async () => {
      const profileImageUri = await SecureStore.getItemAsync('profileImage');

      if (profileImageUri) {
        setProfileImageUri(profileImageUri);
      }
    };
  
    fetchEmailAndProfileImage();
  }, [refresh]);
  const screenOptions = {
    tabBarShowLabel:false,
    headerShown:false,
    tabBarStyle:{
      position: "absolute",
      bottom: 0,
      right: isTablet ? '11%' : 0, // Centrer sur les tablettes
      left: isTablet ? '11%' : 0, // Centrer sur les tablettes
      elevation: 0,
      height: 60,
      backgroundColor: theme.colors[mode].white,
      shadowColor: 'transparent',
      shadowOffset: { width: 0,  height: -2},
      shadowOpacity: 1, // Supprime l'ombre sur iOS
      borderTopWidth: 0, // Supprime le trait de bordure en haut du tabBar
      borderTopColor: theme.colors[mode].boxCardText,
    }
  }

  return (
        <Tab.Navigator screenOptions={screenOptions}>
          <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            tabBarIcon: ({focused})=>{
              return (
                <View style={{alignItems: "center", justifyContent: "center",padding: 2}}> 
                  <Entypo name="home" size={30} color={focused ? theme.colors[mode].primary: theme.colors[mode].black} />
                  <Text style={{fontSize: 8, color: focused ? theme.colors[mode].primary: theme.colors[mode].black}}>HOME</Text>

            </View>
              )
            }
          }}
          />
          <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{
            tabBarIcon: ({focused})=>{
              return (
                <View
                 style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: Platform.OS == "ios" ? 50 : 60,
                  height: Platform.OS == "ios" ? 50 : 60,
                  top: Platform.OS == "ios" ? -10 : -20,
                  borderRadius: Platform.OS == "ios" ? 25 : 30
                 }}
                >
                  <Image className="rounded-full h-12 w-12" source={profileImageUri ? { uri: profileImageUri } : require('../../assets/images/man.png')}/>
                  <Text style={{fontSize: 8, color: focused ? theme.colors[mode].primary: theme.colors[mode].black}}>PROFILE</Text>
            </View>
              )
            }
          }}
          />
          <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{
            tabBarIcon: ({focused})=>{
              return (
                <View style={{alignItems: "center", justifyContent: "center",padding: 2}}> 
                 <Ionicons name="settings" size={30}  color={focused ? theme.colors[mode].primary: theme.colors[mode].black} />
                 <Text style={{fontSize: 8, color: focused ? theme.colors[mode].primary: theme.colors[mode].black}}>SETTINGS</Text>
            </View>
              )
            }
          }}
          />
          
       </Tab.Navigator>
       
    
)
}