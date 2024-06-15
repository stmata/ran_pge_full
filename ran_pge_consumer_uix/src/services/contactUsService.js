const serverUrl = process.env.REACT_APP_SERVER_URL

/**
 * MailServices module provides functions for sending emails.
 * @module MailServices
 */

const MailServices = {
    /**
     * Sends a suggestion email to the specified email address.
     * @param {string} email - The email address to send the suggestion to.
     * @param {string} name - The name of the sender.
     * @param {string} subject - The subject of the email.
     * @param {string} content - The content of the email.
     * @returns {Promise<Object>} A Promise that resolves to an object containing the response data or an error message.
     */
    async sendSuggestion(email, name, subject, content) {
        const requestData = {
            email: email,
            name: name,
            subject: subject,
            content: content
        }
        try {
            const response = await fetch( `${serverUrl}/send_ContactMail`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
              });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { error: error };
        }
      },

}

export default MailServices;
