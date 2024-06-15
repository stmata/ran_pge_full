import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/themeContext';
import { GlobaleStyles } from './styles/themeStyles';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import AuthProvider from 'react-auth-kit';
import createStore from 'react-auth-kit/createStore';
import withAutoLogout from './context/contextLogOut';
import refreshApi from './hooks/refreshToken';
/**
 * Entry point of the React application. Sets up global configurations and context providers.
 * 
 * Overview:
 * - Wraps the entire application with essential context providers for theme, authentication, and routing.
 * - Implements global styles, including support for dynamic theme switching.
 * - Enhances the App component with automatic logout functionality to improve security.
 * - Enables client-side routing with `BrowserRouter`.
 * - Optionally measures and logs web vitals for performance analysis.
 * 
 * Details:
 * - `AuthProvider` is configured with a custom store using cookies for persistence, enhancing security and user experience by managing authentication state across the application.
 * - `ThemeProvider` provides a centralized theme context, allowing components to adapt their styles based on the current theme (light or dark), supporting user preferences.
 * - `GlobaleStyles` injects base styles and facilitates theme-based styling adjustments, ensuring consistent aesthetics across the application.
 * - `withAutoLogout(App, 2700000)` automatically logs out the user after 1 hours of inactivity, wrapping the main App component with this security feature.
 * - `BrowserRouter` enables SPA (Single Page Application) behavior with client-side routing, improving navigation efficiency and user experience.
 * 
 * @module Entry Point
 */

const root = ReactDOM.createRoot(document.getElementById('root'));
const AppWithAutoLogout = withAutoLogout(App, 2700000); 
const store = createStore({
  authName:'_auth',
  authType:'cookie',
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === 'https:',
  refresh : refreshApi
});
root.render(
  //<React.StrictMode>
    <AuthProvider store={store}>
      <BrowserRouter>
        <ThemeProvider> 
          <GlobaleStyles/>
          <AppWithAutoLogout />
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
