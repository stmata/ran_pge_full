
import * as React from 'react';
import StackNavigator from './StackNavigator';
import { NavigationContainer } from '@react-navigation/native';


function Navigation() {
  
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>

  );
}

export default Navigation;