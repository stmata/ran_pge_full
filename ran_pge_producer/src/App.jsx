import { useContext, useEffect } from "react";
import "./App.scss";
import { ThemeContext } from "./context/ThemeContext";
import { DARK_THEME, LIGHT_THEME } from "./constants/themeConstants";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MoonIcon from "./assets/icons/moon.svg";
import SunIcon from "./assets/icons/sun.svg";
import BaseLayout from "./layout/BaseLayout";
import { Dashboard, PageNotFound } from "./screens";
import StocksScreen from "./screens/Stocks/StocksScreen";
import ProcessScreen from "./screens/Process/ProcessScreen";
import Profilescreen from "./screens/profile/Profilescreen";
import CalendarScreen from "./screens/Calendar/CalendarScreen";
import Settingsscreen from "./screens/Settings/Settingsscreen";
import ActivateScreen from "./screens/activate/ActivateScreen";
import LoginScreen from "./screens/Login/LoginScreen";
import AuthOutlet from '@auth-kit/react-router/AuthOutlet'
import { UserProvider } from "./context/UserContext";

function App() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  // adding dark-mode class if the dark mode is set on to the body tag
  useEffect(() => {
    if (theme === DARK_THEME) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [theme]);

  return (
    <>
    <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route element={<AuthOutlet fallbackPath='/' />}>
              <Route element={<BaseLayout />}>
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/Stocks" element={<StocksScreen /> }/>
                <Route path="/Process" element={<ProcessScreen /> }/>
                <Route path="/Profile" element={<Profilescreen /> }/>
                <Route path="/Calendar" element={<CalendarScreen /> }/>
                <Route path="/Settings" element={<Settingsscreen /> }/>
                <Route path="/activate" element={<ActivateScreen /> }/>
              </Route>
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>

          <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
        >
          <img
            className="theme-icon"
            src={theme === LIGHT_THEME ? SunIcon : MoonIcon}
          />
        </button>
        </Router>
      </UserProvider>
    </>
  );
}

export default App;
