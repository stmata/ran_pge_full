import React, { useState,useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import theme from '../theme'
import { useTheme } from '../context/ThemeContext';
import { useUpdate } from '../context/UpdateContext';
import { useAuth } from '../context/AuthContext';

const SECTIONS = [
  {
    header: 'Preferences',
    items: [
      // { id: 'language', icon: 'globe', label: 'Language', type: 'select' },
      { id: 'darkMode', icon: 'moon', label: 'Dark Mode', type: 'toggle' },
      { id: 'Voice', icon: 'mic', label: 'Choose Voice', type: 'link' },
    ],
  },
  {
    header: 'Help',
    items: [
      //{ id: 'bug', icon: 'flag', label: 'Report Bug', type: 'link' },
      { id: 'contact', icon: 'mail', label: 'Contact Us', type: 'link' },
    
    ],
  },
  {
    header: 'logouts',
    items: [
      { id: 'logouts', icon: 'log-out', label: 'logouts', type: 'button' },
    ],
  },
 
];

export default function SettingScreen() {

  const navigation = useNavigation();
  const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
  const mode = isDarkTheme ? 'dark' : 'light';
  const styles = getStyles(mode);
  const { logout } = useAuth();

  const [email, setEmail] = useState('');
  const [formattedName, setformattedName] = useState('');
  const [profileImageUri, setProfileImageUri] = useState(null);
  const { refresh } = useUpdate();

  useEffect(() => {
    const fetchEmailAndProfileImage = async () => {
      const userEmail = await SecureStore.getItemAsync('userEmail');
      const profileImageUri = await SecureStore.getItemAsync('profileImage');
  
      if (userEmail) {
        const nameParts = userEmail.split('@')[0].split('.'); // Sépare sur le '.' avant le '@'
        const formattedName = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
        setformattedName(formattedName);
        setEmail(userEmail);
      } else {
        console.log("Aucun email stocké trouvé");
      }
  
      if (profileImageUri) {
        setProfileImageUri(profileImageUri);
      }
    };
  
    fetchEmailAndProfileImage();
  }, [refresh]);
  

  const logouts = async () => {
    try {
      // Étape 1: Récupérer l'ID de l'utilisateur stocké localement
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) {
        console.error('Aucun ID utilisateur trouvé pour la déconnexion');
        return;
      }
  
      // Étape 2: Mettre à jour l'utilisateur pour supprimer le verification_code
      const response = await fetch(`http://20.19.90.68:80/users/${userId}/update_verification_code`, {
        method: 'PATCH', // Utilisation de la méthode PATCH pour mettre à jour partiellement la ressource
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur sur le serveur');
        const text = await response.text(); // ou response.json() si vous attendez du JSON
        console.log(text);
        return;
      }
  
      // Étape 3: Vider les données du SecureStore
      await SecureStore.deleteItemAsync('userIsLoggedIn');
      await SecureStore.deleteItemAsync('userEmail');
      await SecureStore.deleteItemAsync('userId'); // Effacer aussi l'ID utilisateur
      await SecureStore.deleteItemAsync('levelChoice');
      await SecureStore.deleteItemAsync('voice');
      await SecureStore.deleteItemAsync('profileImage');
      await SecureStore.deleteItemAsync('coverImage');

      logout()
      // Étape 4: Redirection ou mise à jour de l'état pour refléter la déconnexion
      navigation.navigate('Onboarding');
      console.log('Déconnexion réussie et code de vérification supprimé');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };
  

  const handleOnPress = (id) => {
    if (id === "logouts") {
      logouts();
    } else if (id === "Voice") {
      navigation.navigate('ChooseVoice');
    }
    else if (id === "contact") {
      navigation.navigate('Contact');
    }
  };
  






  


  return (
    <SafeAreaView style={{ backgroundColor: theme.colors[mode].white, flex:1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>

          <Text style={styles.subtitle}>
            Customize your experience
          </Text>
        </View>

        <View style={styles.profile}>
        <Image
          alt="Profile Image"
          source={profileImageUri ? { uri: profileImageUri } : require('../../assets/images/man.png')}
          style={styles.profileAvatar}
        />


          <Text style={styles.profileName}>{formattedName}</Text>

          <Text style={styles.profileEmail}>{email}</Text>

        </View>

        {SECTIONS.map(({ header, items }) => (
          <View style={styles.section} key={header}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{header}</Text>
            </View>
            <View style={styles.sectionBody}>
              {items.map(({ id, label, icon, type, value }, index) => {
                return (
                  <View
                    key={id}
                    style={[
                      styles.rowWrapper,
                      index === 0 && { borderTopWidth: 0 },
                    ]}>
                    <TouchableOpacity
                      onPress={() => handleOnPress(id)}>
                      <View style={styles.row}>
                        <FeatherIcon
                          color={theme.colors[mode].gray}
                          name={icon}
                          style={styles.rowIcon}
                          size={22} />

                        <Text style={styles.rowLabel}>{label}</Text>

                        <View style={styles.rowSpacer} />

                        {type === 'select' && (
                          <Text style={styles.rowValue}>{form[id]}</Text>
                        )}

                        {type === 'toggle' && (
                          <Switch
                            onValueChange={toggleTheme}
                            value={isDarkTheme}
                          />
                        )}

                        {(type === 'select' || type === 'link') && (
                          <FeatherIcon
                            color={theme.colors[mode].lighterGray}
                            name="chevron-right"
                            size={22} />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (mode) => StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  header: {
    paddingLeft: 24,
    paddingRight: 24,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors[mode].dark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors[mode].mediumGray,
  },
  /** Profile */
  profile: {
    padding: 16,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: theme.colors[mode].white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors[mode].lightGray,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 9999,
  },
  profileName: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors[mode].profileText,
  },
  profileEmail: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors[mode].emailText,
  },
  profileAction: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors[mode].actionBackground,
    borderRadius: 12,
  },
  profileActionText: {
    marginRight: 8,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors[mode].white,
  },
  /** Section */
  section: {
    paddingTop: 12,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors[mode].sectionHeader,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionBody: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors[mode].lightGray,
  },
  /** Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: 24,
    height: 50,
  },
  rowWrapper: {
    paddingLeft: 24,
    backgroundColor: theme.colors[mode].white,
    borderTopWidth: 1,
    borderColor: theme.colors[mode].lightGray,
  },
  rowIcon: {
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: theme.colors[mode].black,
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  rowValue: {
    fontSize: 17,
    color: theme.colors[mode].gray,
    marginRight: 4,
  },
});
