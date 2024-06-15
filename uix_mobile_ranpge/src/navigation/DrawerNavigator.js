import React from 'react';
import CustomDrawer from '../components/CustomDrawer';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MessagesScreen from '../screens/MessagesScreen'
import { Dimensions } from 'react-native';
import theme from '../theme';
import { useTheme } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
  const mode = isDarkTheme ? 'dark' : 'light';
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#aa18ea',
        drawerActiveTintColor: theme.colors[mode].white,
        drawerInactiveTintColor: '#333',
        drawerStyle: {
          width: screenWidth * 0.8, // Définir la largeur du tiroir à 80% de la largeur de l'écran
        },
      }}
    >
      <Drawer.Screen
        name="Chats"
        component={MessagesScreen}
        options={{
          swipeEnabled: false,
          headerShown: false, 
        }}
      />


    </Drawer.Navigator>
  );
}

export default DrawerNavigator;