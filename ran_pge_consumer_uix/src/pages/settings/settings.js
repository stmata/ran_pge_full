import React from 'react';
import VoiceSelector from './voiceSelector';
import Header from '../../components/header/privateHeader';
import { useTheme } from "../../context/themeContext"
import { darkTheme, lightTheme } from '../../styles/themeStyles'
import { useStateGlobal } from '../../context/contextStateGlobale';

/**
 * Settings component for customizing user experience within the application.
 * It allows users to switch between light and dark themes, and select a voice for text-to-speech functionality.
 */
const Settings = () => {
  // Utilizes the theme context to access and manipulate the current theme and level.
  const { theme, setTheme } = useTheme();
  const { level, setLevel, setCoursSelected, setTopics, setCours, setTopicSelected,setActiveVector, setCoursDescription, setStoreID, setEvaluationInitial,setUserEvaluationInitial, setGlobalEvaluationEnabled } = useStateGlobal();

  /**
   * Toggles the application's theme between light and dark.
   * The function reads the current theme and switches it to the opposite theme.
   */
  const handleThemeChange = () => {
    setTheme(currentTheme => currentTheme.name === 'light' ? darkTheme : lightTheme);
  };

  /**
    *  Handles the change of the selected level.
    *  When called, it toggles between the available levels ('L3' and 'M1').
    *  If the current level is 'L3', it changes it to 'M1', and vice versa.
    *  Also, it resets the local storage as the change in level requires clearing certain stored data.
    */   
    const handleLevelChange = () => {
      setCours([])
      setCoursDescription("")
      setCoursSelected("")
      setTopics([])
      setTopicSelected("")
      setActiveVector(false)
      setStoreID("")
      setEvaluationInitial([])
      setGlobalEvaluationEnabled(false)
      setUserEvaluationInitial(false)
      setLevel(prevLevel => {
        //console.log('Selected level:', prevLevel === 'L3' ? 'M1' : 'L3');
        const newLevel = prevLevel === 'L3' ? 'M1' : 'L3';
        return newLevel;
      });
    };
    
  
  const themeLabel = level !== "L3" ? "Choose your theme" : "Choisissez votre thème";
  const levelLabel = level !== "L3" ? "Change your Level" : "Changez de niveau";
  const title = level !== "L3" ? "Customize your experience by choosing the voice and theme that best suit your preferences." : "Personnalisez votre expérience en choisissant la voix et le thème qui correspondent le mieux à vos préférences.";

  return (
    <div className="sk-body-private">
      {/* Header component displaying the page title. */}
      <Header title={title}/>
      <section className="mt-2">
        <div className="container">
          <div className="row box-container">
            {/* Theme selection section */}
            <div className="col-md-4 col-12 mb-4">
                <h2 className='title-theme'>{themeLabel}</h2>
                  <input id="switch" type="checkbox"  
                    className="theme-checkbox" 
                    defaultChecked={theme === darkTheme} 
                    onClick={handleThemeChange}
                    onChange={() => {}} // Added an empty onChange attribute to remove the warning
                  />
                    <div className="app">
                      <div className="body">
                        <div className="phone">
                          <div className="content">
                            <div className="circle">
                              <div className="crescent"></div>
                            </div>
                            <label className='labelTheme' htmlFor="switch">
                              <div className="toggle"></div>
                              <div className="names">
                                <p className="light">Light</p>
                                <p className="dark">Dark</p>
                              </div>
                            </label>
                            {/* Level selection section */}
                            <div>
                              <h2 className='title-theme'>{levelLabel}</h2>
                              <input id="level-switch" type="checkbox" 
                              className="level-checkbox" 
                              checked={level === 'M1'} 
                              onClick={handleLevelChange}
                              onChange={() => {}} // Added an empty onChange attribute to remove the warning
                              />
                              <label className="labelLevel" htmlFor="level-switch">
                                <div className="toggleLevel" ></div>
                                <div className="namesLevel">
                                  <p className={level === 'L3' ? "L3 selected" : "L3"}>L3</p>
                                  <p className={level === 'M1' ? "M1 selected" : "M1"}>M1</p>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
            </div>
            {/* Voice selection section */}
            <div className="col-md-8 col-12">
              <VoiceSelector level={level} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
