const serverUrl = process.env.REACT_APP_SERVER_URL

/**
 * Collection of service methods for interacting with the chat API.
 * These methods facilitate creating new chats, sending questions, updating messages,
 * retrieving chat history, deleting chats, fetching chat titles, and converting text to speech.
 */

const ChatServices = {

      /**
     * Creates a new chat session for a user.
     * 
     * @param {string} userID - The ID of the user initiating the new chat.
     * @returns {Promise<{success: boolean, response: string|undefined, error: string|undefined}>} A promise that resolves to an object indicating success and containing the new conversation ID, or an error message.
     */
      async createNewChat(userID) {
        try {
            const response = await fetch(`${serverUrl}/users/${userID}/conversations`, {
                method: "PATCH"
            });
            if (!response.ok) {
                throw new Error("Failed to create new chat");
            }
    
            const data = await response.json();
            return { success: true, response: data.newConversationId };
        } catch (error) {
            //console.error("An error occurred while creating a new chat:", error.message);
            return { error: "An error occurred while creating a new conversation: " + error.message };
        }
    },

    /**
     * Sends a user's question to the server and retrieves the response.
     * 
     * @param {FormData} formData - The form data containing the user's question.
     * @returns {Promise<{success: boolean, response: string|undefined, error: string|undefined}>} A promise that resolves to an object indicating success and containing the answer, or an error message.
     */
    async sendQuestionAndGetResponse (formData, store_id) {
      try {
          const response = await fetch(`${serverUrl}/chat/${store_id}`, {
              method: "POST",
              body: JSON.stringify( formData ),
              headers: {
                "Content-Type": "application/json"
            },
          });
          if (!response.ok) {
              throw new Error("The request has timed out. Please try again later.");
          }
          const data = await response.json();
          return { success: true, response: data.answer };
      } catch (error) {
        //console.error("An error occurred while sending question and getting response:", error.message);
        return {  error: "An error occurred while sending message and getting response: " + error.message };
      }
    },

    /**
     * Updates messages within an existing chat.
     * 
     * @param {string} userID - The ID of the user.
     * @param {string} chatId - The ID of the chat to update.
     * @param {Array<Object>} messagesToUpdate - An array of messages to update the chat with.
     * @returns {Promise<{success: boolean, error: string|undefined}>} A promise that resolves to an object indicating success, or an error message.
     */
    async  updateMessagesInChat(userID, chatId, messagesToUpdate) {
      try {
          const response = await fetch(`${serverUrl}/users/${userID}/conversations/${chatId}`, {
              method: "PUT",
              body: JSON.stringify({ newMessages: messagesToUpdate }),
              headers: {
                  "Content-Type": "application/json"
              },
          });
  
          if (!response.ok) {
              throw new Error("Failed to update messages in chat");
          }
  
          const data = await response.json();
          return { success: true, response: data.success };
      } catch (error) {
          return {  error: "An error occurred while updating messages in chat: " + error.message };
      }
    },

    /**
     * Retrieves the chat history for a user.
     * 
     * @param {string} userID - The ID of the user whose chat history is to be fetched.
     * @returns {Promise<{success: boolean, response: Array<Object>|undefined, error: string|undefined}>} A promise that resolves to an object indicating success and containing the chat history, or an error message.
     */
    async retrieveChatHistory (userID) {
      try {
          const response = await fetch(`${serverUrl}/users/${userID}/conversations`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
              }
          });
  
          if (!response.ok) {
              throw new Error("Failed to fetch chats");
          }
  
          const data = await response.json();
          return { success: true, response: data };
      } catch (error) {
          //console.error("An error occurred while fetching chats:", error.message);
          return { error: "An error occurred while fetching chats:" + error.message };
      }
    },
    
    /**
     * Deletes a specific chat for a user.
     * 
     * @param {string} userID - The ID of the user.
     * @param {string} chatID - The ID of the chat to delete.
     * @returns {Promise<{success: boolean, error: string|undefined}>} A promise that resolves to an object indicating success, or an error message.
     */
    async deleteChat(userID, chatID) {
      try {
          const response = await fetch(`${serverUrl}/users/${userID}/conversations/${chatID}`, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
              }
          });
          if (!response.ok) {
              throw new Error("Failed to delete chat");
          }
          const data = await response.json();
          //console.log(data.success)
          return { success: true, response: data.success };
      } catch (error) {
          //console.error("Error deleting chat:", error.message);
          return {  error: "Error deleting chat: " + error.message };
      }
  },


     /**
     * Fetches and displays the title and conversation of a chat.
     * 
     * @param {string} userID - The ID of the user.
     * @param {string} idChat - The ID of the chat whose title and conversation are to be fetched.
     * @returns {Promise<{success: boolean, response: Object|undefined, error: string|undefined}>} A promise that resolves to an object indicating success and containing the chat data, or an error message.
     */
      async  fetchTitlesAndDisplayChat(userID, idChat) {
        try {
            const response = await fetch(`${serverUrl}/users/${userID}/messages?conversationId=${idChat}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch chat title");
            }

            const data = await response.json();
            return { success: true, response: data };
        } catch (error) {
            //console.error("An error occurred while fetching chat title:", error.message);
            return {  error: "An error occurred while fetching chat title: " + error.message };
        }
    },

     /**
     * Converts text to speech using a specified voice.
     * 
     * @param {string} text - The text to be converted to speech.
     * @param {string} voice - The voice to be used for the speech synthesis.
     * @returns {Promise<{success: boolean, response: string|undefined, error: string|undefined}>} A promise that resolves to an object indicating success and containing the URL to the generated audio, or an error message.
     */
    async Text_To_Speech(text, voice) {
        try {
          const response = await fetch(`${serverUrl}/textToSpeech`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text, voice: voice }),
          });
      
          if (response.ok) {
            const data = await response.json(); 
            if (data.audioBase64) { 
              const byteCharacters = atob(data.audioBase64); 
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers); 
              const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' }); 
              const audioBase64URL = URL.createObjectURL(audioBlob); 
              return { success: true, response: audioBase64URL };
            } else {
              throw new Error("No audio data available");
            }
          } else {
            throw new Error("Failed to get speech");
          }
        } catch (error) {
          //console.error("An error occurred while getting the speech:", error.message);
          return { success: false, error: error.message };
        }
      },
      /**
       * Sends chat data to the server for storage.
       * This function accepts optional documentName and selectedValue parameters. If provided, they specify the document and chapter for which the user wants to chat or get evaluated. If not provided, the user wants to chat or get evaluated on the general course.
       *
       * @param {string} level - The level of the document (e.g. "beginner", "intermediate", etc.)
       * @param {string} module - The name of the module of the document
       * @param {string} userId - The unique identifier of the user
       * @param {string} [topicName] - Optional. The name of the topic
       * @returns {Promise<{success: boolean, response: string|undefined, error: string|undefined}>} An object with a success property indicating whether the request was successful, and a response property containing the server's message.
       */
      async sendChatData(level, module, userId, topicName = null) {
        let requestData;
        if (topicName !== null) {
          requestData = {
            level: level,
            module: module,
            userId: userId,
            topicsName: topicName,
          };
        } else {
          requestData = {
            level: level,
            module: module,
            userId: userId,
          };
        }
        //console.log(requestData)
        try {
            const response = await fetch(`${serverUrl}/chat/noID`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
            if (!response.ok) {
              throw new Error("Failed to fetch chat title");
            }
            const data = await response.json();
            return { success: true, response: data.store_id };
        } catch (error) {
            return {  error: "Erreur lors de l'envoi des données: " + error.message };
        }
    },
      

}

export default ChatServices;
