import React,{useEffect,useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Share,
  Platform
} from 'react-native';
import {
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import theme  from "../theme";
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../context/ThemeContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { FileSystem } from 'expo-file-system';
import { useUpdate } from '../context/UpdateContext';
import logoImage from '../../assets/images/Logo-SKEMA-Noir.png';
const screenWidth = Dimensions.get('window').width;
const logoWidth = screenWidth * 0.3; // Exemple: 50% de la largeur de l'écran
const logoHeight = (logoWidth * 872) / 2935; // Conserver le ratio d'aspect original du logo

const CustomDrawer = (props) => {
  const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
  const mode = isDarkTheme ? 'dark' : 'light';
  const styles = getStyles(mode);
  const { navigation } = props;
  const uniqueId = uuidv4();
  const [conversations, setConversations] = useState([]);
  const serverURL = 'http://20.19.90.68:80'; 

  const [email, setEmail] = useState('');
  const [formattedName, setformattedName] = useState('');
  const { refresh } = useUpdate();
  const [profileImageUri, setProfileImageUri] = useState(null);

  useEffect(() => {
    const fetchEmailAndProfileImage = async () => {
      const profileImageUri = await SecureStore.getItemAsync('profileImage');

      if (profileImageUri) {
        setProfileImageUri(profileImageUri);
      }
    };
  
    fetchEmailAndProfileImage();
  }, [refresh]);
  

  useEffect(() => {
    fetchEmailAndConversations();
  
    // Définir un intervalle pour rafraîchir les conversations
    const interval = setInterval(() => {
      //console.log('Mise à jour des conversations...');
      fetchEmailAndConversations();
    }, 20000); // Mettre à jour toutes les 10000 millisecondes (10 secondes)
  
    // Nettoyage de l'intervalle lorsque le composant est démonté
    return () => clearInterval(interval);
  }, []);

  const fetchEmailAndConversations = async () => {
    try {
      const profileImageUri = await SecureStore.getItemAsync('profileImage');
      const userEmail = await SecureStore.getItemAsync('userEmail');
      if (userEmail) {
        const nameParts = userEmail.split('@')[0].split('.');
        const formatted = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
        setformattedName(formatted);
        setEmail(userEmail);
        loadConversations(); // Assuming userEmail can be used to fetch conversations
      } else {
        console.log("Aucun email stocké trouvé");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'email et des conversations:", error);
    }
  };

  const loadConversations = async () => {
    try {
        const userId = await SecureStore.getItemAsync('userId');
        if (!userId) {
            console.error("UserId non trouvé");
            return;
        }

        // Assurez-vous que serverURL est correctement défini pour pointer vers votre backend Flask
        const response = await fetch(`${serverURL}/users/${userId}/conversations`);
        if (!response.ok) {
            const errorBody = await response.text(); // Tentez de lire le corps de la réponse pour obtenir le message d'erreur
            console.error(`Erreur lors du chargement des conversations: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Erreur réseau: ${response.status} ${response.statusText}`);
        }
        const conversations = await response.json();
        setConversations(conversations);
    } catch (e) {
        console.error("Erreur lors du chargement des conversations", e);
    }
};



const loadMessages = async (conversationId) => {
  try {
    // Charger l'utilisateur spécifique (en supposant que vous avez déjà userId)
    const userId = await SecureStore.getItemAsync('userId'); // Assurez-vous que cela retourne une valeur

    // Modification de l'URL pour correspondre à la nouvelle route Flask
    const messagesResponse = await fetch(`${serverURL}/users/${userId}/messages?conversationId=${conversationId}`);
    const messages = await messagesResponse.json();


    return messages

  } catch (e) {
    console.error("Erreur lors du chargement des messages", e);
  }
};
  // const addNewConversation = async () => {
  //   try {
  //     // Assumons que vous avez déjà stocké userId de manière sécurisée et que vous pouvez le récupérer
  //     const userId = await SecureStore.getItemAsync('userId');
  //     if (!userId) {
  //       console.error('UserID non trouvé');
  //       return;
  //     }
  
  //     // Récupérer l'utilisateur actuel pour obtenir le tableau des conversations existantes
  //     const userResponse = await fetch(`${serverURL}/users/${userId}`);
  //     if (!userResponse.ok) {
  //       throw new Error('Erreur lors de la récupération de l\'utilisateur');
  //     }
  //     const user = await userResponse.json();
  
  //     // Vérifier si l'utilisateur a déjà des conversations, sinon initialiser à un tableau vide
  //     const existingConversations = user.conversations || [];
  //     const newConversationId = uuidv4();
  //     // Créer une nouvelle conversation
  //     const newConversation = {
  //       id: newConversationId, // Générer un nouvel ID pour la conversation
  //       title: `Chat: ${newConversationId.substring(0, 15)}...`,
  //       createdAt: new Date().toISOString(),
  //       messages: [] // Commencez avec un tableau de messages vide
  //     };
  
  //     // Ajoute la nouvelle conversation au tableau existant (ou au tableau vide initialisé)
  //     const updatedConversations = [...existingConversations, newConversation];
  
  //     // PATCH ou PUT pour soumettre l'utilisateur mis à jour
  //     await fetch(`${serverURL}/users/${userId}`, {
  //       method: 'PATCH', // Utiliser PATCH si vous ne souhaitez mettre à jour que les conversations; utiliser PUT pour remplacer l'objet utilisateur entier
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ conversations: updatedConversations }),
  //     });

  //     setConversations(updatedConversations);
  
  //     // Optionnellement, naviguer vers la nouvelle conversation
  //     navigation.navigate('Main', { screen: 'Chats', params: { selectedValue: 'Chat', conversationId: newConversation.id, newChat: true } });
  
  //   } catch (error) {
  //     console.error("Erreur lors de l'ajout de la nouvelle conversation", error);
  //   }
  // };
  
 
  const showOptions = (conversation) => {
    Alert.alert(
      "Choose an option",
      "",
      [
        {
          text: "Share",
          onPress: () => shareMessage(conversation.title, conversation.id)
        },
        { text: "Delete", onPress: () => deleteConversation(conversation.id), style: 'destructive' },
        { text: "Cancel", onPress: () => console.log("Annuler"), style: 'cancel' },
      ]
    );
  };

  const deleteConversation = async (conversationId) => {
    try {
        const userId = await SecureStore.getItemAsync('userId');
        if (!userId) {
            console.error('UserID non trouvé');
            return;
        }

        const response = await fetch(`${serverURL}/users/${userId}/conversations/${conversationId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de la conversation');
        }

        await loadConversations();
        navigation.navigate('Main', { screen: 'Chats', params: { selectedValue: 'Chat', newChatConv: true } })
        

    } catch (error) {
        console.error("Erreur lors de la suppression de la conversation", error);
    }
};


const convertChatToPDF = async (chatContent) => {

  let htmlContent = `
  <div style="padding: 20px;">
    <header style="margin-bottom: 20px;">
      <img src="${logoImage}" alt="Logo" style="width: 60px; height: 30px;">
      <hr/>
    </header>
    <main>
  `;
   htmlContent += chatContent.map(message => {
    // Formatez chaque message en HTML
    const { text, user } = message;
    return `<p style="margin: 0;"><b>${user === 0 ? 'Vous' : 'Sk'}:</b> ${text}</p>`;
  }).join('');

  htmlContent += `
    </main>
    <footer style="margin-top: 20px;">
      <hr/>
      <p>This content belongs to Skema Business School</p>
    </footer>
  </div>
  `;

  // Créer le PDF depuis le contenu HTML
  const { uri } = await Print.printToFileAsync({ html: `<html><body>${htmlContent}</body></html>` });
  return uri;
};

const shareMessage = async (title, id) => {
  try {
    const messages = await loadMessages(id);
    const fileUri = await convertChatToPDF(messages);

    // Vérifiez si le partage de fichiers est disponible
    if (!(await Sharing.isAvailableAsync())) {
      alert('Le partage n\'est pas disponible sur votre plateforme');
      return;
    }

    // Partagez le fichier PDF
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf', // Android seulement
      dialogTitle: `Partager le chat ${title}`, // Android et Web seulement
      UTI: 'com.adobe.pdf' // iOS seulement
    });
  } catch (error) {
    console.error('Erreur lors du partage des messages:', error);
  }
};
  

  return (
    <View style={{flex: 1, backgroundColor:theme.colors[mode].white}}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerContainer}>
        <Image
            source={isDarkTheme? require('../../assets/images/Logo-SKEMA-Blanc.png') : require('../../assets/images/Logo-SKEMA-Noir.png')}
            style={styles.Logo}
        />
        
        <View style={styles.newChatContainer}>
          <TouchableOpacity 
            onPress={()=>navigation.navigate('Main', { screen: 'Chats', params: { selectedValue: 'Chat', newChatConv: true } })}
            style={styles.newChatButton}>
            <Ionicons name="create-outline" size={22} color={theme.colors[mode].black} />
            <Text style={styles.newChatText}>New Chat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ChatsContainer}>
        {conversations?.map((conversation) => (
          <TouchableOpacity 
            key={conversation.id}
            onPress={() => navigation.navigate('Main', { screen: 'Chats', params: {selectedValue: 'Chat', conversationId: conversation.id, newChat: false } })}
            style={styles.ChatButton}>
            <View style={styles.ChatContent}>
              <Text style={styles.ChatText}>{conversation.title.length > 30 ? conversation.title.slice(0, 30) + '...' : conversation.title}</Text>
              <TouchableOpacity
                onPress={() => showOptions(conversation)}
                style={styles.optionsButton}>
                <Ionicons name="ellipsis-vertical" size={20} color={theme.colors[mode].black} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      </DrawerContentScrollView>

      <View style={styles.bottomDrawerSection}>
        <Image
          source={profileImageUri ? { uri: profileImageUri } : require('../../assets/images/man.png')}
          style={styles.imageStyle}
        />
        <Text style={styles.textStyle}>
          {email}
        </Text>
      </View>

    </View>
  );
};

const getStyles = (mode) => StyleSheet.create({
  drawerContainer: {
    backgroundColor: theme.colors[mode].white,
  }, 
  Logo: {
    height: logoHeight, 
    width: logoWidth, 
    alignSelf: 'center', 
    marginTop: 20, 
    marginBottom: 20, 
  },
  userName: {
    color: theme.colors[mode].black,
    fontSize: 18,
    marginBottom: 5,
  },
  newChatContainer: {
    flex: 1,
    backgroundColor: theme.colors[mode].white,
    paddingTop: 10,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors[mode].newChatButton,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 20,
  },
  newChatText: {
    fontSize: 15,
    marginLeft: 5,
    color: theme.colors[mode].black, // Couleur principale pour le texte
  },
  ChatsContainer: {
    marginTop: 10,
  },
  ChatButton: {
    backgroundColor: theme.colors[mode].white,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth:1,
    borderColor:theme.colors[mode].border,
    flexDirection: 'row', // S'assurer que le contenu est aligné horizontalement
    alignItems: 'center', // Centrer les éléments verticalement dans le bouton
  },
  
  ChatContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center', // Centrer les éléments verticalement dans leur conteneur
  },
  
  optionsButton: {
    padding: 10,
    marginLeft: 'auto', // Pousser l'icône des options à l'extrémité droite
  },  
  ChatText: {
    color: theme.colors[mode].black,
  },
  bottomDrawerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors[mode].border,
    paddingTop: Platform.OS === 'ios' ? 20 : 20, // Exemple d'ajustement conditionnel
  },
  imageStyle: {
    height: screenWidth * 0.1, // 10% de la largeur de l'écran
    width: screenWidth * 0.1, // 10% de la largeur de l'écran
    borderRadius: (screenWidth * 0.1) / 2, // Pour rendre l'image parfaitement ronde
    marginRight: 10,
  },
  textStyle: { // Assuming you add this for your text
    color: theme.colors[mode].black,
    fontSize: 12,
    marginBottom: 5,
  }

});

export default CustomDrawer;
