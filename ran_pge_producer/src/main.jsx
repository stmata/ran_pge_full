import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { SidebarProvider } from "./context/SidebarContext.jsx";
import AuthProvider from 'react-auth-kit';
import createStore from 'react-auth-kit/createStore';
import refreshApi from './hooks/refreshToken.jsx'


const store = createStore({
  authName:'_auth',
  authType:'cookie',
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === 'http:',
  refresh : refreshApi
});
ReactDOM.createRoot(document.getElementById("root")).render(
    <AuthProvider store={store}>
      <ThemeProvider>
      <SidebarProvider>
        <App />
      </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
);
