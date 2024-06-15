
import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import VerificationCodeScreen from '../screens/VerificationCodeScreen';
import DocumentScreen from '../screens/DocumentScreen';
import TabNavigator from './TabNavigator'
import DrawerNavigator from './DrawerNavigator';
import ChapterScreen from '../screens/ChapterScreen';
import ChooseLevelScreen from '../screens/ChoiceLevelScreen'
import ChooseVoiceScreen from '../screens/ChooseVoiceScreen'
import EvaluateScreen from '../screens/EvaluateScreen';
import ResultsScreen from '../screens/ResultsScreen';
import OnboardingScreen from '../screens/OnboardingScreen'
import Contact from '../screens/ContactScreen';
const Stack = createNativeStackNavigator();

function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName='SplashScreen' screenOptions={{headerShown: false}}>
        <Stack.Screen name="SplashScreen" component={SplashScreen}  options={{gestureEnabled: false, }}/>
        <Stack.Screen name="Main" component={DrawerNavigator} options={{ headerShown: false, gestureEnabled: false, }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{gestureEnabled: false, }}/>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{gestureEnabled: false, }}/>
        <Stack.Screen name="Confirm" component={VerificationCodeScreen} options={{gestureEnabled: true, }}/>
        <Stack.Screen name="tabNavigator" component={TabNavigator} options={{gestureEnabled: false, }}/>
        <Stack.Screen name="Document" component={DocumentScreen} options={{gestureEnabled: true, }}/>
        <Stack.Screen name="chapter" component={ChapterScreen} options={{gestureEnabled: true, }}/>
        <Stack.Screen name="choiceLevel" component={ChooseLevelScreen} options={{gestureEnabled: false, }}/>
        <Stack.Screen name="ChooseVoice" component={ChooseVoiceScreen} options={{gestureEnabled: true, }}/>
        <Stack.Screen name="Evaluate" component={EvaluateScreen} options={{gestureEnabled: false, }}/>
        <Stack.Screen name="Results" component={ResultsScreen} options={{gestureEnabled: false, }}/>
        <Stack.Screen name="Contact" component={Contact} options={{gestureEnabled: true, }}/>
    </Stack.Navigator>
  );
}

export default StackNavigator;