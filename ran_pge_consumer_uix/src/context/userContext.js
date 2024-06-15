import React, { createContext, useState, useEffect, useContext } from 'react';
import CryptoJS from 'crypto-js';

/**
 * @typedef {Object} UserContextType
 * @property {string} userID - The current user's ID.
 * @property {Function} setUserID - Function to set the current user's ID.
 */

/**
 * @type {React.Context<UserContextType>}
 */
const UserContext = createContext();

// Clé secrète pour le chiffrement AES (32 bytes)
const SECRET_KEY = 'P@ssw0rd!4#MyApp&456';

/**
 * UserProvider is a context provider component that manages and persists user data, such as userID.
 * It listens for changes in the userID and updates the local storage accordingly. It also provides userID and setUserID to its child components.
 *
 * @param {object} props - The properties passed to the UserProvider component.
 * @param {React.ReactNode} props.children - The child components that the UserProvider will wrap.
 * @returns {JSX.Element} - A UserProvider component that provides the user context to its children.
 */
export const UserProvider = ({ children }) => {

    /**
     * Function to encrypt the userID using AES encryption.
     * 
     * @param {string} userID - The user ID to be encrypted.
     * @returns {string} - The encrypted user ID.
     */
    const encryptUserID = (userID) => {
        return CryptoJS.AES.encrypt(userID, SECRET_KEY).toString();
    };

    /**
     * Function to decrypt the encrypted userID using AES decryption.
     * 
     * @param {string} encryptedUserID - The encrypted user ID to be decrypted.
     * @returns {string} - The decrypted user ID.
     */
    const decryptUserID = (encryptedUserID) => {
        const bytes = CryptoJS.AES.decrypt(encryptedUserID, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    };

    const [userID, setUserID] = useState(() => {
        // Attempt to retrieve the userID from local storage, decrypting it with AES
        const encryptedUserID = localStorage.getItem('userID');
        if (encryptedUserID) {
            return decryptUserID(encryptedUserID);
        } else {
            return '';
        }
    });
    
    // Effect to store the encrypted userID in local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('userID', encryptUserID(userID));
    }, [userID]);

    return (
        <UserContext.Provider value={{ userID, setUserID }}>
            {children}
        </UserContext.Provider>
    );
};

/**
 * Custom hook to access and manipulate the user context.
 * 
 * @returns {UserContextType} The context value with the user's ID and a setter function for the ID.
 */
export const useUser = () => useContext(UserContext);

