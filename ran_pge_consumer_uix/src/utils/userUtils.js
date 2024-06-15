/**
 * Extracts and formats a username from an email address.
 * If the email's local-part (before the '@') contains a dot ('.'), the function assumes
 * the format "firstname.lastname" and returns the lastname portion, converted to uppercase.
 * Otherwise, it returns the entire local-part in uppercase.
 * 
 * @param {string} email - The email address from which to extract the username.
 * @returns {string} The extracted username, formatted in uppercase. If the local-part
 * contains a dot, only the portion after the dot is returned.
 */
export const getUsername = (email) => {
    const parts = email.split('@');
    const usernamePart = parts[0]; 
    
    if (usernamePart.includes('.')) {
      return usernamePart.split('.')[1].toUpperCase(); 
    } else {
      return usernamePart.toUpperCase(); 
    }
};

/**
 * Generates initials from an email address by analyzing the local-part (before the '@').
 * If the local-part contains a dot ('.'), suggesting a "firstname.lastname" format,
 * it extracts and returns the first character of each part as initials in uppercase.
 * If there is no dot, it takes the first two characters of the local-part and returns them in uppercase
 * as the initials.
 * 
 * @param {string} email - The email address from which to extract initials.
 * @returns {string} The initials derived from the email address, in uppercase. If the local-part
 *                   contains a dot, the first character of each segment (before and after the dot) 
 *                   is combined and returned as initials; otherwise, the first two characters of the 
 *                   local-part are returned as initials.
 */
export const getInitials = (email) => {
    const parts = email.split('@');
    const usernamePart = parts[0];
  
    if (usernamePart.includes('.')) {
        const initials = usernamePart.split('.').map(part => part[0]).join('');
        return initials.toUpperCase();
    } else {
        return usernamePart.slice(0, 2).toUpperCase();
    }
};

