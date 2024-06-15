import React, { useState, useEffect } from 'react';
import './Level.css';
import { useNavigate } from 'react-router-dom';
import LoginServices from '../../services/loginServices';
import { useUser } from '../../context/userContext';
import { useUserInfos } from '../../hooks/userInfos'
import { useStateGlobal } from '../../context/contextStateGlobale';

export default function Level () {
  const { setLevel } = useStateGlobal();
  const { userID } = useUser();
  const navigate = useNavigate();
  const { username } = useUserInfos();
  // State for level selection, terms acceptance
  const [selectedLevel, setSelectedLevel] = useState(""); 
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Handles level selection
  const handleLevelSelect = (level) => {
    setSelectedLevel(level); 
  };

  // Handles changes in terms and conditions checkbox
  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
  };

    /**
   * Handles the confirmation action upon selecting a level.
   * - It sends the user's selected level to the server for update via `LoginServices.updateUserLevelChoice`.
   * - On successful update, it stores the selected level and a flag indicating the presence of a level choice in `localStorage`.
   * - Finally, it navigates the user to the '/cours' route.
   */
  const handleConfirmClick = async () => {
    try {
      const response = await LoginServices.updateUserLevelChoice(userID, selectedLevel);
      if (response.success) {
        setLevel(selectedLevel)
        localStorage.setItem('existingLevel', 'true');
        navigate('/cours');
      }
    } catch (error) {
      console.error('Error updating level:', error);
    }
  };

  /**
   * Effects hook that runs on component mount to perform initial checks and setups:
   * 1. Checks if a level selection already exists in `localStorage`. If so, navigates directly to the '/cours' route.
   * 2. Fetches the user's first name from their email using `getUsername` utility function and sets it.
   * 
   * Dependencies: `auth` for user authentication details, `navigate` for redirection.
   */
  useEffect(() => {
    const existingLevel = localStorage.getItem('existingLevel');
    if (existingLevel === 'true') {
      navigate('/cours');
    }
  }, [navigate]);

  /**
   * Effects hook to smoothly scroll the window to the terms and conditions section whenever a level is selected.
   * It finds the `.terms` DOM element and uses `window.scrollTo` to scroll into view smoothly.
   * 
   * Dependency: `selectedLevel` to trigger the effect whenever the level selection changes.
   */
  useEffect(() => {
    const termsElement = document.querySelector('.terms');
    if (termsElement) {
      window.scrollTo({
        top: termsElement.offsetTop,
        behavior: 'smooth'
      });
    }
  }, [selectedLevel]);


  return (
    <div className='Level'>
      {/* Navigation bar */}
      <nav className="navbar navbar-expand-lg" style={{background: 'white', position: 'fixed', width: '100%', height: '70px', color: 'black', fontWeight: 'bold'}}>
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            <img src={require('../../assets/images/logo_noir.png')} className='logo-image-pgeNavbar' alt='logo' style={{width:'150px', height:'50px'}}/>
          </a>
        </div>
      </nav>

      {/* Welcome message */}
      <div className='welc'>
        <span>{`Hello, ${username}`}</span><br/>
        We're thrilled to have you on board. Before you dive into the learning experience,
        we need you to select your academic level. 
      </div>

      {/* Level selection options */}
      <div className='level-selection'>
        <div className={`level-option ${selectedLevel === "L3" ? "selected" : ""}`} onClick={() => handleLevelSelect("L3")}>
          <span>L3 (Licence 3)</span>
          It's the final year of the undergraduate program, focusing on deepening knowledge in business, finance, marketing, and management, with opportunities for specialization and international exchange.
        </div>
        <div className={`level-option ${selectedLevel === "M1" ? "selected" : ""}`} onClick={() => handleLevelSelect("M1")}>
          <span>M1 (Master 1)</span>
          The first year of the master's program, aimed at further specialization in areas of business and management, with a strong international dimension, including internships, practical projects, and study abroad options.
        </div>
      </div>

      {/* Terms and conditions */}
      {selectedLevel && (
        <>
          <div className='terms'>
            <h2>Terms and Conditions</h2>
            By choosing a level, you agree that:
            <ol>
              <li>The selected level will determine the courses available to you, as well as the evaluations and course chat interactions.</li>
              <li>Should you attempt to change your level at any point, please be aware that all history related to your chat interactions and evaluations will be permanently deleted. This is to ensure the integrity of your learning path and assessments.</li>
              <li>We encourage you to choose carefully and consider your current academic standing and future educational goals. Our aim is to provide you with a personalized and effective learning experience that aligns with your academic level.</li>
            </ol>
          </div>
          
          <div className='check'>
            <label className="checkbox-btn">
              <input id="checkbox" type="checkbox" onChange={handleTermsChange} />
              <span className="checkmark"></span>
              <label className='lab'>I understand that changing levels will erase all related history to safeguard the learning process. I accept these terms, considering my academic standing and goals.</label>
            </label>   
          </div>
          <br />
          <button className='shadow__btn' disabled={!selectedLevel || !termsAccepted} onClick={handleConfirmClick}>Confirm</button>
        </>
      )}
    </div>
  );
}
