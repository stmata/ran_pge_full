import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, Alert, Text, ScrollView } from 'react-native';
import { TabView, SceneMap,TabBar } from 'react-native-tab-view';
import { useWindowDimensions } from 'react-native';
import ActivitiesRoute from '../components/activitiesRoute';
import ProgressRoutes from '../components/progressRoutes';
import { useImagePicker } from '../hooks/useImagePicker';
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../theme'
import { useTheme } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { useUpdate } from '../context/UpdateContext';

const Profile = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'Progress' },
    { key: 'second', title: 'Ranking' },
  ]);

  // Utilisez des clés spécifiques pour chaque image
  const [coverImage, pickCoverImage] = useImagePicker('coverImage');
  const [profileImage, pickProfileImage] = useImagePicker('profileImage');

  const [email, setEmail] = useState('');
  const [formattedName, setformattedName] = useState('');
  const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
  const mode = isDarkTheme ? 'dark' : 'light';
  const { triggerRefresh } = useUpdate();

  const fetchEmail = async () => {
    const userEmail = await SecureStore.getItemAsync('userEmail');
    if (userEmail) {
      const nameParts = userEmail.split('@')[0].split('.'); // Sépare sur le '.' avant le '@'
      const formattedName = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      setformattedName(formattedName)
      setEmail(userEmail);
    } else {
      // Gérer le cas où l'email n'est pas trouvé
      console.log("Aucun email stocké trouvé");
    }
  };
  
  useEffect(() => {
    fetchEmail();
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  const renderScene = SceneMap({
    first: ActivitiesRoute,
    second: ProgressRoutes,
  });
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{
        backgroundColor: theme.colors[mode].primary,
      }}
      style={{
        backgroundColor:  theme.colors[mode].white,
        height: 44,
      }}
      renderLabel={({ focused, route }) => (
        <Text style={[{ color: focused ?  theme.colors[mode].primary :  theme.colors[mode].black }]}>
          {route.title}
        </Text>
      )}
    />
  );

  const handlePickCoverImage = async () => {
    await pickCoverImage();
    triggerRefresh();
  };
  

  return (
    <ScrollView style={{ backgroundColor: theme.colors[mode].white, flex:1 }}>
      <View style={{ width: "100%"  ,position: 'relative'}}>
        <TouchableOpacity onPress={handlePickCoverImage}>
          <Image
            source={coverImage ? { uri: coverImage } : require('../../assets/images/cover.jpg')}
            resizeMode="cover"
            style={{
              height: 250,
              width: "100%",
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => pickCoverImage()}
          style={{
            position: 'absolute', // Position absolue par rapport à son parent
            right: 10, // À 10 pixels du bord droit
            bottom: 10, // À 10 pixels du bord inférieur
            backgroundColor: theme.colors[mode].transparentBackGray, // Fond semi-transparent noir
            padding: 8, // Un peu de padding autour du texte
            borderRadius: 16, // Bords arrondis,
          }}
        >
          <AntDesign name="edit" size={24} color={theme.colors[mode].white} />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, alignItems: "center" }}>
        <View style={{ position: 'relative',marginTop: -90, }}>
          <TouchableOpacity onPress={() => pickProfileImage()}>
            <Image
              source={profileImage ? { uri: profileImage } : require('../../assets/images/man.png')}
              resizeMode="contain"
              style={{
                height: 120,
                width: 120,
                borderRadius: 99,
                borderColor: theme.colors[mode].white, // Remplacer COLORS.white par 'white' si COLORS n'est pas défini
                borderWidth: 3,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => pickCoverImage()}
            style={{
              position: 'absolute', // Position absolue par rapport à son conteneur parent
              right: 0, // À droite
              bottom: 0, // En bas
              backgroundColor: theme.colors[mode].transparentBackGray2, // Fond semi-transparent noir
              padding: 8, // Un peu de padding autour du texte
              borderRadius: 99, // Bords arrondis
            }}
          >
            <AntDesign name="edit" size={24} color={theme.colors[mode].white} />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            fontSize:18,
            color: theme.colors[mode].black,
            marginVertical: 8,
          }}
        >
          {formattedName}
        </Text>
      </View>
      <View style={{ flex: 1, backgroundColor: theme.colors[mode].white }}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}    
          style={{
            height: layout.height-200
          }}
        />
      </View>
      
    </ScrollView>
  );
};



export default Profile;
