import React, {useRef, useEffect} from 'react';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import logo from '../../assets/images/logo_noir.png';
import logoLight from '../../assets/images/Logo-SKEMA-Blanc.png'
import {lightTheme} from '../../styles/themeStyles'
import { useUserInfos } from '../../hooks/userInfos'

/**
 * SidebarChat Component
 * 
 * A sidebar component for the Chat feature of the application. It serves multiple purposes,
 * including displaying the user's chat history, providing a button to start new chats, showing
 * user profile information, and offering a logout option.
 * 
 * Props:
 * - isSidebarOpen: Boolean indicating whether the sidebar is open or closed.
 * - previousChats: Array of objects representing previous chat sessions.
 * - createNewChat: Function to initiate a new chat session.
 * - handleClickHistory: Function to handle clicks on a chat item in the chat history, typically
 *   for opening that chat session.
 * - showChatOptions: Function to show options for a particular chat session (e.g., delete, archive).
 * - handleProfileClick: Function to handle clicks on the user's profile section.
 * - isDropdownOpen: Boolean indicating whether the profile options dropdown is open or closed.
 * - setIsDropdownOpen: Function to change the state of the profile options dropdown. It controls whether the dropdown is displayed or hidden. 
 *   This function updates the isDropdownOpen boolean state, allowing for dynamic interaction with the dropdown menu in the user interface
 * - handleToggleSidebar: Function to toggle the sidebar's open/closed state.
 * - theme: The current theme setting of the application, used to determine which logo (light or dark) to display.
 * 
 * Features:
 * - Dynamic theme handling with a conditional rendering of the logo based on the current theme.
 * - Utilizes the `useUserInfos` hook to display the user's initials and username in the sidebar.
 * - Provides a structured layout for chat history, dynamically rendered based on `previousChats` prop.
 * - Includes a dedicated button for creating new chat sessions.
 * - Features a clickable user profile section that can trigger a dropdown menu with additional options.
 * - Integrates a logout functionality that clears relevant localStorage items and uses `useSignOut` from
 *   `react-auth-kit` to properly sign the user out.
 * - Offers a compact mode by toggling the `isSidebarOpen` state, allowing users to maximize screen real estate
 *   for chat content.
 * - Employs a `ref` to manage interactions with the profile dropdown menu, ensuring proper UI behavior.
 * 
 * This component is designed to enhance the chat interface by providing easy access to essential features
 * and user-specific information, maintaining a user-friendly and interactive environment.
 */


const SidebarChat = ({
    isSidebarOpen,
    previousChats,
    createNewchat,
    handleClickHistory,
    showChatOptions,
    handleProfileClick,
    isDropdownOpen,
    setIsDropdownOpen,
    handleToggleSidebar,
    theme,
    level
}) => {
    const logoSkema = theme === lightTheme ? logo : logoLight;
    const { username, initials } = useUserInfos();
    const signOut = useSignOut();
    const dropdownRef = useRef(null);
    const profileContainerRef = useRef(null);
    const logOut = () => {

        signOut();
        localStorage.clear();
        window.history.replaceState(null, '', '/');
      }

      
    /**
        * Handles clicks outside the profile options dropdown to close it.
        * @param {Event} e - The event object representing the mouse click.
     */
    const handleOutsideClick = (e) => {
        // Check if the click occurred outside the dropdown and profile container
        if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !profileContainerRef.current.contains(e.target)) {
        // Close the dropdown if it is open
        setIsDropdownOpen(false);
        }
    };

    /**
         * Truncates a title string to a specific length or until the first occurrence of an ampersand ('&').
         * @param {string} title - The title string to truncate.
         * @returns {string} The truncated title string.
      */
      const truncateTitle = (title) => {
          let truncatedTitle = title;
          if (title.startsWith('"')) {
            truncatedTitle = title.substring(1);
        }
        if (truncatedTitle.length >= 19) {
            return truncatedTitle.substring(0, 19) + ' ...';
        } else {
            return truncatedTitle.substring(0, 19);
        }
    };

    const dashboardText = level && level !== "L3" ? "Dashboard" : "Tableau de bord";
    const coursesText = level && level !== "L3" ? "Courses" : "Cours";
    const topicsText = level && level !== "L3" ? "Topics" : "Modules";
    const settingsText = level && level !== "L3" ? "Settings" : "Paramètres";
    const logOutText = level && level !== "L3" ? "Log Out" : "Déconnexion";

    /**
     * Adds an event listener to handle clicks outside the profile options dropdown and removes it on component unmount.
     */
    useEffect(() => {
      // Add event listener to handle clicks outside the dropdown
      document.addEventListener('mousedown', handleOutsideClick);
    
      // Clean up the event listener on unmount
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
      
    return (
        <div id="sidebar-container" className={isSidebarOpen ? '' : 'closed'}>
            <div id="sidebar">
                <div className="sidebar-header">
                    <img src={logoSkema} alt="Logo" className="sidebar-logo" />
                    <button onClick={createNewchat} className="add-chat-button">New Chat</button>
                </div>
                <div className="chat-history">
                    {[...previousChats]?.reverse().map((prevChats, index) => (
                        <div key={index} className="chat-item" onClick={() => handleClickHistory(prevChats.id)}>
                            <span className="chat-title">{truncateTitle(prevChats.title)}</span>
                            <div className='options-icon'>
                                <i className="fa fa-ellipsis-h" onClick={(e) => {
                                    e.stopPropagation(); // Prevent sidebar from closing when clicking on the options icon
                                    showChatOptions(prevChats.id);
                                }}></i>        
                            </div>
                        </div>
                    ))}
                </div>
                <div className="sidebar-bottom">
                    <div className="profile-container" ref={profileContainerRef} onClick={handleProfileClick}>
                        <div className="profile-initials">{initials}</div>
                        <div className="profile-name">{username}</div>
                    </div>
                    {isDropdownOpen && (
                        <div className="profile-dropdown-menu" ref={dropdownRef}>
                            <a href="/dashboard">{dashboardText}</a>
                            <a href="/cours">{coursesText}</a>
                            <a href="/topics">{topicsText}</a>
                            <a href="/settings">{settingsText}</a>
                            <a href="/" onClick={logOut}>{logOutText}</a>
                        </div>
                    )}
                </div>
            </div>
            <button id="toggle-button" aria-label="Toggle sidebar" onClick={handleToggleSidebar}>
                <span className="toggle-icon"></span>
            </button>
        </div>
    );
};

export default SidebarChat;

