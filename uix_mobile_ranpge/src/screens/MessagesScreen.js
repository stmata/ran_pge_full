import React, { useState,useEffect } from "react";
import { View, Text,Keyboard } from "react-native";

import ChatHeader from "../components/messages/ChatHeader";
import ChatInput from "../components/messages/ChatInput";
import MessagesList from "../components/messages/MessagesList";
import { useRoute } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

const MessagesScreen = ({ navigation}) => {
    const [messages, setMessages] = useState([]);
    const [reply, setReply] = useState("");
	const [allreply, setAllReply] = useState("");
    const [isLeft, setIsLeft] = useState();
    const route = useRoute();
    const selectedValue = route.params?.selectedValue;
	const conversationId = route.params?.conversationId;
	const newChat = route.params?.newChat;
	const newChatConv = route.params?.newChatConv;
	const [currentConversationIdd, setcurrentConversationId] = useState(conversationId);

	const serverURL = 'http://20.19.90.68:80'; 
	

    const saveMessages = async (newMessages, currentConversationId) => {

		if(!currentConversationId){
			currentConversationId = currentConversationIdd
		}

		try {
			const userId = await SecureStore.getItemAsync('userId');
			if (!userId) {
				console.error('UserID non trouvé');
				return;
			}
	
			// Envoyer une requête PUT pour mettre à jour la conversation spécifique avec les nouveaux messages
			const response = await fetch(`${serverURL}/users/${userId}/conversations/${currentConversationId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ newMessages }),
			});
	
			if (!response.ok) {
				throw new Error('Erreur lors de la mise à jour des messages');
			}
			
	
			// Traitement supplémentaire ici, si nécessaire, après la mise à jour réussie
		} catch (e) {
			console.error("Erreur lors de la sauvegarde des messages", e);
		}
	};
	
	
	

    const loadMessages = async () => {
		try {
			if(!conversationId){
				return;
			}
			// Charger l'utilisateur spécifique (en supposant que vous avez déjà userId)
			const userId = await SecureStore.getItemAsync('userId'); // Assurez-vous que cela retourne une valeur
	
			// Modification de l'URL pour correspondre à la nouvelle route Flask
			const messagesResponse = await fetch(`${serverURL}/users/${userId}/messages?conversationId=${conversationId}`);
			const messages = await messagesResponse.json();
	
			// Mettre à jour l'état avec les messages chargés
			setMessages(messages);
		} catch (e) {
			console.error("Erreur lors du chargement des messages", e);
		}
	};

    const addNewConversation = async () => {
		try {
		  const userId = await SecureStore.getItemAsync('userId');
		  if (!userId) {
			console.error('UserID non trouvé');
			return null;
		  }
	
		  
		  const response = await fetch(`${serverURL}/users/${userId}/conversations`, {
			method: 'PATCH',
			headers: {
			  'Content-Type': 'application/json',
			}		  
		});
	
		  if (!response.ok) {
			throw new Error('Erreur lors de l\'ajout de la nouvelle conversation');
		  }
	
		  const data = await response.json();
		  return data.newConversationId; // Retourne l'ID de la nouvelle conversation ajoutée
		} catch (error) {
		  console.error("Erreur lors de l'ajout de la nouvelle conversation", error);
		  return null;
		}
	};
	  
	

	useEffect(() => {
		if (newChat || newChatConv==true) {
			setMessages([]); // Initialise avec un tableau vide pour une nouvelle conversation
		} else {
			loadMessages(); // Charge les messages existants pour une conversation existante
		}
	}, [newChatConv, newChat, conversationId]); // Ajoutez newChat et conversationId ici pour réagir aux changements
	
	  

	const sendMessage = async (messageObj) => {

		const userId = await SecureStore.getItemAsync('userId');
		if (!userId) {
		  console.log('UserID non trouvé.'); // Corrected log message to reflect the missing userId
		  setIsLoading(false);
		  return;
		}
		let currentConversationId = conversationId;
		let formData = new FormData();
		

		// if (messageObj.type == 'text'){
		// 	messageText = messageObj.content
		// }
		// else{
		// 	console.log(messageObj.content)
		// 	return
		// }
		const newMessage = {
			id: uuidv4(),
			text: messageObj.content,
			user: 0,
			type: messageObj.type,
			metering: messageObj.metering,
			time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
		};
	
		// Ajoutez d'abord le message à l'état local des messages
		let updatedMessages = [...messages, newMessage];
		setMessages(updatedMessages);

		if (messageObj.type === 'audio') {
			// Obtenir les informations sur le fichier
			const fileUri = messageObj.content; // Assurez-vous que ceci est le chemin URI du fichier audio
		
			formData.append('audio', {
				uri: fileUri,
				type: 'audio/m4a', // Assurez-vous que ce type correspond au type de fichier que vous envoyez
				name: 'audiofile.m4a', // Le nom du fichier
			});
		} else {
			// Pour les messages de type texte, ajoutez le texte au formData
			formData.append('question', messageObj.content);
		}
		
		

		// Vérifie si c'est une nouvelle conversation et qu'aucun message n'a été envoyé
		if (newChatConv && messages.length === 0) {
			const newConvoId = await addNewConversation();
			if (newConvoId) {
				currentConversationId = newConvoId; 
				setcurrentConversationId(newConvoId)// Utilisez l'ID de la nouvelle conversation
			} else {
				// Gérer l'erreur si la conversation n'a pas pu être créée
				return;
			}
		}

		formData.append('chat_id', currentConversationId);
		formData.append('regenerate', false);
		formData.append('type', messageObj.type);
		formData.append('userId', userId);
		// Ajoutez ici un message temporaire pour l'animation
		const tempMessageId = uuidv4();
		const typingIndicatorMessage = {
			id: tempMessageId,
			text: "...",
			user: 1, // Ou tout autre identifiant qui représente le système ou le bot
			typingIndicator: true, // Un marqueur pour identifier facilement ce message temporaire
			time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
		};
	
		updatedMessages = [...updatedMessages, typingIndicatorMessage];
		setMessages(updatedMessages);
	
		// Votre logique existante pour envoyer le message au serveur...
		try {
			const response = await fetch('http://20.19.90.68:80/chat', {
				method: 'POST',
				body: formData,
			});
			const data = await response.json();

			if(data.answer){
				// Supprime le message temporaire
				updatedMessages = updatedMessages.filter(message => message.id !== tempMessageId);

				const audioMessageIndex = updatedMessages.findIndex(message => message.id === newMessage.id);
				if (audioMessageIndex !== -1 && messageObj.type === 'audio') {
					updatedMessages[audioMessageIndex].text = data.full_transcripts;
					updatedMessages[audioMessageIndex].type =  'text'; // Mettez à jour le texte du message avec la transcription
				}


				// Ne supprimez pas le message temporaire, ajoutez simplement la réponse du serveur
				const newReplyMessage = {
					id: uuidv4(),
					text: data.answer, // La réponse du serveur
					user: 1,
					response:true,
					nouveau:true,
					time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
				};


				updatedMessages.push(newReplyMessage);
				//updatedMessages = [...updatedMessages, newReplyMessage];
				setMessages(updatedMessages);

				const index = updatedMessages.findIndex(message => message.id === newReplyMessage.id);
				if (index !== -1) {
					updatedMessages[index].nouveau = false; // Changez new à false
				}
				// Sauvegardez les messages mis à jour
				saveMessages(updatedMessages, currentConversationId);
			}
			else{
				console.log(data)
				const newReplyMessage = {
					id: uuidv4(),
					text: 'error with a server ! please try later...', // La réponse du serveur
					user: 1,
					response:true,
					nouveau:true,
					error:true,
					time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
				};
	
				updatedMessages = updatedMessages.filter(message => message.id !== tempMessageId);
		
				updatedMessages = [...updatedMessages, newReplyMessage];
				setMessages(updatedMessages);
			}
			
		} catch (error) {
			console.error('Erreur lors de l\'envoi du message:', error);
			// Supprimez uniquement le message temporaire en cas d'erreur
			const newReplyMessage = {
				id: uuidv4(),
				text: 'error', // La réponse du serveur
				user: 1,
				response:true,
				nouveau:true,
				time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
			};

			updatedMessages = updatedMessages.filter(message => message.id !== tempMessageId);
	
			updatedMessages = [...updatedMessages, newReplyMessage];
			setMessages(updatedMessages);
		}
	};
	
	const regenerateMessage = async (messageId, messageText) => {
		const userId = await SecureStore.getItemAsync('userId');
		if (!userId) {
		  console.log('UserID non trouvé.'); // Corrected log message to reflect the missing userId
		  setIsLoading(false);
		  return;
		}
		// Clone the current messages state to avoid direct state mutation
		let updatedMessages = [...messages];
	
		// Find the index of the message to be regenerated
		const messageIndex = updatedMessages.findIndex(message => message.id === messageId);
		if (messageIndex === -1) {
			console.error('Message not found');
			return;
		}
	
		// Prepare the request body
		let formData = new FormData();
		formData.append('chat_id', conversationId);
		formData.append('regenerate', true);
		formData.append('question', `I am reaching out to you to revisit and transform the following content: ${messageText}. My goal is to leverage your current expertise and knowledge not just to renew the expression of this idea but also to enrich it. Please incorporate new perspectives or nuances that may not have been present or explicitly expressed in the original. This approach aims to offer a more profound and nuanced version of the initial message by adding additional layers of meaning, relevant contexts, or illustrative examples. The idea is not merely to paraphrase but to reconstruct the message in a way that it resonates with more strength, timeliness, or relevance within the given context.`);
		formData.append('userId', userId);
		// Show a typing indicator
		const tempMessageId = uuidv4();
		const typingIndicatorMessage = {
			id: tempMessageId,
			text: "...",
			user: 1,
			typingIndicator: true,
			time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
		};
	
		updatedMessages.splice(messageIndex + 1, 0, typingIndicatorMessage); // Insert just after the targeted message
		setMessages(updatedMessages);
	
		try {
			const response = await fetch('http://20.19.90.68:80/chat', {
				method: 'POST',
				body: formData,
			});
			const data = await response.json();
	
			// Remove the typing indicator
			updatedMessages = updatedMessages.filter(message => message.id !== tempMessageId);
	
			// Update only the last message structure
			const newVersion = {
				id: uuidv4(),
				text: data.answer,
				user: 1,
				response: true,
				nouveau: true,
				time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
			};
	
			if (!updatedMessages[messageIndex].versions) {
				updatedMessages[messageIndex].versions = [{
					id: uuidv4(),
					text: updatedMessages[messageIndex].text,
					user: 1,
					response:true,
					nouveau:false,
					time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
				}];
			}
	
			// Add the new version
			updatedMessages[messageIndex].versions.push(newVersion);
			updatedMessages[messageIndex].regenerate = true;
	
			// Now, instead of recreating the entire message structure for saving,
			// just update the relevant parts of the last message.
			const lastMessage = updatedMessages[messageIndex];
			const savedMessage = {
				id: lastMessage.id,
				versions: lastMessage.versions.map(version => ({
					id: version.id,
					text: version.text,
					user: version.user,
					response: version.response,
					nouveau: version.nouveau,
					time: version.time,
				})),
				regenerate: lastMessage.regenerate,
			};

			let filteredMessages = updatedMessages.filter((_, index) => index !== messageIndex);

			filteredMessages = [...filteredMessages, savedMessage];
	
			// Update the state with the modified message
			setMessages(filteredMessages);

			const updatedSavedMessage = {
				...savedMessage,
				versions: savedMessage.versions.map(version => ({
					...version,
					nouveau: false, // Définir nouveau à false pour toutes les versions
				})),
			};

			// Utilisez filteredMessages sans le dernier élément ajouté
			let finalMessages = filteredMessages.slice(0, -1);

			// Ajoutez updatedSavedMessage avec 'nouveau' mis à jour en false
			finalMessages = [...finalMessages, updatedSavedMessage];

			saveMessages(finalMessages, conversationId);
		} catch (error) {
			console.error('Error regenerating message:', error);
		}
	};
	
	


    const swipeToReply = (message, isLeft) => {
		setAllReply(message)
        setReply(message.length > 50 ? message.slice(0, 50) + '...' : message);
        setIsLeft(isLeft);
    };

    const closeReply = () => {
        setReply("");
    };

    return (
        <View style={{ flex: 1 }}>
            <ChatHeader
                onPress={() => {navigation.openDrawer(); Keyboard.dismiss();}}
                selectedValue={selectedValue}
            />
            <MessagesList messages={messages || []} onSwipeToReply={swipeToReply} regenerateMessage={regenerateMessage}/>
            <ChatInput reply={reply} allreply={allreply} isLeft={isLeft} closeReply={closeReply} onSend={sendMessage} username={'Sk'} />
        </View>
    );
};


export default MessagesScreen;
