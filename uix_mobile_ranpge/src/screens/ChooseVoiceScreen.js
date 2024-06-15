import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import theme from '../theme';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assurez-vous que cette bibliothèque est installée
import VoicePlay from "../components/memos/voicePlay"; // Assurez-vous que le chemin d'accès est correct
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import {voices} from '../constants'


const ChooseVoiceScreen = () => {
    const [selectedVoice, setSelectedVoice] = useState(null);
    const { isDarkTheme } = useTheme();
    const mode = isDarkTheme ? 'dark' : 'light';
    const styles = getStyles(mode);
    const [isLoading, setIsLoading] = useState(false);
    const [uri, setUri] = useState(null);
    const navigation = useNavigation();
    const [confirm, setConfirm] = useState(false);

    
    // Charger la voix sauvegardée au montage du composant
    useEffect(() => {
      const loadSavedVoice = async () => {
          const savedVoice = await SecureStore.getItemAsync('voice');
          if (savedVoice) {
              setSelectedVoice(savedVoice);
          }
      };

      loadSavedVoice();
    }, []);


    async function fetchAndPlayAudio(message, voiceId) {
        setIsLoading(true);
        try {
            const response = await fetch('http://20.19.90.68:80/textToSpeech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: message, voice: voiceId }),
            });
            const jsonResponse = await response.json();
            const audioBase64 = jsonResponse.audioBase64;

            const audioUri = `${FileSystem.cacheDirectory}${voiceId}.mp3`;
            await FileSystem.writeAsStringAsync(audioUri, audioBase64, { encoding: FileSystem.EncodingType.Base64 });

            setUri(audioUri);
        } catch (error) {
            console.error("Erreur lors de la lecture de l'audio:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSelectVoice = (voiceId) => {
        setSelectedVoice(voiceId);
        const message = 'SKEMA Canada: SKEMA Business Schools Artificial Intelligence Innovation Centre';
        fetchAndPlayAudio(message, voiceId);
    };

    const  handleConfirm = async () => {
        setConfirm(true);
        console.log('Voice selected:', selectedVoice);
        await SecureStore.setItemAsync('voice', selectedVoice);
        navigation.navigate('tabNavigator',{ screen: 'Settings'});
    };

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              console.log('Back button pressed');
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={30} color={theme.colors[mode].primary} />
          </TouchableOpacity>
        <View style={{justifyContent: 'center',alignItems: 'center'}}>
          <Text style={styles.title}>Choose a voice</Text>
          <Text style={styles.subtitle}>You can change this later.</Text>
        </View>
        <View style={{ width: 30 }}></View>
      </View>
      
       
        <View style={styles.VoiceView}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors[mode].primary} />
            </View>
          ) : uri && (
            <VoicePlay uri={uri} confirm={confirm}/>
          )}
        </View>
        {/* Adjusted layout to ensure FlatList and button are at the bottom */}
        <FlatList
          data={voices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.voiceButton,
                item.id === selectedVoice && styles.voiceButtonSelected,
              ]}
              onPress={() => handleSelectVoice(item.id)}
            >
              <Text style={styles.voiceText}>{item.label}</Text>
              {item.id === selectedVoice && (
                <Icon name="check" size={24} color={theme.colors[mode].primary} />
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
        />
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  };

const getStyles = (mode) => StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: theme.colors[mode].white, // Assuming dark mode is enabled
  },
  voiceButton: {
    flexDirection: 'row', // Positionne les enfants de la vue horizontalement
    justifyContent: 'space-between', // Répartit les enfants également avec l'espace entre
    alignItems: 'center', // Centre les enfants verticalement
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: theme.colors[mode].voiceButtonBackground, // Couleur d'arrière-plan du bouton
    borderRadius: 10,
  },
  voiceButtonSelected: {
    backgroundColor: '#888', // Highlight selection
  },
  voiceText: {
    color: theme.colors[mode].white,
    fontSize: 18,
  },
  confirmButton: {
    backgroundColor: theme.colors[mode].dark,
    paddingVertical: 15,
    margin: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 18,
    color: theme.colors[mode].white,
  },
  checkIcon: {
    position: 'absolute', // Position absolue pour placer l'icône à droite
    right: 20, // À 20 pixels du bord droit
    alignItems: 'center',
  },
  VoiceView:{
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors[mode].white,
    width: '100%',
    height: 300, // Adjust this value as per your design

  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    padding: 20,
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, 
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors[mode].dark,
    textAlign: 'center', 
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors[mode].gray,
    textAlign: 'center',
  },
});

export default ChooseVoiceScreen;
