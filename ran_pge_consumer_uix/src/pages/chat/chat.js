import React, { useState, useEffect, useRef } from 'react';
import PulseLoader from "react-spinners/PulseLoader";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactMarkdown from 'react-markdown';
import './chat.css';
import Logo  from '../../assets/images/logo_noir.png';
import botLogo from '../../assets/images/sk_profil.png';
import { ReactComponent as Clipboard } from '../../assets/images/clipboard.svg';
import { ReactComponent as Checkmark } from '../../assets/images/checkmark.svg';
import { ReactComponent as SpeakerPlay } from '../../assets/images/play.svg';
import { ReactComponent as SpeakerStop } from '../../assets/images/pause.svg'
import { ReactComponent as Refresh } from '../../assets/images/refresh.svg'
import { v4 as uuidv4 } from 'uuid';
import SidebarChat from './sidebarChat';
import TextareaChat from './textareaChat';
import ChatServices from '../../services/chatServices'
import { useTheme } from '../../context/themeContext';
import { useUser } from '../../context/userContext';
import { useStateGlobal } from '../../context/contextStateGlobale';
import { useUserInfos } from '../../hooks/userInfos'
import jsPDF from 'jspdf';

/**
 * Chat Component
 * 
 * Facilitates real-time chatting functionalities, including sending messages, listening for incoming messages,
 * handling chat sessions, and interacting with chat options like copying messages, changing themes, and logging out.
 * 
 * Features:
 * - Dynamically adjusts based on the application's theme.
 * - Supports text input for sending new messages.
 * - Offers functionalities to copy messages, refresh chat, and handle audio messages.
 * - Integrates with chat services for backend interactions.
 * - Utilizes a sidebar for additional chat-related actions and user settings.
 */

