import React from "react";
import { Modal, StyleSheet, Text, View, Pressable, FlatList, SafeAreaView, Dimensions, Button } from 'react-native';
import { useRoute, useNavigation  } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import theme from '../theme';
import { useTheme } from '../context/ThemeContext';
import LottieView from "lottie-react-native";
import { ENCOURAGEMENT_MESSAGES } from '../constants'
import { Audio } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
import { useUpdate } from '../context/UpdateContext';

const ResultsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation(); // Utilisez useNavigation ici
  const { triggerRefresh } = useUpdate();

  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalContent, setModalContent] = React.useState("");
  
  const { selectedAnswers, questionsData, topicsName, courseName, timeElapsed, reference } = route.params;
  const { isDarkTheme } = useTheme(); // Utilisez le contexte du thème
  const mode = isDarkTheme ? 'dark' : 'light';
  const styles = getStyles(mode);
  console.log(reference)
  const [sound, setSound] = React.useState();

  function getEncouragementMessage(score) {
    const category = ENCOURAGEMENT_MESSAGES.find(c => score >= c.minScore && score <= c.maxScore);
    if (!category) return ["Keep trying!", "💪"]; // Default message if score doesn't fit in any category
  
    const randomIndex = Math.floor(Math.random() * category.messages.length);
    return category.messages[randomIndex];
  }

  const answersArray = Object.keys(selectedAnswers).map((questionIndex) => {
    const question = questionsData[questionIndex];
    console.log(question)
    const selectedOptionIndex = selectedAnswers[questionIndex];
    console.log(selectedOptionIndex)
    const isCorrect = question.correctAnswerIndex === selectedOptionIndex.selectedAnswer;
  
    return {
      question: question.question,
      selectedAnswer: selectedOptionIndex.selectedAnswer,
      correctAnswer: question.correctAnswerIndex,
      isCorrect,
      reference: reference.find((ref) => ref.question === question.question) 
    };
  });

  const correctAnswersCount = answersArray.filter(item => item.isCorrect).length;
  const totalQuestions = answersArray.length;
  const score = ((correctAnswersCount / totalQuestions) * 100).toFixed(0)
  const encouragementText = getEncouragementMessage(parseInt(score));
  const [showFireworks, setShowFireworks] = React.useState(parseInt(score) >= 80);
  const handlePressQuit = () => {
    triggerRefresh()
    navigation.navigate('tabNavigator', { 
      screen: 'Home', 
      params: { evaluationDone:false },
    });
  };

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const getRandomPosition = () => ({
    position: 'absolute',
    width: 400 + Math.random() * 400, // Adjusted width for larger size
    height: 400 + Math.random() * 400, // Adjusted height for larger size
    left: Math.random() * (screenWidth - 400), // Adjust for new size
    top: Math.random() * (screenHeight - 400),
  });
  

  const fireworkPositions = Array.from({ length: 5 }, () => ({
    ...getRandomPosition(),
    zIndex: 999, // This ensures the animation is on top of all other content
  }));

  React.useEffect(() => {
    async function setAudioMode() {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
    }
  
    setAudioMode();
  }, []);

  React.useEffect(() => {
    let soundObject;
  
    async function loadPlaySound() {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/firework-sound.mp3')
      );
      soundObject = sound;
      await sound.playAsync();
    }
    if (parseInt(score) >= 80) {
      loadPlaySound();
    
      const timer = setTimeout(() => {
        soundObject?.stopAsync();
      }, 5000);
    
      return () => {
        soundObject?.unloadAsync();
        clearTimeout(timer);
      };
    };
  }, []);
  

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowFireworks(false);
    }, 5000); // Ici, nous mettons 30000 millisecondes pour 30 secondes
  
    return () => clearTimeout(timer); // Assurez-vous de nettoyer le timer lorsque le composant est démonté ou le délai est terminé
  }, []);

  async function saveEvaluation() {

    const userId = await SecureStore.getItemAsync('userId');
    if (!userId) {
      console.error('UserID non trouvé');
      return;
    }
    const evaluationData = {
      courseName: courseName,
      chapterName: topicsName,
      note: score,
      time:timeElapsed
    };
    
    try {
      const response = await fetch(`http://20.19.90.68:80/users/${userId}/evaluation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluationData),
      });
  
      if (response.ok) {
        const responseData = await response.json();
        console.log('Évaluation enregistrée avec succès :', responseData);
        // Gérer la réussite de l'enregistrement ici (par exemple, afficher un message à l'utilisateur)
      } else {
        // Gérer les réponses d'erreur de l'API ici
        console.error(response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la requête :', error);
    }
  }

  React.useEffect(() => {
    saveEvaluation();
  }, []);

  // Fonctions de gestion du modal
  const showDetails = (sources) => {
    setModalContent(sources); // Joindre les sources si elles sont dans un tableau
    setModalVisible(true);
  };

  
  const renderItem = ({ item }) => (
    <View style={styles.resultItem}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Q: {item.question}</Text>
        <Text style={styles.answerText}>Your Answer: {item.selectedAnswer}</Text>
        {!item.isCorrect && (
          <>
            <Text style={styles.correctAnswerText}>Correct Answer: {item.correctAnswer}</Text>
            {/* <View style={styles.sourceContainer}>
              <Text style={styles.referenceText}>
                Source: {item.reference?.sources.join(", ")}
              </Text>
              <Pressable
                style={styles.showDetailButton}
                onPress={() => showDetails(item.reference?.sources)}
              >
                <Text style={styles.showDetailButtonText}>Show Details</Text>
              </Pressable>
            </View> */}
            {item.reference && item.reference.error ? (
              <View>
                <Text style={styles.errorText}> Source: {item.reference.message}</Text>
              </View>
            ) : item.reference && item.reference.chunks && item.reference.chunks.length > 0 ? (
              <View style={styles.sourceContainer}>
                <Text style={styles.referenceText}>
                  Source: {item.reference?.sources.join(", ")}
                </Text>
                <Pressable
                  style={styles.showDetailButton}
                  onPress={() => showDetails(item.reference?.chunks)}
                >
                  <Text style={styles.showDetailButtonText}>Show Details</Text>
                </Pressable>
              </View>
            ) : null}

          </>
        )}
      </View>
      <View style={styles.resultIcon}>
        <AntDesign
          name={item.isCorrect ? 'checkcircle' : 'closecircle'}
          size={24}
          color={item.isCorrect ? theme.colors[mode].success : theme.colors[mode].danger}
        />
        <Text style={item.isCorrect ? styles.correctText : styles.incorrectText}>
          {item.isCorrect ? 'Correct' : 'Incorrect'}
        </Text>
      </View>
    </View>
  );
  
  
  

  return (
    <SafeAreaView style={styles.container}>
     {showFireworks && fireworkPositions.map((style, index) => (
        <LottieView
          key={index}
          source={require('../../assets/light-firework.json')} // Assurez-vous de mettre le chemin correct de votre animation
          autoPlay
          loop
          style={style}
        />
      ))}
        <View style={styles.headerContainer}>
            {/* <Image source={require('../../assets/images/trophee.jpeg')} style={styles.trophyImage} /> */}
            
            <Text style={styles.scoreText}>Your Score: {correctAnswersCount}/{totalQuestions}({score}%)</Text>
            <Text style={styles.encouragementText}>{encouragementText}</Text>

        </View>
        <FlatList
        data={answersArray}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{modalContent}</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Hide Details</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
         <Pressable style={styles.quitButton} onPress={handlePressQuit}>
            <Text style={styles.quitButtonText}>Quit</Text>
        </Pressable>

    </SafeAreaView>
  );
};

const getStyles = (mode) => StyleSheet.create({
    container: {
    flex: 1,
    padding: 10,
    backgroundColor: theme.colors[mode].white,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginVertical: 5,
    backgroundColor: theme.colors[mode].lightBackground,
    borderRadius: 10,
    alignItems: "center",
  },
  questionContainer: {
    flex: 3,
  },
  questionText: {
    fontWeight: "bold",
    color:theme.colors[mode].dark,
  },
  answerText: {
    color: theme.colors[mode].gray,
  },
  resultIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  correctText: {
    marginLeft: 5,
    color: theme.colors[mode].success,
  },
  incorrectText: {
    marginLeft: 5,
    color: theme.colors[mode].danger,
  },
  correctAnswerText: {
    color: theme.colors[mode].success,
    paddingTop: 5,
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  trophyImage: {
    width: 100, // Ajustez selon la taille souhaitée
    height: 100, // Ajustez selon la taille souhaitée
  },
  encouragementText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors[mode].success,
    paddingTop: 10,
    flexShrink: 1
  },
  scoreText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: theme.colors[mode].gray,
    paddingTop: 5,
    
  },
  quitButton: {
    backgroundColor: theme.colors[mode].primary, // Couleur du fond du bouton Quitter
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    marginBottom:15,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "20%", // Ajustez selon la taille souhaitée
  },
  quitButtonText: {
    color: "white", // Couleur du texte du bouton Quitter
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  sourceContainer: {
    flexDirection: 'row', // Permet d'aligner le texte et le bouton côte à côte
    flexWrap: 'wrap', // Permet au contenu de passer à la ligne si nécessaire
    alignItems: 'center', // Centre les éléments verticalement
    marginTop: 5,
  },
  showDetailButton: {
    marginLeft: 5, // Ajoute un peu d'espace entre le texte et le bouton
    backgroundColor: theme.colors[mode].lightBackground,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  showDetailButtonText: {
    color: theme.colors[mode].primary,
  },
  referenceText: {
    color: theme.colors[mode].dark,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
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
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonClose: {
    backgroundColor: theme.colors[mode].primary,
  },
  textStyle: {
    color: 'white',
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  errorText:{
    color:theme.colors[mode].danger
  }
  
  
});

export default ResultsScreen;
