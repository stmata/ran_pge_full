const serverUrl = process.env.REACT_APP_SERVER_URL
/**
 * Collection of service methods related to user authentication and account management.
 * Includes functionalities such as sending verification emails, verifying user codes,
 * and updating user's academic level choice.
 */

const LoginServices = {

    /**
     * Sends a verification email to the specified email address.
     * This method handles the communication with the server to trigger the sending of a verification email.
     * 
     * @param {string} email - The email address to which the verification email is sent.
     * @returns {Promise<{success: boolean, data: Object|undefined, error: string|undefined}>} A promise resolving to an object indicating the success status along with data or an error message.
     */
    async sendVerificationEmail(email) {
        try {
          const response = await fetch( `${serverUrl}/send_verifyMail `, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });
      
          const json = await response.json();
          if (response.ok) {
            return { success: true, data: json };
          } else {
            const errorMessage = json.error || json.message || "Une erreur inconnue est survenue.";
            return { success: false, error: errorMessage };
          }
        } catch (error) {
          return { success: false, error: 'Error sending verification code or checking email' };
        }
      },

      /**
     * Verifies the code sent to the user's email against the one provided by the user.
     * This method validates the verification code by communicating with the server, ensuring the code matches the one sent to the user's email.
     * 
     * @param {string} email - The email address of the user.
     * @param {string} code - The verification code to be validated.
     * @returns {Promise<{success: boolean, data: Object|undefined, error: string|undefined}>} A promise resolving to an object indicating the success status along with data or an error message.
     */
      async verifyCode(email, code) {
        try {
          const response = await fetch(`${serverUrl}/verify_code`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              code,
            }),
          });
          const json = await response.json();
          //console.log(json)
          return { success: true, data: json };
        } catch (error) {
          return { success: false, error: 'Erreur lors de la vérification du code' };
        }
      },

      /**
     * Updates the user's chosen academic level in the database.
     * This method communicates with the server to update the user's academic level choice based on the provided level.
     * 
     * @param {string} userId - The ID of the user whose level choice is being updated.
     * @param {string} level - The new academic level chosen by the user.
     * @returns {Promise<{success: boolean, data: Object|undefined, error: string|undefined}>} A promise resolving to an object indicating the success status along with updated data or an error message.
     */
      async updateUserLevelChoice(userId, level) {
        try {
          const response = await fetch(`${serverUrl}/user/${userId}/choiceLevel`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              level,
            }),
          });
          const json = await response.json();
          if (response.ok) {
            return { success: true, data: json };
          } else {
            return {error: 'Erreur lors de la mise a jour du level' };
          }
        } catch (error) {
          return { error: `Erreur lors de la récupération ou de la comparaison du code ${error}` };
        }
      }
}

export default LoginServices;
