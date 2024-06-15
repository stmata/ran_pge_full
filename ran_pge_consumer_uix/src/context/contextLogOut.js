import React, { useEffect } from 'react';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { useNavigate } from 'react-router-dom';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

/**
 * Enhances a React component with automatic logout functionality after a period of user inactivity.
 * @param {React.Component} WrappedComponent - The component to be enhanced with auto logout functionality.
 * @param {number} logoutTimeout - The duration of inactivity (in milliseconds) after which the user will be automatically logged out.
 * @returns {React.Component} The enhanced component with auto logout functionality.
 */
const withAutoLogout = (WrappedComponent, logoutTimeout) => {
  
  return (props) => {
    const navigate = useNavigate();
    const signOut = useSignOut();
    const auth = useAuthUser()
    useEffect(() => {
      let logoutTimer;

      const resetTimer = () => {
        clearTimeout(logoutTimer);
        logoutTimer = setTimeout(() => {
        signOut();
        localStorage.clear();
        navigate("/");
        window.history.replaceState(null, '', '/');

        }, logoutTimeout);
      };

      const handleActivity = () => {
        resetTimer(); // Réinitialiser le minuteur à chaque activité de l'utilisateur
      };

      if (auth !== null) {
        document.addEventListener('mousemove', handleActivity);
        document.addEventListener('keydown', handleActivity);
        resetTimer();
      } else {
        console.log("Le timer de déconnexion automatique est arrêté car l'utilisateur n'est pas authentifié.")
        clearTimeout(logoutTimer);
      }

      return () => {
        // Nettoyer les écouteurs d'événements lors du démontage du composant
        document.removeEventListener('mousemove', handleActivity);
        document.removeEventListener('keydown', handleActivity);
        clearTimeout(logoutTimer);
      };
    }, [navigate,signOut, auth]);

    return <WrappedComponent {...props} />;
  };
};

export default withAutoLogout;