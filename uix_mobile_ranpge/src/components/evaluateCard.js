import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import theme from '../theme';
import { useTheme } from '../context/ThemeContext';
const EvaluateCard = ({data, index, selectedIndexes, setSelectedIndexes}) => {
  const navigation = useNavigation();
  const { isDarkTheme } = useTheme(); // Utilisez le contexte du thème
  const mode = isDarkTheme ? 'dark' : 'light';
  const [shuffledOptions, setShuffledOptions] = useState([]);

  
  // Fonction de mélange de Fisher-Yates
  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;

    // Tant qu'il reste des éléments à mélanger...
    while (currentIndex !== 0) {

      // Prendre un élément restant...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // Et l'échanger avec l'élément actuel.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  };

  useEffect(() => {
    if (currentQuestion?.options && Array.isArray(currentQuestion.options)) {
      // Extraire les réponses des options
      const answers = currentQuestion.options.map(option => option.answer);
  
      // Mélanger uniquement les réponses
      const shuffledAnswers = shuffleArray(answers);
  
      // Associer les options mélangées aux réponses mélangées
      const shuffledOptionsWithAnswers = currentQuestion.options.map((option, index) => ({
        ...option,
        answer: shuffledAnswers[index],
      }));
  
      setShuffledOptions(shuffledOptionsWithAnswers);
    }
  }, [index, currentQuestion]); // Dépendance au changement d'index ou de question
  
  const currentQuestion = data[index];

  const handleSelectOption = (optionIndex) => {
    const selectedOption = {
      question: currentQuestion.question,
      selectIndex: optionIndex,
      selectedAnswer: shuffledOptions[optionIndex].answer,
    };

    setSelectedIndexes({
      ...selectedIndexes,
      [index]: selectedOption,
    });
  };
  
  


  return (
    <>
      <View
        style={{
          marginTop: 30,
          backgroundColor: theme.colors[mode].white,
          padding: 10,
          borderRadius: 6,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.colors[mode].dark }}>{currentQuestion?.question}</Text>
        <View style={{ marginTop: 12 }}>
          {shuffledOptions.map((item, optionIndex) => (
          
            <Pressable
              key={optionIndex}
              onPress={() => handleSelectOption(optionIndex)}
              style={
                selectedIndexes[index] && selectedIndexes[index].selectIndex === optionIndex ?{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 0.5,
                      borderColor: theme.colors[mode].evaluateSelection,
                      marginVertical: 10,
                      backgroundColor: theme.colors[mode].evaluateSelection,
                      borderRadius: 20,
                      flexShrink: 1,
                    }:{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 0.5,
                      borderColor: theme.colors[mode].primary,
                      marginVertical: 10,
                      borderRadius: 20,
                      flexShrink: 1
                    }
              }
            >
              {selectedIndexes[index] && selectedIndexes[index].selectIndex === optionIndex ? (
                <>
                <AntDesign
                style={{
                    borderColor: theme.colors[mode].evaluateSelection,
                    textAlign: "center",
                    borderWidth: 0.5,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    padding: 10,
                }}
                name="plus"
                size={20}
                color={theme.colors[mode].onlyWhite}
                />
                <Text style={{ marginLeft: 10 , color: theme.colors[mode].onlyWhite,flexShrink: 1}}>{item.answer}</Text>
                </>
                ) : (
                  <>
                    <Text
                    style={{
                        borderColor: theme.colors[mode].primary,
                        textAlign: "center",
                        borderWidth: 0.5,
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        padding: 10,
                        color: theme.colors[mode].dark
                    }}
                    >
                    {item.options}
                    </Text>
                    <Text style={{ marginLeft: 10 , color: theme.colors[mode].dark,flexShrink: 1}}>{item.answer}</Text>
                    </>
                )}
                
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
cardContainer: {
    marginTop: 30,
    backgroundColor: "#F0F8FF",
    padding: 10,
    borderRadius: 6,
},
questionText: {
    fontSize: 18,
    fontWeight: "bold",
},
optionsContainer: {
    marginTop: 12,
},
optionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#00FFFF",
    marginVertical: 10,
    borderRadius: 20,
},
optionSelected: {
    backgroundColor: "green",
},
optionText: {
    marginLeft: 10,
},
questionsNavBar: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems:'center',
    justifyContent:'center'
},
questionNavItem: {
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: '#eee',
    borderRadius: 10,
},
questionNavItemActive: {
    backgroundColor: '#007bff',
},
questionAnswered: {
    backgroundColor: 'green', // Style pour les questions répondues
},
questionNavText: {
    color: '#000',
},
navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
},
navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
// Les autres styles restent inchangés
navButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    minWidth: 100, // Assure que les boutons ont une largeur minimale pour l'équilibre
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal:5
},
navButtonText: {
    color: '#fff',
},
  });

export default EvaluateCard;

