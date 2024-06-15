import React, { useState, useEffect, useRef } from 'react';
import '../../assets/css/styles.css';
import {lightTheme} from '../../styles/themeStyles'
import logo from '../../assets/images/logo_noir.png';
import logoLight from '../../assets/images/Logo-SKEMA-Blanc.png'
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { useNavigate } from 'react-router-dom'; 
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { useUserInfos } from '../../hooks/userInfos'
import { useStateGlobal } from '../../context/contextStateGlobale';

/**
 * Navbar component that displays a navigation bar at the top of the application.
 * It supports dynamic theming, toggleable dropdown menus for authenticated users,
 * and basic navigation links for unauthenticated users. The navbar's appearance and
 * functionality adjust based on the user's authentication status.
 *
 * Props:
 * - theme (Object): The current theme of the application, used to determine the logo and navbar styling.
 *
 * @param {Object} props - The props object containing the theme.
 * @returns {JSX.Element} The rendered Navbar component.
 */

function Navbar({theme}) {
  /**
   * State variable to manage the dropdown menu's open/close state.
   * @type {boolean}
   */
  const [isOpen, setIsOpen] = useState(false);
  /**
   * Function to toggle the dropdown menu's open/close state.
   */
  const toggleMenu = () => setIsOpen(!isOpen);
  /**
   * Reference to the dropdown menu's DOM element, used for outside click detection.
   * @type {Object}
   */
  const dropdownRef = useRef(null);
  /**
   * Hook to get the authenticated user.
   * @type {Object|null}
   */
  const auth = useAuthUser()

  /**
   * Hook to handle the sign-out process.
   * @type {Function}
   */
  const signOut = useSignOut()
  /**
   * Hook to navigate the user after signing out.
   * @type {Function}
   */
  const navigate = useNavigate();
  /**
   * Custom hook to fetch the authenticated user's username and initials.
   * @type {Object}
   */
  const { username, initials } = useUserInfos();
  /**
   * Determines the logo to use based on the current theme.
   * @type {string}
   */
  const logoSkema = theme === lightTheme ? logo : logoLight;
  /**
   * Function to toggle the dropdown menu's open/close state.
   */
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
    /**
   * Function to handle outside clicks and close the dropdown menu if necessary.
   * @param {Event} event - The click event.
   */
  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const { level } = useStateGlobal()
  const dashboardText = level && level !== "L3" ? "Dashboard" : "Tableau de bord";
  const coursesText = level && level !== "L3" ? "Courses" : "Cours";
  const topicsText = level && level !== "L3" ? "Topics" : "Modules";
  const settingsText = level && level !== "L3" ? "Settings" : "Paramètres";
  const logOutText = level && level !== "L3" ? "Log Out" : "Déconnexion";

  /**
   * Function to handle user sign-out, clear user-specific data, and navigate to the homepage.
   */
  const logOut = () => {
    signOut();
    localStorage.clear();
    navigate("/");
    window.history.replaceState(null, '', '/');
    
}
  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  if(auth === null){
    return (
      <nav className="sk-navbar navbar fixed-top">
        <div className="sk-logoContainer">
          <img src={logo} alt="SKEMA Business School logo" />
        </div>
        <div className={`sk-navbar-links ${isOpen ? 'open' : ''}`}>
          <a href="/" className="sk-nav-link" onClick={toggleMenu}>Home</a>
          <a href="/contact" className="sk-nav-link" onClick={toggleMenu}>Contact</a>
          <a href="/login" className="sk-nav-link" onClick={toggleMenu}>Login</a>
        </div>
        <div className="sk-menu-icon" onClick={toggleMenu}>
          <div className={`sk-icon_nav ${isOpen ? 'open' : ''}`}></div>
        </div>
      </nav>
    );
  }
  else {
    return (
      <nav className='sk-navbar navbar fixed-top'>
        <div className='sk-logoContainer'>
          <img src={logoSkema} alt="MJ Store" />
        </div>
        <div className='sk-profileContainer' ref={dropdownRef}>
          <div className='sk-profile' onClick={toggleDropdown}>
            <span className='sk-initialsCircle'>{initials}</span>
            <span className='sk-profileName'>{username}</span>
          </div>
          {isOpen && (
            <div className='sk-dropdownMenu'>
              <a href="/dashboard">{dashboardText}</a>
              <a href="/cours">{coursesText}</a>
              <a href="/topics">{topicsText}</a>
              <a href="/settings">{settingsText}</a>
              <a href="/" onClick={logOut}>{logOutText}</a>
            </div>
          )}
        </div>
      </nav>
    );
  }
}

export default Navbar;
