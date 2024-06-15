import { StyleSheet, Text, SafeAreaView, View, Pressable, ScrollView, Animated } from "react-native";
import React, { useState, useEffect,useRef } from "react";
import { ActivityIndicator } from "react-native";
import EvaluateCard from "../components/evaluateCard";
import theme from '../theme';
import { useTheme } from '../context/ThemeContext';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'
import LottieView from "lottie-react-native";
import { Audio } from 'expo-av';
import { useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons'; // Ajouté pour l'icône de chronomètre
import * as SecureStore from 'expo-secure-store';

const EvaluateScreen = () => {
  const [index, setIndex] = useState(0);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreparation, setShowPreparation] = useState(false);
  const route = useRoute();
  const {courseName, topicsName, level} = route.params;
  const [timer, setTimer] = useState(0); // Chronomètre en secondes
  const [isTimerActive, setIsTimerActive] = useState(false); // État d'activité du chronomètre
  const [introductionComplete, setIntroductionComplete] = useState(false);
  const [reference,setReference] = useState(null)

  useEffect(() => {
    if (data.length === 0) { // Si le tableau 'data' est vide, alors effectuez la requête
      fetchQuestions();
    }
  }, [data]); // Ajoutez 'data' comme dépendance pour ré-exécuter l'effet si 'data' change  



// // Fonction pour envoyer les questions extraites au serveur
// const sendQuestionToServer = async (questions) => {
//   try {
//     const response = await fetch('https://api-ranpge-middleware-agents.azurewebsites.net/process-data', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({question:questions}), // Envoie un objet avec une propriété 'questions' contenant le tableau des questions
//     });

//     if (!response.ok) {
//       throw new Error('Erreur lors de l\'envoi des questions');
//     }

//     // Traiter la réponse du serveur si nécessaire
//     const responseData = await response.json();
//     console.log('Questions envoyées avec succès:', responseData);
//   } catch (error) {
//     console.error('Erreur lors de l\'envoi des questions:', error);
//   }
// };

//   // Fonction pour envoyer toutes les questions en parallèle
//   const sendAllQuestionsToServer = (data) => {
//     const questions = data.map(item => item[0]);
  
//     // Crée un tableau de promesses pour l'envoi de chaque question
//     const promises = questions.map(question => sendQuestionToServer(question));
  
//     // Exécute toutes les promesses en parallèle
//     Promise.all(promises)
//       .then(() => console.log('Toutes les questions ont été envoyées avec succès.'))
//       .catch(error => console.error('Erreur lors de l\'envoi des questions:', error));
//   };

// // Fonction modifiée pour envoyer une question au serveur et retourner la réponse
// const sendQuestionToServer = async (question) => {
//   try {
//     const response = await fetch('https://api-ranpge-middleware-agents.azurewebsites.net/process-data', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ question }), // Correction pour envoyer une seule question
//     });

//     if (!response.ok) {
//       throw new Error('Erreur lors de l\'envoi de la question');
//     }

//     const responseData = await response.json();
//     return responseData; // Retourne directement la réponse du serveur
//   } catch (error) {
//     console.error('Erreur lors de l\'envoi de la question:', error);
//     // Retourne un objet d'erreur pour permettre le traitement ultérieur
//     return { error: true, message: error.message, question };
//   }
// };

// // Fonction pour envoyer toutes les questions séquentiellement avec un délai
// const sendQuestionsSequentiallyWithDelay = async (data, delay = 5000) => {
//   const questions = data.map(item => item[0]);
//   const results = [];

//   for (const question of questions) {
//     const result = await sendQuestionToServer(question);
//     results.push({
//       question,
//       response: result.response || 'Error in retrieving data',
//       chunks: result.chunks || '',
//       scores: result.scores || [],
//       sources: result.sources || [],
//     });

//     // Attendre un délai avant d'envoyer la question suivante
//     await new Promise(resolve => setTimeout(resolve, delay));
//   }

//   console.log('Résultats avec réponses associées:', results);
// };

// // Fonction modifiée pour envoyer une question au serveur et retourner la réponse avec des détails supplémentaires
// const sendQuestionToServer = async (question) => {
//   try {
//     const response = await fetch('https://api-ranpge-middleware-agents.azurewebsites.net/process-data', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ question }), // Correction pour envoyer une seule question
//     });

//     if (!response.ok) {
//       throw new Error('Erreur lors de l\'envoi de la question');
//     }

//     const responseData = await response.json();
//     console.log('Questions envoyées avec succès:', responseData);
//     // Retourne directement la réponse du serveur avec des détails supplémentaires
//     return {
//       question,
//       response: responseData.response || 'Error in retrieving data',
//       chunks: responseData.chunks || '',
//       scores: responseData.scores || [],
//       sources: responseData.sources || [],
//     };
//   } catch (error) {
//     console.error('Erreur lors de l\'envoi de la question:', error);
//     // Retourne un objet d'erreur avec la question pour permettre le traitement ultérieur
//     return {
//       question,
//       error: true,
//       message: error.message,
//       response: 'Error in retrieving data',
//       chunks: '',
//       scores: [],
//       sources: [],
//     };
//   }
// };

// // Fonction pour envoyer toutes les questions séquentiellement avec un délai et traiter les réponses
// const sendQuestionsSequentiallyWithDelay = async (data, delay = 1000) => {
//   const questions = data.map(item => item[0]);
//   const results = [];

//   for (const question of questions) {
//     const result = await sendQuestionToServer(question);
//     results.push(result);

//     // Attendre un délai avant d'envoyer la question suivante
//     await new Promise(resolve => setTimeout(resolve, delay));
//   }

//   console.log('Résultats avec réponses et détails associés:', results);
// };
// Fonction modifiée pour envoyer une question au serveur et retourner la réponse avec des détails supplémentaires
const sendQuestionToServer = async (question) => {
  try {
    const response = await fetch('https://api-ranpge-middleware-agent.azurewebsites.net/process-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }), // Correction pour envoyer une seule question
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi de la question');
    }

    const responseData = await response.json();
    // Retourne directement la réponse du serveur avec des détails supplémentaires
    return {
      question,
      response: responseData.response || 'Error in retrieving data',
      chunks: responseData.chunks || '- Book: Marketing Management, Kotler et. al. Sixteenth Edition, - Book: Marketing the basics, Karl Moore and Niketh Pareek @2006',
      scores: responseData.scores || [``],
      sources: responseData.sources || [],
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la question:', error);
    // Retourne un objet d'erreur avec la question pour permettre le traitement ultérieur
    return {
      question,
      error: true,
      message: error.message,
      response: 'Error in retrieving data',
      chunks: '',
      scores: [],
      sources: [],
    };
  }
};

// Fonction pour envoyer toutes les questions en parallèle et traiter les réponses
const sendAllQuestionsToServer = async (data) => {
  const questions = data.map(item => item[0]);

  // Crée un tableau de promesses pour l'envoi de chaque question
  const promises = questions.map(question => sendQuestionToServer(question));

  // Exécute toutes les promesses en parallèle et attend leur achèvement
  const results = await Promise.all(promises);
  setReference(results);

  console.log('Résultats avec réponses et détails associés:', results);
};


  const fetchQuestions = async (retryCount = 0) => {

    const userId = await SecureStore.getItemAsync('userId');
    if (!userId) {
      console.log('UserID non trouvé.');
      setIsLoading(false);
      setHasDataLoadedSuccessfully(false);
      return;
    }
  
    try {
      setIsLoading(true);
      const response = await fetch('http://20.19.90.68:80/evalution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: level,
          module: courseName,
          topicsName: topicsName,
          userId: userId
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const questionsRaw = await response.json();
  
      // Vérifiez si questionsRaw est null ou si le tableau est vide
      if (questionsRaw !== null && questionsRaw.length > 0) {
        // Si les données sont chargées avec succès
        const formattedQuestions = formatQuestions(questionsRaw);
        setData(formattedQuestions);
        setIsLoading(false);
        setHasDataLoadedSuccessfully(true);
        sendAllQuestionsToServer(questionsRaw);
      } else if ((questionsRaw === null || questionsRaw.length === 0) && retryCount < 3) {
        // Si aucune donnée n'est trouvée, réessayez
        setTimeout(() => fetchQuestions(retryCount + 1), 5000);
      } else {
        // Si toutes les tentatives sont épuisées sans succès
        setIsLoading(false);
        setHasDataLoadedSuccessfully(false);
        navigation.navigate('tabNavigator', { 
          screen: 'Home', 
          params: { erreurEvaluation: true },
        });
      }
    } catch (error) {
      setIsLoading(false);
      setHasDataLoadedSuccessfully(false);
      navigation.navigate('tabNavigator', { 
        screen: 'Home', 
        params: { erreurEvaluation: true },
      });
    }
  };

  // Fonction pour récupérer uniquement les questions du tableau de données
// const extractQuestions = (data) => {
//   return data.map(item => item[0]);
// };



  const formatQuestions = (questionsRaw) => {
    console.log(questionsRaw)
    return questionsRaw.map((questionArray, index) => ({
      question: questionArray[0],
      options: [
        { id: "0", options: "A", answer: questionArray[1] },
        { id: "1", options: "B", answer: questionArray[2] },
        { id: "2", options: "C", answer: questionArray[3] },
      ],
      correctAnswerIndex: questionArray[1], // Supposant que "Correct Answer 1" correspond à l'index 1 dans votre format
    }));
  };

  const totalQuestions = data.length;
  const progressPercentage = Math.floor((index / totalQuestions) * 100);
  const [selectedIndexes, setSelectedIndexes] = useState({});
  const navigation = useNavigation()
  const [hasDataLoadedSuccessfully, setHasDataLoadedSuccessfully] = useState(false);

  const { isDarkTheme } = useTheme(); // Utilisez le contexte du thème
  const mode = isDarkTheme ? 'dark' : 'light';

  const startIndex = Math.floor(index / 5) * 5;
  const endIndex = Math.min(startIndex + 5, data.length);
  const styles = getStyles(mode);

  const allQuestionsAnswered = Object.keys(selectedIndexes).length === totalQuestions;
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const soundObject = useRef(new Audio.Sound());
  const preparationAnimation = require('../../assets/eva_loading.json');
  const instructions = [
    { text: "Welcome to the evaluation", audio: require('../../assets/loading_sound/output1.mp3') },
    { text: "Read each question carefully.", audio: require('../../assets/loading_sound/output2.mp3') },
    { text: "Select the best answer from the options.", audio: require('../../assets/loading_sound/output3.mp3') },
    { text: "You can navigate between questions at any time.", audio: require('../../assets/loading_sound/output4.mp3') },
    { text: "Make sure to answer all questions before submitting.", audio: require('../../assets/loading_sound/output5.mp3') },
    { text: "Good luck!", audio: require('../../assets/loading_sound/output6.mp3') },
    { text: "Good luck!", audio: require('../../assets/loading_sound/output7.mp3') },
  ];
  
  
  const instructionAnimations = instructions.map(() => useRef(new Animated.Value(0)).current);

   // Fonction pour charger et jouer le son de l'instruction courante
   const playSound = async (index) => {
    const instruction = instructions[index];
    try {
      await soundObject.current.unloadAsync(); // Assurez-vous de décharger tout son précédent
      await soundObject.current.loadAsync(instruction.audio);
      await soundObject.current.playAsync();
    } catch (error) {
      console.error("Erreur lors de la lecture du son:", error);
    }
  };

  useEffect(() => {
    async function setAudioMode() {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
    }
  
    setAudioMode();
  }, []);

    // Effet pour gérer la lecture du son et la séquence d'instructions
    useEffect(() => {
      if (currentInstructionIndex < instructions.length) {
        playSound(currentInstructionIndex);
  
        // Passer à l'instruction suivante une fois que le son est terminé
        soundObject.current.setOnPlaybackStatusUpdate(async (playbackStatus) => {
          if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
            const nextIndex = currentInstructionIndex + 1;
            if (nextIndex < instructions.length) {
              setCurrentInstructionIndex(nextIndex);
            } else {
              // Toutes les instructions ont été lues
              setShowPreparation(true);
              setIntroductionComplete(true);
            }
          }
        });
      }
  
      return () => {
        soundObject.current.unloadAsync(); // Nettoyer en déchargeant le son lors du démontage
      };
    }, [currentInstructionIndex]);

    useEffect(() => {
      if (introductionComplete && data.length === 0 && !isLoading) {
        fetchQuestions();
      }
    }, [introductionComplete]); // Only re-run when introductionComplete changes
    

    useEffect(() => {
      let isCancelled = false;
    
      const animateInstruction = async (index) => {
        if (index < instructions.length && !isCancelled) {
          // Commencer directement l'animation sans délai initial
          //instructionAnimations[index].setValue(-100); // ajustez si nécessaire pour optimiser le point de départ
    
          Animated.timing(instructionAnimations[index], {
            toValue: 1,
            duration: 500, // Durée réduite pour une animation plus rapide
            useNativeDriver: true,
          }).start();
        }
      };
    
      animateInstruction(currentInstructionIndex);
    
      return () => {
        isCancelled = true;
      };
    }, [currentInstructionIndex, instructionAnimations, instructions.length]);
    
    useEffect(() => {
      // Démarrer le chronomètre seulement après le chargement des données
      if (!isLoading) {
        setIsTimerActive(true);

      }
    }, [isLoading,timer]);
    
    useEffect(() => {
      let intervalId;
    
      if (isTimerActive) {
        intervalId = setInterval(() => {
          setTimer((prevTimer) => prevTimer + 1);
        }, 1000);
      }
    
      // Nettoyage
      return () => clearInterval(intervalId);
    }, [isTimerActive]);
    
  function formatTime(timeInSeconds) {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  const skipIntroduction = () => {
    setIntroductionComplete(true); // Mark the introduction as complete
    // Optionally, stop any ongoing instruction audio playback
    soundObject.current.stopAsync();
  };

  const skipButtonAnimation = useRef(new Animated.Value(300)).current; // Starts 300 pixels to the right

  useEffect(() => {
    // Attendre 2 secondes avant de démarrer l'animation
    const timer = setTimeout(() => {
      Animated.timing(skipButtonAnimation, {
        toValue: 0, // Moves to its final position
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 2000); // Délai de 2 secondes
  
    // Nettoyer le timer si le composant est démonté avant que le timer ne se termine
    return () => clearTimeout(timer);
  }, []);
  
  
  
 

  if (!introductionComplete || isLoading || !hasDataLoadedSuccessfully) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {!introductionComplete && currentInstructionIndex < instructions.length && !showPreparation  ? (
            <>
              {instructions.slice(0, currentInstructionIndex + 1).map((instruction, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.animatedView,
                    {
                      opacity: instructionAnimations[index], // Linked directly to the animated value
                      transform: [
                        {
                          translateX: instructionAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-100, 0], // Starts at -100 (left), moves to 0 (final position)
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View
                    key={index} // This key is redundant as you've already assigned a key to Animated.View
                    style={[
                      styles.instructionView,
                      {
                        opacity: index === currentInstructionIndex ? 1 : 0.5,
                      },
                    ]}
                  >
                    <Text style={styles.instructionText}>{instruction.text}</Text>
                  </View>
                </Animated.View>
              ))}
            </>
          ) : (
            <>
              <LottieView 
                source={preparationAnimation} 
                autoPlay 
                loop 
                style={styles.lottieStyle} 
              />
              <Text style={styles.preparationText}>
                We are preparing your evaluation, it will be ready in a few seconds...
              </Text>
            </>
          )}
        </View>
        {!introductionComplete && currentInstructionIndex < instructions.length && !showPreparation && (
        <Animated.View
        style={[
          styles.skipButtonContainer,
          {
            transform: [{ translateX: skipButtonAnimation }],
          },
        ]}
      >
        <Pressable onPress={skipIntroduction} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip Introduction</Text>
        </Pressable>
      </Animated.View>
      )}
      </SafeAreaView>
    );
  }else{
  

  return (
    <SafeAreaView style={{ flex: 1 , backgroundColor:theme.colors[mode].white}}>
     
      <View style={styles.EvaluateContainer}>
      <View style={styles.timerContainer}>
          <FontAwesome name="hourglass-start" size={16} color={theme.colors[mode].gray} />
          <Text style={styles.timer}>{formatTime(timer)}</Text>
        </View>
      <View style={{justifyContent: 'space-between' }}>
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginHorizontal: 10,
              marginTop: 10,
            }}
          >
            <Text style={{color:theme.colors[mode].gray}}>Your Progress</Text>
            <Text style={{color:theme.colors[mode].gray}}>({index}/{totalQuestions}) questions answered</Text>
          </View>

          {/* Progress Bar */}
          <View
            style={{
              backgroundColor: theme.colors[mode].lightBackground,
              width: "98%",
              height: 10,
              borderRadius: 20,
              marginTop: 20,
              marginHorizontal:10
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors[mode].primary,
                height: 10,
                borderRadius: 20,
                width: `${progressPercentage}%`,
              }}
            />
          </View>
        </View>

        
      </View>
      <EvaluateCard
          data={data}
          index={index}
          setIndex={setIndex}
          setSelectedIndexes={setSelectedIndexes}
          selectedIndexes={selectedIndexes}
          startIndex={startIndex}
          endIndex={endIndex}
        />
        </View>

      {/* Navigation Bar */}
      <View style={styles.navigationContainer}>
        <Pressable
          onPress={() => index > 0 && setIndex(index - 1)}
          style={[styles.navButton, { opacity: index > 0 ? 1 : 0 }]}
        >
          <AntDesign name="left" size={24} color="white" />
        </Pressable>

        {/* Question navigation buttons */}
        <ScrollView
          horizontal
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          showsHorizontalScrollIndicator={false}
        >
          {data.slice(startIndex, endIndex).map((_, questionIndex) => (
            <Pressable
              key={startIndex + questionIndex}
              onPress={() => setIndex(startIndex + questionIndex)}
              style={[
                styles.questionNavItem,
                index === (startIndex + questionIndex) && styles.questionNavItemActive,
                selectedIndexes[startIndex + questionIndex] !== undefined && styles.questionAnswered,
              ]}
            >
               <Text style={{color: theme.colors[mode].onlyWhite}}>
                {startIndex + questionIndex + 1}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {index < data.length - 1 ? (
          <Pressable
            onPress={() => setIndex(index + 1)}
            style={[styles.navButton, { opacity: index < data.length - 1 ? 1 : 0 }]}
          >
            <AntDesign name="right" size={24} color="white" />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              if(allQuestionsAnswered) {
                console.log("Submitting Quiz...");
                setIsTimerActive(false);
                if(reference){
                  navigation.navigate('Results', { selectedAnswers: selectedIndexes , questionsData:data, topicsName:topicsName, courseName:courseName, timeElapsed: timer, reference:reference});
                }
                else{
                  alert("Please wait .");
                }
              } else {
                // Vous pouvez ici notifier l'utilisateur qu'il doit répondre à toutes les questions
                alert("Please answer all the questions before submitting.");
              }
            }}
            style={[styles.navButton, { opacity: allQuestionsAnswered ? 1 : 0.5 }]} // Change l'opacité basée sur si toutes les questions ont été répondues
            disabled={!allQuestionsAnswered} // Désactive le bouton si toutes les questions n'ont pas été répondues
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.navButtonText}>Done</Text>
              <AntDesign name="check" size={20} color="white" />
            </View>
          </Pressable>
        )}

      </View>
    </SafeAreaView>
  );
};
}


const getStyles = (mode) => StyleSheet.create({

  questionsNavBar: {
      flexDirection: 'row',
      marginVertical: 10,
      alignItems:'center',
      justifyContent:'center',
      
  },
  questionNavItem: {
      padding: 8,
      marginHorizontal: 4,
      backgroundColor: theme.colors[mode].lightBackground,
      borderRadius: 10,
  },
  questionNavItemActive: {
      backgroundColor: theme.colors[mode].primary,
  },
  questionAnswered: {
      backgroundColor: theme.colors[mode].evaluateSelection, // Style pour les questions répondues
  },
  questionNavText: {
      color:'white',
  },
  navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 10, // Ajustez en fonction de la safe area ou du design souhaité
  },
  // Les autres styles restent inchangés
  navButton: {
      backgroundColor: theme.colors[mode].primary,
      padding: 10,
      borderRadius: 5,
      minWidth: 50, // Assure que les boutons ont une largeur minimale pour l'équilibre
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal:20
  },
  navButtonText: {
      color: '#fff',
      fontSize: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight:2
  },

  EvaluateContainer:{
    flex:1,
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors[mode].white,
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors[mode].white,
  },
  animatedView: {
    backgroundColor: theme.colors[mode].white,
  },
  instructionText: {
    fontSize: 20,
    textAlign: 'center',
    color: theme.colors[mode].dark
  },
  lottieStyle: {
    width: 200,
    height: 200, // Ajustez ces dimensions selon vos besoins
  },
  preparationText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors[mode].gray
  },
  instructionView: {
    margin: 10,
    padding: 20,
    backgroundColor: theme.colors[mode].white,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Alignez le chronomètre à droite
    alignItems: 'center',
    paddingRight: 20, // Ajustez selon vos besoins pour l'espacement
    paddingTop: 10, // Ajustez selon vos besoins pour l'espacement
  },
  timer: {
    marginLeft: 8, // Espace entre l'icône et le texte
    fontSize: 18,
    color: theme.colors[mode].gray,
  },
  skipButtonContainer: {
    position: 'absolute',
    bottom: 40, // Ajustez selon l'espacement désiré du bas de l'écran
    right: 20, // Ajustez selon l'espacement désiré du côté droit de l'écran
    // Autres styles si nécessaires
  },
  
  
  
  skipButton: {
    backgroundColor: theme.colors[mode].primary,
    padding: 10, // Button padding
    borderRadius: 5, // Button border radius
    // Any other button styling
  },
  skipButtonText: {
    color: 'white', // Button text color
    textAlign: 'center', // Center-align text
    fontSize: 16, // Button text font size
    // Any other text styling
  },

});

export default EvaluateScreen;

  