export default function Chat() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const {userID} = useUser()
    const { activeVector, storeID, level } = useStateGlobal();
    const { initials } = useUserInfos();
    const [loading, setLoading] = useState(false)
    const [value, setValue] = useState("");
    const [currentChatId, setcurrentChatId] = useState("")
    const [message, setMessage] = useState([]);
    const [previousChats, setPreviousChats] = useState([]);
    const [refreshChatHistory, setRefreshChatHistory] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingMessageId, setPlayingMessageId] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const audioElement = useRef(new Audio());
    const [isLoding, setisLoding] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [showSpeaker, setShowSpeaker] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [showPlay, setShowPlay] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [showPause, setShowPause] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const endOfMessagesRef = useRef(null);

    /**
     * Handles changes to the chat message input.
     * @param {Event} e - The event object from the textarea input.
     */
    const handleChangeinput = (e) => {
        setValue(e.target.value)
    };

    /**
     * Handles the submission of a new message when the Enter key is pressed.
     * @param {Event} e - The event object from the onKeyDown event.
     */
    const handlekeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault(); 
          addConversationAndMessage()
          setValue('')
        }
    };

    /**
     * Toggles the sidebar's visibility based on the current state.
     */
    const handleToggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

    /**
     * Toggles the profile dropdown's visibility based on the current state.
     */
    const handleProfileClick = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };

    /**
     * Handles clicks outside the sidebar or dropdown to close them on mobile devices.
     * @param {Event} e - The event object from the click event.
     */
  
    const handleClickOutside = (e) => {
      if (window.innerWidth <= 768 && !e.target.closest('#sidebar-container')) {
        setIsSidebarOpen(false);
        setIsDropdownOpen(false);
      }
    };

    /**
     * Copies the selected message text to the clipboard and shows a temporary indicator.
     * @param {string} text - The text of the message to be copied.
     * @param {number} index - The index of the message in the current chat session.
     */
    const handleCopy = (text, index) => {
      navigator.clipboard.writeText(text).then(() => {
          setCopiedIndex(index); // Store the index of the copied message
          setTimeout(() => {
              setCopiedIndex(null); // Reset after 2 seconds
          }, 2000);
      });
    };

    /**
     * Initiates the process to create a new chat session, clearing the current chat state.
     */
    const createNewchat = () => {
      setcurrentChatId('')
      setMessage([]);
      setValue("");
    };

    /**
       * Begins playing the audio representation of a message.
       * @param {string} messageId - The unique identifier of the message to be played.
       * @param {string} text - The text of the message to be converted to speech and played.
    */ 
    const startPlaying = (messageId, text) => {
      if (audioElement.current.src !== '') {
        audioElement.current.pause();
        audioElement.current.src = '';
        audioElement.current.load();
      }
    
      readMessage(text).then(() => {
        setIsPlaying(true);
        setPlayingMessageId(messageId);
    
        try {
          audioElement.current.play();
    
          // Add the "ended" event handler
          audioElement.current.addEventListener('ended', () => {
            setIsPlaying(false);
            setShowSpeaker(true);
            setShowPlay(true);
            setShowPause(false);
            setPlayingMessageId(null);
          });
        } catch (error) {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
          setShowSpeaker(true);
          setShowPlay(true);
          setShowPause(false);
          setPlayingMessageId(null);
          // Afficher un message d'erreur approprié
          alert('Error playing audio: No supported sources.');
        }
      });
    };
    
    

    /**
     * Stops the currently playing audio message.
    */
    const stopPlaying = () => {
      setIsPlaying(false);
      setShowSpeaker(true);
      setShowPause(false);
      setShowPlay(true);
      setPlayingMessageId(null);
      audioElement.current.pause();
    };

     /**
       * Handles the play/stop functionality for reading out chat messages.
       * @param {string} messageId - The unique identifier of the message to be read.
       * @param {string} text - The text of the message to be read.
      */
     const handleSpeakerClick = (messageId, text) => {
      setPlayingMessageId(messageId);
      setisLoding(true);
      if (!isPlaying) {
          startPlaying(messageId, text);
      } else if (!audioElement.current || !audioElement.current.paused) {
          stopPlaying();
      }
    };
  

      /**
         * Reads a given message and converts it to speech using the Text_To_Speech service.
         * @param {string} text - The message to be read and converted to speech.
         * @returns {Promise} A promise that resolves when the audio source is updated, or rejects if an error occurs.
      */
      const readMessage = async (text) => {
        try {
          // Call the Text_To_Speech function to get the audio
          const selectedVoiceId = localStorage.getItem('selectedVoiceId');
          //console.log(selectedVoiceId);
          const voiceId = selectedVoiceId ? selectedVoiceId : 'nova';
          const { success, response, error } = await ChatServices.Text_To_Speech(text, voiceId);
      
          if (success) {
            // Check if the request was successful or not
            if (response && typeof response === 'string') {
              setisLoding(false);
              setShowSpeaker(false);
              setShowPlay(false);
              setShowPause(true);
      
              // The audio is already in URL form, no need for conversion
              audioElement.current.src = response;
      
              // Return a resolved promise after updating the audio source
              return Promise.resolve();
            } else {
              throw new Error("No valid audio data received");
            }
          } else {
            throw new Error(error || "Failed to get speech");
          }
        } catch (error) {
          console.error("An error occurred while reading the message:", error.message);
          setisLoding(false);
          setShowSpeaker(false);
          setShowPlay(false);
          setShowPause(true);
        }
      };

       /**
        * Scrolls to the bottom of the page, smoothly bringing the last message into view.
       */
      const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
      };

      /**
       * Formats and serializes chat content to a string suitable for PDF conversion.
       * This function takes an array of chat message objects and formats them into
       * a single string, distinguishing messages sent by the user and by SkemaGPT.
       * 
       * @param {Array} chatContent - An array of chat message objects to be formatted.
       * Each object should contain a `text` field for the message content and a `user`
       * field indicating who sent the message (e.g., user = 0 for the actual user,
       * user = 1 for SkemaGPT).
       * 
       * @returns {string} A formatted string of chat messages, where each message is
       * separated by two newline characters and prefixed with the sender's identifier
       * ("you" for the user and "SkemaGPT" for SkemaGPT's responses).
       */
      const convertChatToPDF = (chatContent) => {
        const formattedMessages = chatContent.map(message => {
          // Extract text and user from each message object
          const { text, user } = message;
          // Prefix each message with the sender's identifier
          const formattedMessage = user === 0 ? `you: ${text}` : `SkemaGPT: ${text}`;
          return formattedMessage;
        });
      
        // Join all formatted messages into a single string, separated by double newlines
        return formattedMessages.join('\n\n');
      };


      /**
       * Converts the current chat session to a JSON string representation, then formats and outputs 
       * the conversation into a PDF file, which is automatically downloaded with the specified file name.
       * Utilizes the jsPDF library to create and manipulate the PDF document.
       *
       * @param {Array} chatContent - The content of the current chat session, expected to be an array 
       * of message objects. Each object in the array represents a single message in the chat, containing
       * necessary details such as the sender, message text, etc.
       * @param {string} fileName - The desired file name for the downloaded PDF file. The '.pdf' extension 
       * is automatically appended to this file name during the download process.
       *
       * This function first calls `convertChatToJSON` to format the chat content into a string suitable for
       * PDF conversion. It then calculates the necessary layout for the PDF, including handling page breaks
       * and ensuring text is wrapped correctly within the document's margins. Finally, it triggers the browser
       * to download the generated PDF file with the chat content.
       */
      const downloadChatAsPDF = (chatContent, fileName, logoImage) => {
        const formattedStr = convertChatToPDF(chatContent);
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
     
        const margin = 20;
        const lineHeight = 8; // Réduire l'espace entre les lignes
        const maxLineWidth = pageWidth - 2 * margin;
     
        const logoWidth = 30;
        const logoHeight = 15;
        const footerMargin = 20;
     
        const addHeader = (pageNumber) => {
          if (pageNumber === 1) {
            // Add logo to the top left corner
            doc.addImage(logoImage, 'JPEG', margin, margin, logoWidth, logoHeight);
     
            // Add powered by iA text to the top right corner
            doc.setFontSize(10);
            doc.setTextColor(0);
           
     
            // Draw horizontal line below the header
            doc.setDrawColor(0);
            doc.setLineWidth(0.3);
            doc.line(margin, margin + logoHeight + 5, pageWidth - margin, margin + logoHeight + 5);
          } else {
            // Add logo to the top left corner for other pages
            doc.addImage(logoImage, 'JPEG', margin, margin, logoWidth, logoHeight);
          }
        };
     
        const addFooter = (pageNumber) => {
          const footerText = 'This content belongs to Skema Business School';
     
          if (pageNumber === 1) {
            // Draw horizontal line above the footer for the first page
            doc.line(margin, pageHeight - footerMargin, pageWidth - margin, pageHeight - footerMargin);
     
            // Add footer text centered below the line for the first page
            doc.setFontSize(10);
            doc.setTextColor(0);
            const footerTextWidth = doc.getStringUnitWidth(footerText) * doc.getFontSize() / doc.internal.scaleFactor;
            const footerTextX = (pageWidth - footerTextWidth) / 2;
            doc.text(footerTextX, pageHeight - footerMargin + 5, footerText, { align: 'center' });
          } else {
            // Add footer text left aligned for other pages
            doc.setFontSize(8);
            doc.setTextColor(0);
            doc.text(margin, pageHeight - footerMargin + 5, footerText);
          }
        };
     
        // Reset text properties for the document
        doc.setFontSize(12);
        doc.setTextColor(0);
 
             
        // Add header to the first page
        addHeader(1);
     
        // Split the formatted chat string into lines that fit within the page width
        const lines = doc.splitTextToSize(formattedStr, maxLineWidth);
        let y = margin + logoHeight + 15; // Ajouter une marge supplémentaire entre la barre et le premier message
     
        for (let i = 0; i < lines.length; i++) {
          if (y + lineHeight > pageHeight - footerMargin - 10) {
            doc.addPage();
            addHeader(doc.internal.getNumberOfPages());
            y = margin + logoHeight + 15; // Ajouter une marge supplémentaire entre la barre et le premier message sur les autres pages
          }
          doc.text(margin, y, lines[i]);
          y += lineHeight;
        }
     
        // Add footer to the last page
        addFooter(doc.internal.getNumberOfPages());
     
        // Add footer to the first page if there is only one page
        if (doc.internal.getNumberOfPages() === 1) {
          addFooter(1);
        }
     
        doc.save(`${fileName}.pdf`);
      };


      /**
         * Deletes a chat with the given ID from both client and server.
         * @param {string} id_chat - The ID of the chat to delete.
      */
      const DeleteHistory = async (id_chat) => {
        try {
          // Delete the chat history on the client-side
          setPreviousChats(prevChats => prevChats.filter(chat => chat.id !== id_chat));

          // Call the API to delete the chat on the server-side
            // eslint-disable-next-line no-unused-vars
          const { success, data } = await ChatServices.deleteChat(userID, id_chat);

          if (success) {
            //console.log('Chat deleted successfully:', data);
            setRefreshChatHistory(true);
          }
        } catch (error) {
          console.error('Error deleting chat:', error);
        }
      };

      /**
         * Displays a Sweet Alert dialog with options to delete or share a chat.
         * @param {string} id_chat - The ID of the chat to delete or share.
      */
      const showChatOptions = (id_chat) => {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
          },
      });
        // Display the Sweet Alert dialog with delete, share, and cancel buttons
        Swal.fire({
          title: "Please select the desired option, please!",
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: "Delete",
          denyButtonText: "Save",
          cancelButtonText: "Cancel"
        }).then((result) => {
          // Handle the selected option
          if (result.isConfirmed) {
            // Delete the chat history and create a new chat
            DeleteHistory(id_chat);
            createNewchat();
            Toast.fire({
              icon: 'success',
              title: 'Deleted.'
          })
          } else if (result.isDenied) {
            // Share the chat as a PDF file and create a new chat
            createNewchat();
            downloadChatAsPDF(message, 'chat-content', Logo);
            Toast.fire({
              icon: 'success',
              title: 'Saved as PDF File!'
          })
          }
        });
      };

      /**
         * Displays the current conversation of a chat by fetching the chat history from the server.
         * @param {string} idChat - The ID of the chat to display the conversation for.
      */
      const handleClickHistory = async (idChat) => {
        setcurrentChatId(idChat);

        try {
          // Fetch the chat history from the server
          const { success, response, error } = await ChatServices.fetchTitlesAndDisplayChat(userID, idChat);

          if (success) {
            //console.log('Messages retrieved successfully:', response);
            setMessage(response);
          } else {
            console.error('Failed to retrieve messages:', error);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      
      /**
       * Adds a conversation and message to the list of messages.
       * This function handles the process of adding a new message to the chat interface,
       * sending it to the server, receiving the server's response, and updating the chat accordingly.
       * @async
       * @function addConversationAndMessage
       * @returns {Promise<void>}
       */
      const addConversationAndMessage = async () => {
        // If the input value is empty, no action is taken
        if (!value.trim()) return;

        // Initialize variables and state
        let textinput = value;
        setValue("");
        

        try {
          let chatId = currentChatId;
          let messagesToUpdate = [];
          setLoading(true);
          // Create a new conversation if the current chat ID is empty
          if (!currentChatId) {
            const createChatResponse = await ChatServices.createNewChat(userID);
            if (!createChatResponse.success) {
              throw new Error(createChatResponse.error);
            }
            chatId = createChatResponse.response; // Update the current conversation ID
            setcurrentChatId(chatId);
          }

          // Prepare the new message to send
          const newMessage = {
            id: uuidv4(),
            text: textinput,
            user: 0, // User
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          // Add the new message to the list of messages
          setMessage(prevMessages => [...prevMessages, newMessage]);

          let payload = {
            chat_id: chatId,
            regenerate: false,
            type: 'text',
            userId: userID,
            question: textinput,
            level: level};

          // Send the question to the server and receive the response
          const sendQuestionResponse = await ChatServices.sendQuestionAndGetResponse(payload, storeID);
          if (!sendQuestionResponse.success) {
            throw new Error(sendQuestionResponse.error);
          }
          setLoading(false);
          // Prepare the received response for display
          const newReplyMessage = {
            id: uuidv4(),
            text: sendQuestionResponse.response, // Using the 'response' property of the response
            user: 1, // Server
            nouveau: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          // Add the response to the list of messages
          setMessage(prevMessages => [...prevMessages, newReplyMessage]);

          // Update the messages in the conversation
          messagesToUpdate = [...message, newMessage, newReplyMessage];
          const updateResponse = await ChatServices.updateMessagesInChat(userID, chatId, messagesToUpdate);

          // Check if updating the messages in the conversation was successful
          if (!updateResponse.success) {
            throw new Error(updateResponse.error);
          }

          //console.log(updateResponse);
        } catch (error) {
          console.error("An error occurred:", error.message);
          // Update the state with the error message
          setMessage(prevMessages => [...prevMessages, { id: uuidv4(), text: error.message, user: 1 }]);
        } finally {
          setLoading(false);
          setRefreshChatHistory(true);
        }
      };


      /**
       * Refreshes the bot's response for a particular message.
       * This function handles the process of regenerating the bot's response for a given message,
       * updating the chat interface, and sending the request to the server for the updated response.
       * @async
       * @function resfreshAnswerBot
       * @param {string} messageIdToRegenerate - The ID of the message whose bot response needs to be regenerated.
       * @returns {Promise<void>}
       */
      const resfreshAnswerBot = async (messageIdToRegenerate) => {
        setLoading(true);

        try {

            // Find the bot message that needs to be regenerated
            const originalBotMessageIndex = message.findIndex(m => m.id === messageIdToRegenerate);
            if (originalBotMessageIndex === -1) {
                throw new Error('Original message not found.');
            }

            // Extract the original message
            const originalBotMessage = message[originalBotMessageIndex];

            // Check if the versions array exists, if not, create it
            if (!originalBotMessage.versions) {
                originalBotMessage.versions = [];
            }

            // Append data to the form to be sent
            let payload = {
              chat_id: currentChatId,
              regenerate: true,
              type: 'text',
              userId: userID,
              question: `I am reaching out to you to revisit and transform the following content: ${originalBotMessage.text}. My goal is to leverage your current expertise and knowledge not just to renew the expression of this idea but also to enrich it. Please incorporate new perspectives or nuances that may not have been present or explicitly expressed in the original. This approach aims to offer a more profound and nuanced version of the initial message by adding additional layers of meaning, relevant contexts, or illustrative examples. The idea is not merely to paraphrase but to reconstruct the message in a way that it resonates with more strength, timeliness, or relevance within the given context.`
            };

            if (level === "L3") {
              payload = {
                chat_id: currentChatId,
                regenerate: true,
                type: 'text',
                userId: userID,
                question: `Je vous contacte pour revisiter et transformer le contenu suivant : ${originalBotMessage.text}. Mon objectif est d'utiliser votre expertise et vos connaissances actuelles non seulement pour renouveler l'expression de cette idée, mais aussi pour l'enrichir. Veuillez incorporer de nouvelles perspectives ou nuances qui n'étaient peut-être pas présentes ou explicitement exprimées dans l'original. Cette approche vise à offrir une version plus profonde et nuancée du message initial en ajoutant des couches supplémentaires de sens, des contextes pertinents ou des exemples illustratifs. L'idée n'est pas simplement de paraphraser, mais de reconstruire le message de manière à ce qu'il résonne avec plus de force, de pertinence ou de modernité dans le contexte donné.
                `
              };
            }
            // Send the request to the server to regenerate the message
            const sendQuestionResponse = await ChatServices.sendQuestionAndGetResponse(payload, storeID);
            //console.log(sendQuestionResponse)
            if (!sendQuestionResponse.success) {
                throw new Error(sendQuestionResponse.error);
            }

            // Add the original bot message to the versions array with a new ID
            originalBotMessage.versions.unshift({
                id: uuidv4(), // Generate a new unique ID for the original message
                text: originalBotMessage.text,
                user: originalBotMessage.user,
                nouveau: originalBotMessage.nouveau,
                time: originalBotMessage.time,
                response: originalBotMessage.response
            });

            // Add the regenerated message to the versions array using the original message ID
            originalBotMessage.versions.push({
                id: messageIdToRegenerate, // Keep the original ID for the regenerated message
                text: sendQuestionResponse.response,
                user: originalBotMessage.user,
                nouveau: true, // Assuming this indicates the message has been regenerated
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                response: originalBotMessage.response
            });

            // The text of the original message is now in versions, so we remove it from the original message
            delete originalBotMessage.user;
            delete originalBotMessage.nouveau;
            delete originalBotMessage.time;
            delete originalBotMessage.text;

            // Update the state with the modified messages array
            setMessage(prevMessages => {
                const newMessages = [...prevMessages];
                newMessages[originalBotMessageIndex] = originalBotMessage; // Update the message in the array
                return newMessages;
            });

            // Update the messages in the conversation on the server
            const updateResponse = await ChatServices.updateMessagesInChat(userID, currentChatId, message);
            if (!updateResponse.success) {
                throw new Error(updateResponse.error);
            }

            //console.log(updateResponse);
        } catch (error) {
            console.error("An error occurred:", error.message);
            setMessage(prevMessages => [...prevMessages, { id: uuidv4(), text: error.message, user: 1 }]);
        } finally {
            setLoading(false);
            //console.log(message);
        }
      };

    


      /**
       * Finds the index of the last bot message in the message array.
      */
      const lastBotMessageIndex = message.findLastIndex((msg) => msg.user !== 0);

      /**
       * Manages sidebar behavior based on window resize events.
       * If the window width is greater than 768 pixels and the sidebar is open,
       * it ensures the sidebar remains open. Otherwise, it closes the sidebar.
       * @function handleResize
       * @returns {void}
       */
      const handleResize = () => {
        if (window.innerWidth > 768 && isSidebarOpen) {
          setIsSidebarOpen(true); // Ensure the sidebar remains open for wider screens
        } else {
          setIsSidebarOpen(false); // Close the sidebar for narrower screens
        }
      };

      /**
       * Adds a resize event listener to the window to track changes in window size.
       * Updates the sidebar state based on window width and sidebar open status.
       * @function useEffect
       * @param {boolean} isSidebarOpen - Indicates if the sidebar is currently open or closed.
       * @returns {void}
       */
      useEffect(() => {
        window.addEventListener('resize', handleResize); // Add resize event listener
        return () => window.removeEventListener('resize', handleResize); // Remove event listener on component unmount
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isSidebarOpen]); // Trigger effect when 'isSidebarOpen' state changes

    
      /**
       * Sets the document title and checks for necessary data from the global context when the component mounts.
       * If required data is missing in the global context, it redirects the user to the chapters page.
       * @function useEffect
       * @returns {void}
       */
      useEffect(() => {
        // Set the document title
        document.title = 'RAN PGE - CHAT';

        try {
            // Check if activeVector is available in the global context
            if (!activeVector) {
                throw new Error("Error: Vector is not active");
            }
        } catch (error) {
            console.error("Error in useEffect:", error.message);
            navigate('/topics'); // Redirect to the chapters page in case of error
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []); // Run this effect only once when the component mounts


    
      /**
       * Fetches chat history data when the component mounts or when the userID or currentChatId changes.
       * Retrieves chat history data from the server using the provided userID.
       * Updates the state with the retrieved chat history.
       * @function useEffect
       * @param {string} userID - The unique identifier of the user.
       * @param {string} currentChatId - The ID of the current chat.
       * @returns {void}
       */
      useEffect(() => {
        /**
         * Fetches chat history data from the server.
         * @async
         * @function fetchData
         * @returns {Promise<void>}
         */
        const fetchData = async () => {
          try {
            // Retrieve chat history data from the server
            const { success, response, error } = await ChatServices.retrieveChatHistory(userID);
            if (success) {
              // Update the state with the retrieved chat history
              setPreviousChats(response);
              setRefreshChatHistory(false);
            } else {
              console.error('Failed to retrieve chat history:', error);
            }
          } catch (error) {
            console.error('Error fetching chat history:', error);
          }
        };

        // Fetch chat history data when the component mounts or when userID or currentChatId changes
        fetchData();
      }, [userID, currentChatId, refreshChatHistory]);

      /**
         * Scrolls to the bottom of the message container whenever the 'message' state changes.
         * Ensures that the message container is scrolled to the bottom to display the latest messages.
         * @function useEffect
         * @param {Function} scrollToBottom - Function to scroll to the bottom of the message container.
         * @param {Array} message - The array of messages displayed in the chat.
         * @returns {void}
         */
      useEffect(scrollToBottom, [message]);


    
    
      return (
        <div id="app" onClick={handleClickOutside} className={isSidebarOpen ? 'sidebar-open' : ''}>
          {/* Votre Sidebar existante */}
          {isSidebarOpen && window.innerWidth <= 768 && (
                <div id="overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <SidebarChat
                isSidebarOpen={isSidebarOpen}
                previousChats={previousChats}
                createNewchat={createNewchat}
                handleClickHistory={handleClickHistory}
                showChatOptions={showChatOptions}
                handleProfileClick={handleProfileClick}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
                handleToggleSidebar={handleToggleSidebar}
                theme={theme}
                level={level}
            />
          {/* Zone de Chat */}
          <div id="content">
            <div className="sk-messages">
            {message.length > 0 ?
        message.map((msg, index) => (
            <div key={index} className={`sk-message ${msg.user === 0 ? 'sk-user' : 'sk-bot'}`}>
                {msg.user === 0 ? (
                    <div className="profile-initials sk-avatar">{initials}</div>
                ) : (
                    <img src={botLogo} alt="Bot logo" className="sk-avatar" />
                )}
                {msg.type === 'audio' && msg.full_transcripts ? (
                    <ReactMarkdown className="sk-message-content" >{msg.full_transcripts}</ReactMarkdown>
                ) : (
                    <ReactMarkdown className="sk-message-content" >{msg.versions && msg.versions.length ? msg.versions[msg.versions.length - 1].text : msg.text}</ReactMarkdown>
                )}
                {msg.user !== 0 && (
                    <div className="sk-message-icons">
                        {isLoding && playingMessageId === msg.id ? (
                            <PulseLoader color="#36D7B7" loading={isLoding} size={10} />
                        ) : playingMessageId === msg.id ? (
                            <div className='sk-icon-speaker-stop'>
                                <SpeakerStop className="sk-icon" onClick={stopPlaying} />
                            </div>
                        ) : (
                            <div className='sk-icon-speaker-play'>
                                <SpeakerPlay className="sk-icon" onClick={() => handleSpeakerClick(msg.id, msg.versions && msg.versions.length ? msg.versions[msg.versions.length - 1].text : msg.text)} />
                            </div>
                        )}

                        {msg.versions && msg.versions.length ? (
                            // Si des versions existent, afficher la dernière version
                            <>
                                {copiedIndex === index ? (
                                    <div className='sk-icon-chekmark'>
                                        <Checkmark className='sk-icon'/>
                                    </div>
                                ) :
                                <div className='sk-icon-clipboard'>
                                    <Clipboard className="sk-icon" onClick={() => handleCopy(msg.versions[msg.versions.length - 1].text, index)} />
                                </div>
                                }
                            </>
                        ) : (
                            // Sinon, afficher le texte du message
                            <>
                                {copiedIndex === index ? (
                                    <div className='sk-icon-chekmark'>
                                        <Checkmark className='sk-icon'/>
                                    </div>
                                ) :
                                <div className='sk-icon-clipboard'>
                                    <Clipboard className="sk-icon" onClick={() => handleCopy(msg.text, index)} />
                                </div>
                                }
                            </>
                        )}

                        {/* La partie de rafraîchissement reste inchangée */}
                        {lastBotMessageIndex === index && (
                            <div className='sk-icon-refresh'>
                                <Refresh className="sk-icon" onClick={() => resfreshAnswerBot(msg.id)} />
                            </div>
                        )}
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>
        ))
    : (
        <div className='sk-message-welcome'>
            How can I help you today ?
        </div>
    )}
    {loading && (
        <PulseLoader color="#36D7B7" loading={loading} size={10} />
    )}
                </div>
            <center>
            <TextareaChat
                    value={value}
                    onChange={handleChangeinput}
                    onkeyDown={handlekeyDown}
                    addConversationAndMessage={addConversationAndMessage}
                />
            </center>
          </div>
        </div>
      );
      
};
