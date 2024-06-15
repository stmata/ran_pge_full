import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import Collapsible from 'react-native-collapsible';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../context/ThemeContext';
import theme from '../theme';
import { useUpdate } from '../context/UpdateContext';

const ActivitiesRoute = () => {
    const { isDarkTheme } = useTheme();
    const mode = isDarkTheme ? 'dark' : 'light';
    const [evaluationsData, setEvaluationsData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [collapsed, setCollapsed] = useState({});
    const styles = getStyles(mode);
    const {refresh } = useUpdate();
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    const fetchEvaluationsData = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://20.19.90.68:80/users/${userId}/evaluation`);
            const data = await response.json();
            const structuredData = structureData(data);
            setEvaluationsData(structuredData);
            initializeCollapsed(structuredData);
        } catch (error) {
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const structureData = (data) => {
        return data.reduce((acc, { courseName, date, note }) => {
            const [year, month, day] = date.split('-');
            if (!acc[courseName]) acc[courseName] = {};
            if (!acc[courseName][year]) acc[courseName][year] = {};
            if (!acc[courseName][year][month]) acc[courseName][year][month] = { days: [], notes: [] };
            acc[courseName][year][month].days.push(day);
            acc[courseName][year][month].notes.push(note);
            return acc;
        }, {});
    };
    

    const initializeCollapsed = (data) => {
        const initialCollapsedState = {};
        Object.keys(data).forEach(course => {
            initialCollapsedState[course] = true;
            Object.keys(data[course]).forEach(year => {
                initialCollapsedState[`${course}.${year}`] = true;
                Object.keys(data[course][year]).forEach(month => {
                    initialCollapsedState[`${course}.${year}.${month}`] = true;
                });
            });
        });
        setCollapsed(initialCollapsedState);
    };

    const toggleCollapse = (key) => {
        setCollapsed(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }));
    };

    useEffect(() => {
        (async () => {
            const userId = await SecureStore.getItemAsync('userId');
            if (userId) {
                await fetchEvaluationsData(userId);
            } else {
                setLoading(false);
                setError('UserID not found');
            }
        })();
    }, [refresh]);

    if (loading) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors[isDarkTheme ? 'dark' : 'light'].primary} />
          </View>
        );
      }
  
      if (error) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>{error}</Text>
          </View>
        );
      }
  
      // Check if evaluationsData is empty
      if (!evaluationsData) {
          return (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text>You have no evaluations at the moment.</Text>
              </View>
          );
      }

    return (
        <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', marginVertical: 20 }} >
            {Object.entries(evaluationsData).map(([courseName, years]) => (
                <View key={courseName}>
                    <TouchableOpacity onPress={() => toggleCollapse(courseName)} style={styles.buttonStyle} >
                        <Text style={{ fontWeight: 'bold', fontSize: 16, flex: 1, color:theme.colors[mode].dark }}>{courseName}</Text>
                            <Icon 
                                name={collapsed[courseName] ? "keyboard-arrow-down" : "keyboard-arrow-up"} 
                                size={24} 
                                color={theme.colors[mode].dark} 
                            />
                    </TouchableOpacity>
                    <Collapsible collapsed={collapsed[courseName]}>
                        {Object.entries(years).map(([year, months]) => (
                            <View key={year}>
                                <TouchableOpacity onPress={() => toggleCollapse(`${courseName}.${year}`)} style={[styles.buttonStyle, styles.yearButtonStyle]}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16, flex: 1, color:theme.colors[mode].dark }}>{year}</Text>
                                    <Icon 
                                        name={collapsed[`${courseName}.${year}`] ? "keyboard-arrow-down" : "keyboard-arrow-up"} 
                                        size={24} 
                                        color={theme.colors[mode].dark} 
                                    />
                                </TouchableOpacity>
                                <Collapsible collapsed={collapsed[`${courseName}.${year}`]} >
                                    {Object.entries(months).map(([month, { days, notes }]) => (

                                        <View key={month}>
                                            <TouchableOpacity onPress={() => toggleCollapse(`${courseName}.${year}.${month}`)} style={[styles.buttonStyle, styles.monthButtonStyle]}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 16, flex: 1, color:theme.colors[mode].dark }}>{monthNames[parseInt(month, 10) - 1]}</Text>
                                                <Icon 
                                                    name={collapsed[`${courseName}.${year}.${month}`] ? "keyboard-arrow-down" : "keyboard-arrow-up"} 
                                                    size={24} 
                                                    color={theme.colors[mode].dark} 
                                                />
                                            </TouchableOpacity>
                                            <Collapsible collapsed={collapsed[`${courseName}.${year}.${month}`]}>
                                            <LineChart
                                                data={{
                                                    labels: days, // Utilisez l'index comme label si vous n'avez pas de labels spécifiques
                                                    datasets: [{
                                                        data: notes.map(note => parseFloat(note)), // Assurez-vous que vos notes sont des nombres
                                                    }]
                                                }}
                                                width={Dimensions.get('window').width - 40}
                                                height={220}
                                                yAxisLabel=""
                                                yAxisSuffix="%"
                                                yAxisInterval={1}
                                                chartConfig={{
                                                    backgroundColor: theme.colors[mode].white, // Utilisez une couleur de fond appropriée pour le mode
                                                    backgroundGradientFrom: theme.colors[mode].white, // Idem pour le début du dégradé
                                                    backgroundGradientTo: theme.colors[mode].white, // Idem pour la fin du dégradé
                                                    decimalPlaces: 2, // Optionnel, par défaut à 2 décimales
                                                    color: (opacity = 1) => `rgba(${isDarkTheme ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`, // Blanc pour thème sombre, noir pour thème clair
                                                    labelColor: (opacity = 1) => `rgba(${isDarkTheme ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`, // Idem pour la couleur des étiquettes
                                                    style: {
                                                        borderRadius: 16,
                                                    },
                                                    propsForDots: {
                                                        r: '6',
                                                        strokeWidth: '2',
                                                        stroke: isDarkTheme ? '#ffa726' : '#ffa726', // Ajustez la couleur des points si nécessaire
                                                    },
                                                    propsForBackgroundLines: {
                                                        strokeDasharray: '', // Ligne pleine, adaptez selon le besoin
                                                        stroke: isDarkTheme ? '#e3e3e3' : '#e3e3e3' // Ajustez pour un look plus subtil sur fond sombre
                                                    }
                                                }}
                                                bezier
                                                style={{
                                                    marginVertical: 8,
                                                    borderRadius: 16,
                                                }}
                                            />
                                            </Collapsible>
                                        </View>
                                    ))}
                                </Collapsible>
                            </View>
                        ))}
                    </Collapsible>
                </View>
            ))}
        </ScrollView>
    );
};


const getStyles = (mode) => StyleSheet.create({
    buttonStyle: {
        flexDirection: 'row', // Permet de placer le texte et l'icône côte à côte
        justifyContent: 'space-between', // Espacement entre le texte et l'icône
        alignItems: 'center', // Centre les éléments verticalement
        padding: 10, // Ajoute un peu d'espace autour du texte et de l'icône
        borderWidth: 1, // Ajoute une bordure
        borderColor: theme.colors[mode].dark, // Couleur de la bordure
        borderRadius: 5, // Bordures arrondies
        marginBottom: 5, // Espacement en dessous du bouton
    },
    yearButtonStyle: {
        marginLeft: 10, // Décalage pour les années
    },
    monthButtonStyle: {
        marginLeft: 20, // Décalage supplémentaire pour les mois
    },
});


export default ActivitiesRoute;
