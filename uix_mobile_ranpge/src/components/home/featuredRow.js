import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableWithoutFeedback,ActivityIndicator  } from 'react-native';
import theme from '../../theme';
//import { featured } from '../../constants'; // Ce doit être un tableau maintenant
import CoursCard from './coursCard';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import LottieView from "lottie-react-native";

export default function FeatureRows({ searchQuery }) {
  const [featured, setFeatured] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
  const mode = isDarkTheme ? 'dark' : 'light';
  const [evaluationsData,setEvaluationsData] = useState([])
  
  useEffect(() => {
      const fetchUserLevelAndCourses = async () => {
        setIsLoading(true);
        try {
          const level = await SecureStore.getItemAsync('levelChoice');
          if (!level) {
            console.log('Aucun niveau trouvé.');
            setIsLoading(false);
            return;
          }

          const userId = await SecureStore.getItemAsync('userId');
          if (!userId) {
            console.log('UserID non trouvé.'); // Corrected log message to reflect the missing userId
            setIsLoading(false);
            return;
          }
      
          // Assume this fetches courses
          const courseResponse = await fetch(`http://20.19.90.68:80/get_user_courses/${level}`, { method: 'POST' });
          const coursesData = await courseResponse.json();
          if(Array.isArray(coursesData)){
            setFeatured(coursesData);      
          }
          else{
            setFeatured([]); 
          }
          

          // Fetch evaluations separately
          const evalResponse = await fetch(`http://20.19.90.68:80/users/${userId}/evaluation`);
          const evaluationsData = await evalResponse.json();
          if(Array.isArray(evaluationsData)){ // Ensure it's an array
            setEvaluationsData(evaluationsData);       
          } else {
            setEvaluationsData([]); // Set to empty array in case of unexpected response type       
          }
            
        } catch (error) {
          console.error('Erreur lors de la récupération des données:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserLevelAndCourses();
  }, []); // Le tableau vide signifie que cet effet s'exécutera une fois, au montage du composant


  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors[mode].primary} />
      </View>
    );
  }

    // Function to filter courses based on the search query
 // Function to filter courses based on the search query and their status
const filteredCourses = (courses) => {
  return courses.filter(cours =>
    cours.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

  return (
    <ScrollView>
      {featured.map((feature, index) => {
        const courses = filteredCourses(feature.courses);
        
        return (
          <View key={index}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: theme.colors[mode].black }}>{feature.title}</Text>
                <Text style={{ color: theme.colors[mode].gray, fontSize: 12 }}>
                  {feature.description}
                </Text>
              </View>
            </View>

            {courses.length > 0 ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 20 }}
              >
                {courses.map(course => {
                // Directement calculer hasEvaluation ici
                //const hasEvaluation = evaluationsData.some(evaluation => evaluation.courseName === course.name);
                const hasEvaluation = true;
                console.log(course)
                return (
                  <CoursCard
                    key={course._id}
                    id={course._id}
                    imgUrl={course.image}
                    title={course.name}
                    rating={course.stars}
                    type={course.category}
                    description={course.description}
                    topics={course.topics}
                    level={feature.title}
                    module={course.name}
                    hasEvaluation={hasEvaluation} // Passer la valeur calculée
                    status={course.status}
                  />
                );
              })}


              </ScrollView>
            ) : (
              <Text style={{ textAlign: 'center', color: theme.colors[mode].gray, marginTop: 20 }}>
                No courses found with that name.
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );

}
