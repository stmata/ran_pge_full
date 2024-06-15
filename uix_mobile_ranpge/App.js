
import * as React from 'react';
import Navigation from './src/navigation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { ThemeProvider } from './src/context/ThemeContext';
import { UpdateProvider } from './src/context/UpdateContext';
import { AuthProvider  } from './src/context/AuthContext';


function App() {
  return (
      <AuthProvider>
        <ActionSheetProvider>
            <ThemeProvider>
                <UpdateProvider>
                  <Navigation/>
                </UpdateProvider>
            </ThemeProvider> 
        </ActionSheetProvider>
      </AuthProvider>

  );
}

export default App;