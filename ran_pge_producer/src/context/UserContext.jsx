import React, { createContext, useState, useEffect, useContext } from 'react';
import CryptoJS from 'crypto-js';

const UserContext = createContext();

const SECRET_KEY = 'P@ssw0rd!4#MyApp&456';

export const UserProvider = ({ children }) => {
    const encryptUserID = (userID) => {
        return CryptoJS.AES.encrypt(userID, SECRET_KEY).toString();
    };

    const decryptUserID = (encryptedUserID) => {
        const bytes = CryptoJS.AES.decrypt(encryptedUserID, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    };

    const [userID, setUserID] = useState(() => {
        const encryptedUserID = localStorage.getItem('userID');
        if (encryptedUserID) {
            return decryptUserID(encryptedUserID);
        } else {
            return '';
        }
    });

    const [superUser, setSuperUser] = useState(() => {
        const superUserValue = localStorage.getItem('superUser');
        if (superUserValue) {
            return JSON.parse(superUserValue);
        } else {
            return false;
        }
    });

    useEffect(() => {
        localStorage.setItem('userID', encryptUserID(userID));
    }, [userID]);

    useEffect(() => {
        localStorage.setItem('superUser', JSON.stringify(superUser));
    }, [superUser]);

    return (
        <UserContext.Provider value={{ userID, setUserID, superUser, setSuperUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
