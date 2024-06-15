import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView, Modal, TouchableOpacity,Dimensions  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import LevelCard from '../components/levelCard'; // Assurez-vous que le chemin d'importation est correct
import theme from "../theme";
import { useTheme } from '../context/ThemeContext';
import Checkbox from 'expo-checkbox';
import { AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isTablet = width > 750;

const ChooseLevelScreen = () => {
  const navigation = useNavigation();
  const { isDarkTheme } = useTheme();
  const mode = isDarkTheme ? 'dark' : 'light';
  const [formattedName, setFormattedName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState(false);
  const styles = getStyles(mode);

  
  useEffect(() => {
    const fetchEmail = async () => {
      const userEmail = await SecureStore.getItemAsync('userEmail');
      if (userEmail) {
        const nameParts = userEmail.split('@')[0].split('.');
        const formattedName = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
        setFormattedName(formattedName);
      } else {
        console.log("Aucun email stocké trouvé");
      }
    };

    fetchEmail();
  }, []);

  useEffect(() => {
    if (termsAccepted) {
      setError(false); // Réinitialiser l'erreur si l'utilisateur accepte les termes
    }
  }, [termsAccepted]);

  const sendLevelToBackend = async () => {
    if (!termsAccepted) {
        setError(true);
        return;
    }
    const userId = await SecureStore.getItemAsync('userId');
    try {
      const response = await fetch(`http://20.19.90.68:80/user/${userId}/choiceLevel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ level: selectedLevel })
      });

      const json = await response.json();
      if (json.success) {
        await SecureStore.setItemAsync('levelChoice', selectedLevel);
        navigation.navigate('tabNavigator');
      } else {
        console.log('Erreur lors de la sélection du niveau.');
      }
    } catch (error) {
      console.log('Erreur de communication avec le backend.');
    }
    setModalVisible(false);
  };

  const openModal = (level) => {
    setSelectedLevel(level);
    setModalVisible(true);
  };


  const levels = [
    { name: "Licence 3", value: 'L3', image: require('../../assets/images/licence3.jpeg') },
    { name: "Master 1", value: 'M1', image: require('../../assets/images/master1.jpeg') },
  ];

  return (
    <SafeAreaView className='flex-1' style={{backgroundColor: theme.colors[mode].white , justifyContent:'center'}}>
    <View className='mt-4'>
        <View style={styles.titleContainer}>
            <Text style={styles.name}>Welcome {formattedName}</Text>
            <Text style={styles.title}>Please, choose your Level to continue...</Text>
        </View>

        {isTablet ? (
            <View style={styles.levelsContainerTablet}>
              {levels.map((level, index) => (
                <LevelCard
                  level={level}
                  key={index}
                  onSelect={() => openModal(level.value)}
                />
              ))}
            </View>
          ) : (
            <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{alignItems: 'center'}}
        >
            {levels.map((level, index) => (
                <LevelCard
                    level={level}
                    key={index}
                    onSelect={() => openModal(level.value)}
                />
            ))}
        </ScrollView>
          )}
    </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.titleModelContainer}>
                <Text style={styles.termsTitle}>Terms and Conditions</Text>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(!modalVisible)}
                    >
                    <AntDesign name="close" size={20} color={theme.colors[mode].gray} />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.termsScrollView}>
                <Text style={styles.termsText}>
                By choosing a level "{selectedLevel}", you agree that:
                </Text>
                <View style={styles.termsList}>
                <Text style={styles.termItem}>1. The selected level will determine the courses available to you, as well as the evaluations and course chat interactions.</Text>
                <Text style={styles.termItem}>2. Should you attempt to change your level at any point, please be aware that all history related to your chat interactions and evaluations will be permanently deleted. This is to ensure the integrity of your learning path and assessments.</Text>
                <Text style={styles.termItem}>3. We encourage you to choose carefully and consider your current academic standing and future educational goals. Our aim is to provide you with a personalized and effective learning experience that aligns with your academic level.</Text>
                </View>
            </ScrollView>
            <View style={styles.checkboxContainer}>
                <TouchableOpacity
                    style={styles.termsButton}
                    onPress={() => setTermsAccepted(!termsAccepted)}
                >
                    <Checkbox
                        value={termsAccepted}
                        onValueChange={setTermsAccepted}
                        color={termsAccepted || !error ? theme.colors[mode].primary : theme.colors[mode].danger}
                    />
                    <Text style={styles.checkboxLabel}>I understand that changing levels will erase all related history to safeguard the learning process. I accept these terms, considering my academic standing and goals.</Text>
                </TouchableOpacity>
            </View>
            {error && <Text style={styles.errorMessage}>You must accept the terms and conditions to continue.</Text>}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={sendLevelToBackend}
            >
              <Text style={styles.continueButtonText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (mode) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
      justifyContent: 'center',
      alignItems: 'flex-start',
      marginStart: isTablet ? 100 : 30,
      //marginTop:150
  },
    title: {
        fontSize: 16,
        color: theme.colors[mode].gray, // Assuming you have a 'text' key in your colors
        marginBottom: 20, // Space between the title and the cards
        textAlign: 'center', // Center the title text
    },
    name:{
        fontSize: 30,
        fontWeight: 'bold',
        color: theme.colors[mode].dark, // Assuming you have a 'text' key in your colors
        textAlign: 'center', // Center the title text
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: theme.colors[mode].white,
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '85%', // Assurez-vous de définir une largeur pour positionner correctement le bouton de fermeture
        position: 'relative', // Important pour le positionnement absolu du bouton de fermeture
    },
        closeButton: {
        position: 'absolute',
        right: 10,
    },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  titleModelContainer: {
    flexDirection: 'row', // Aligner les enfants horizontalement
    justifyContent: 'space-between', // Espacer les enfants à l'extrême gauche et à l'extrême droite
    alignItems: 'center', // Centrer les enfants verticalement
    width: '100%', // Assurez-vous que le conteneur s'étend sur toute la largeur
    marginBottom: 20, // Ajoute un peu d'espace en dessous du conteneur
  },
  termsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  termsText: {
    marginLeft: 10,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    flexShrink: 1, // Ensure text wraps within the modal
    color: theme.colors[mode].dark
  },
  continueButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: theme.colors[mode].primary,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  termsScrollView: {
    maxHeight: 400, // Adjust based on your modal's size
  },
  termsTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: theme.colors[mode].dark, 
    textAlign: 'left',
  },
  termsText: {
    fontSize: 16,
    marginBottom: 10,
    color: theme.colors[mode].dark
  },
  termsList: {
    marginLeft: 10,
    color: theme.colors[mode].dark
  },
  termItem: {
    fontStyle:'italic',
    fontSize: 16,
    marginBottom: 10,
    color: theme.colors[mode].dark,
  },
  errorMessage: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginBottom:10
  },
  levelsContainerTablet:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'

  }
});

export default ChooseLevelScreen;

