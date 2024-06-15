import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { FlingGestureHandler, Directions, State, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useAnimatedGestureHandler, useSharedValue, withSpring,withRepeat,withTiming  } from "react-native-reanimated";
import  theme from "../../theme";
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { useTheme } from '../../context/ThemeContext';
import { WebView } from 'react-native-webview';
import MathView, { MathText } from 'react-native-math-view';
import { err } from "react-native-svg";
import MemoPlay from "../memos/memoRegister";
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import SoundPlay from "../memos/soundPlay";
import * as SecureStore from 'expo-secure-store';
import { useUpdate } from '../../context/UpdateContext';

const screenWidth = Dimensions.get('window').width;
const logoWidth = screenWidth * 0.095; // Exemple: 50% de la largeur de l'écran
const logoHeight = (logoWidth * 872) / 2935; // Conserver le ratio d'aspect original du logo


const Message = ({id, time, isLeft, message, onSwipe,typingIndicator,response , nouveau, regenerateMessage, error, type, metering, isLastMessage }) => {
	const [progressiveMessage, setProgressiveMessage] = useState("");
	const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
	const mode = isDarkTheme ? 'dark' : 'light';
	const styles = getStyles(mode);
	const [isLoading, setIsLoading] = useState(false);
	const startingPosition = 0;
	const x = useSharedValue(startingPosition);
	const opacity = useSharedValue(1);
	const [modalVisible, setModalVisible] = useState(false);
	const [uri, setUri] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0);
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

	// Détecte si 'message' est un tableau pour gérer les multiples versions
	const isMessageArray = Array.isArray(message);
	// Conditionnellement définir le contenu du message basé sur s'il s'agit d'un tableau
	const messageContent = isMessageArray ? message[currentIndex].text : message;
	// console.log(message)

	const animatedStyles = useAnimatedStyle(() => {
		return {
		opacity: opacity.value,
		};
	});


	useEffect(() => {
		// Condition ajustée pour activer l'effet d'écriture pour les messages de réponse marqués comme nouveaux
		if (response && nouveau ) {
		  setProgressiveMessage(""); // Réinitialise le message progressif
		  const length = messageContent.length;
		  let index = 0;
		  const intervalId = setInterval(() => {
			if (index < length) {
			  setProgressiveMessage((prev) => prev + messageContent.charAt(index));
			  index++;
			} else {
			  clearInterval(intervalId);
			}
		  }, 15); // Ajustez la vitesse d'ajout de caractère en millisecondes selon le besoin
	
		  return () => clearInterval(intervalId);
		} else {
		  // Affiche directement le message si non applicable à l'effet d'écriture
		  setProgressiveMessage(messageContent);
		}
	  }, [messageContent, response, nouveau,metering]);

	useEffect(() => {
		if (typingIndicator) {
		// Démarre l'animation si typingIndicator est true
		opacity.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
		} else {
		// Réinitialise l'opacité si typingIndicator est false
		opacity.value = 1;
		}
	}, [typingIndicator, opacity]);

	
	const isOnLeft = (type) => {
		if (isLeft && type === "messageContainer") {
			return {
				alignSelf: "flex-start",
				backgroundColor: theme.colors[mode].searchBackground,
				borderTopLeftRadius: 0,
			};
		} else if (isLeft && type === "message") {
			return {
				color: error ? theme.colors[mode].danger : theme.colors.dark.white,
			};
		} else if (isLeft && type === "time") {
			return {
				color: "darkgray",
			};
		} else {
			return {
				borderTopRightRadius: 0,
			};
		}
	};

	const eventHandler = useAnimatedGestureHandler({
		onActive: (event, ctx) => {
		x.value = isLeft ? 50 : -50;
		},
		onEnd: (event, ctx) => {
		x.value = withSpring(startingPosition);
		},
	});

	const uas = useAnimatedStyle(() => {
		return {
		flexDirection: isLeft ? 'row' : 'row-reverse', // Ajuste la direction du flex pour l'alignement
		transform: [{ translateX: x.value }],
		};
	});

	const getPhotoStyle = (isLeft) => {
		if (isLeft) {
		return [
			styles.Logo,
			{
				width: 35, // Ajustez selon le besoin
				height: 35, // Ajustez selon le besoin
				borderRadius: 20, // Ajustez pour des coins arrondis
				//alignSelf: 'center', // Centre l'image verticalement dans le conteneur
				marginVertical: -5,
				marginHorizontal: 0.5,
			}
		];
		} else {
		return [
			styles.photo,
			{
			width: 40, // Ajustez selon le besoin
			height: 40, // Ajustez selon le besoin
			borderRadius: 20, // Ajustez pour des coins arrondis
			//alignSelf: 'center', // Centre l'image verticalement dans le conteneur
			marginVertical: -5,
			marginHorizontal: 0.5,	
			}
		];
		}
	};

	const isReplyingTo = progressiveMessage.startsWith("Replying to:");
	let introMessage = "";
	let mainMessage = progressiveMessage;

	if (isReplyingTo) {
		const splitIndex = progressiveMessage.indexOf("\n"); // Trouve l'indice du premier saut de ligne
		let introPart = progressiveMessage.substring(0, splitIndex).replace("Replying to:", "").trim();
		introMessage = introPart.length > 50 ? introPart.slice(0, 50) + '...' : introPart
		mainMessage = progressiveMessage.substring(splitIndex + 1); // Le reste est le corps principal du message
	}

	const iconContainerStyle = isLeft ? styles.iconContainerLeft : styles.iconContainerRight;

	// Fonction pour copier le texte dans le presse-papiers
	const copyToClipboard = (text) => {
		// Utiliser Clipboard de 'react-native' ou 'expo-clipboard' selon votre setup
		Clipboard.setString(text);
		Alert.alert("Copié dans le presse-papiers !");
	};

	async function fetchAndPlayAudio(message) {
		let voice = await SecureStore.getItemAsync('voice');
		if(!voice){
			voice = 'nova';
		}
		setIsLoading(true);
		try {
			const response = await fetch('https://ran-pge-api-consumer-v2-6f938655e551.herokuapp.com/textToSpeech', {
				method: 'POST',
				headers: {
				'Content-Type': 'application/json',
				},
				body: JSON.stringify({ text: message, voice:voice }),
			});
			const jsonResponse = await response.json();
			const audioBase64 = jsonResponse.audioBase64;
		
			const uri = FileSystem.cacheDirectory + 'audio.mp3';
			await FileSystem.writeAsStringAsync(uri, audioBase64, { encoding: FileSystem.EncodingType.Base64 });

			setUri(uri)
			setIsLoading(false);
			
			setIsLoading(false);
		} catch (error) {
			console.error("Erreur lors de la lecture de l'audio:", error);
			setIsLoading(false);
		}
	}
	  
	
	const readMessageAloud = (message) => {
		setModalVisible(true);
		fetchAndPlayAudio(message);
	};

	const goToPrevious = () => {
		setCurrentIndex(current => Math.max(0, current - 1));
	  };
	
	  // Fonction pour naviguer vers le message suivant
	  const goToNext = () => {
		if(isMessageArray) {
		  setCurrentIndex(current => Math.min(message.length - 1, current + 1));
		}
	  };


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlingGestureHandler
        direction={isLeft ? Directions.RIGHT : Directions.LEFT}
        onGestureEvent={eventHandler}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.ACTIVE) {
            onSwipe(messageContent, isLeft);
          }
        }}
      >
		{ 
		type === 'audio' ? (
			<Animated.View style={[styles.container, uas]}>
				<Image
					source={profileImageUri ? { uri: profileImageUri } : require('../../../assets/images/man.png')}
					style={getPhotoStyle(isLeft)}
					onError={(e) => console.log("Error loading image", e.nativeEvent.error)}
				/>
				<View style={[styles.messageContainer, isOnLeft("messageContainer")]}>
					<MemoPlay uri={mainMessage} metering={metering}/>
					<View style={styles.timeView}>
						<Text style={[styles.time, isOnLeft("time")]}>
							{time}
						</Text>
					</View>
				</View>
			</Animated.View>
			) :(
        <Animated.View style={[styles.container, uas]}>
          {/* Condition pour afficher l'image à gauche ou à droite du message */}
          {isLeft ? (
            <Image
              source={require('../../../assets/images/favico.png')}
              style={getPhotoStyle(isLeft)}
              onError={(e) => console.log("Error loading image", e.nativeEvent.error)}
            />
          ) : (
            <Image
			  source={profileImageUri ? { uri: profileImageUri } : require('../../../assets/images/man.png')}
              style={getPhotoStyle(isLeft)}
              onError={(e) => console.log("Error loading image", e.nativeEvent.error)}
            />
          )}
		  
          {isReplyingTo ? (
			<View style={styles.contentContainer}>
				{isReplyingTo && (
				<View style={styles.replyingToContainer}>
					<Text style={[styles.replyingToText, isOnLeft("message")]}>
					{introMessage}
					</Text>
				</View>
				)}
				<View style={[styles.messageContainer, isOnLeft("messageContainer")]}>
					<View style={styles.messageView}>

						{typingIndicator ? (
							<Animated.Text style={[styles.typingIndicator, animatedStyles]}>
							{messageContent}
							</Animated.Text>
						) : (
							<Text style={[styles.message, isOnLeft("message")]}>
							{mainMessage}
							</Text>
						)}
					</View>
					<View style={styles.timeView}>
						<Text style={[styles.time, isOnLeft("time")]}>
							{time}
						</Text>
					</View>
				</View>
				<View style={iconContainerStyle}>
					<TouchableOpacity style={styles.iconStyle} onPress={() => copyToClipboard(message)}>
						<Icon name="content-copy" size={16} color="gray" />
					</TouchableOpacity>
					{isLeft && (
					<TouchableOpacity style={styles.iconStyle}  onPress={() =>  regenerateMessage(id ,message)}>
						<Icon name="refresh" size={16} color="gray" />
					</TouchableOpacity>
					)}
					<TouchableOpacity style={styles.iconStyle} onPress={() => readMessageAloud(message)}>
						<Icon name={"volume-up"} size={16} color="gray" />
					</TouchableOpacity>

				</View>
			</View>
			) : (
			<View style={styles.contentNotContainer}>
					<View style={[styles.messageContainer, isOnLeft("messageContainer")]}>
						<View style={styles.messageView}>
							{typingIndicator ? (
								<Animated.Text style={[styles.typingIndicator, animatedStyles]}>
								{messageContent}
								</Animated.Text>
							) :  (isLeft?(
								<MathText
									value={messageContent}
									direction="ltr"
									style={[styles.message, isOnLeft("message")]}
								/>):(
									<Text style={[styles.message, isOnLeft("message")]}>{mainMessage}</Text>
								)
							)} 
						</View>

						<View style={styles.timeView}>
							<Text style={[styles.time, isOnLeft("time")]}>
							{time}
							</Text>
						</View>
					
					</View>
			{type !== 'audio' && !typingIndicator? (
			<View style={iconContainerStyle}>
				{isMessageArray && (
					<View style={styles.navigationContainer}>
					  <TouchableOpacity onPress={goToPrevious} disabled={currentIndex === 0} style={styles.iconStyle}>
						<Icon name="chevron-left" size={20} color={currentIndex === 0 ? "grey" : "black"} />
					  </TouchableOpacity>
					  <Text style={styles.navigationText}>
						{`${currentIndex + 1}/${message.length}`}
					  </Text>
					  <TouchableOpacity onPress={goToNext} disabled={currentIndex === message.length - 1} style={styles.iconStyle}>
						<Icon name="chevron-right" size={20} color={currentIndex === message.length - 1 ? "grey" : "black"} />
					  </TouchableOpacity>
					</View>
				  )}
				<TouchableOpacity style={styles.iconStyle} onPress={() => copyToClipboard(messageContent)}>
					<Icon name="content-copy" size={18} color="gray" />
				</TouchableOpacity>
				{isLeft && isLastMessage && (
					<TouchableOpacity style={styles.iconStyle}  onPress={() => regenerateMessage(id,messageContent)}>
						<Icon name="refresh" size={18} color="gray" />
					</TouchableOpacity>
				)}
				<TouchableOpacity style={styles.iconStyle} onPress={() => readMessageAloud(messageContent)}>
					<Icon name={"volume-up"} size={18} color="gray" />
				</TouchableOpacity>
				
				  
			


				
			</View>
			 ) : null}

			
		</View>
			)}
			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => {
					Alert.alert("Modal has been closed.");
					setModalVisible(!modalVisible);
				}}
				>
				<View style={styles.centeredView}>
				<View style={styles.modalView}>
					{isLoading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="small" color={theme.colors[mode].gray} />
						<TouchableOpacity
							style={[styles.button, styles.buttonClose]}
							onPress={() => setModalVisible(false)}
						>
						<Icon name="close" size={24} color={theme.colors[mode].gray} /> 
						</TouchableOpacity>
					</View>

					) : (
						<SoundPlay uri={uri} setModalVisible={setModalVisible} />
					)}
				</View>
				</View>
			</Modal>

        </Animated.View>
		)}
      </FlingGestureHandler>
    </GestureHandlerRootView>

	
	);
};


const getStyles = (mode) => StyleSheet.create({
	container: {
		paddingVertical: 10,
		marginVertical: 5,
	},
	webViewStyle: {
		height: 200, // Ou toute autre hauteur appropriée
		width: 500,
		backgroundColor: theme.colors[mode].searchBackground,
		maxWidth: "80%",
		alignSelf: "flex-end",
		flexDirection: "row",
		borderRadius: 15,
		paddingHorizontal: 10,
		marginHorizontal: 10,
		paddingTop: 5,
		paddingBottom: 10,
	},
	  
	messageContainer: {
		backgroundColor: theme.colors[mode].primary,
		maxWidth: "80%",
		alignSelf: "flex-end",
		flexDirection: "row",
		borderRadius: 15,
		paddingHorizontal: 10,
		marginHorizontal: 10,
		paddingTop: 5,
		paddingBottom: 10,
		
	},
	messageView: {
		backgroundColor: "transparent",
		maxWidth: "84%",
	},
	timeView: {
		backgroundColor: "transparent",
		justifyContent: "flex-end",
		paddingLeft: 10,
	},
	message: {
		color: "white",
		alignSelf: "flex-start",
		fontSize: 15,
	},
	time: {
		color: "lightgray",
		alignSelf: "flex-end",
		fontSize: 10,
	},
	photo: {
		width: 40, // Ajustez selon le besoin
		height: 40, // Ajustez selon le besoin
	},
	Logo: {
		height: logoHeight, 
		width: logoWidth, 
	},
	typingContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginVertical: 10,
	},
		typingMessage: {
		color: theme.colors[mode].black,
		fontStyle: 'italic',
	},
	contentContainer: {
		flex:1,
	},
	replyingToContainer: {
		backgroundColor: theme.colors[mode].searchBackground,
		maxWidth: "75%",
		alignSelf: "flex-end",
		flexDirection: "row",
		borderRadius: 15,
		backgroundColor: "#ECECEC",
		paddingLeft: 14,
		paddingRight: 18,
		paddingTop: 6,
		paddingBottom: 6,
		borderTopLeftRadius: 14,
		borderTopRightRadius: 14,
		borderBottomLeftRadius: 14,
		borderBottomRightRadius: 14,
		// Ajustements pour renforcer l'effet de superposition
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 }, // Ajuster pour que l'ombre soit un peu plus prononcée
		shadowOpacity: 0.2, // Légèrement plus d'opacité pour une ombre plus visible
		shadowRadius: 4, // Un rayon d'ombre légèrement plus grand
		elevation: 4, // Augmenter l'elevation pour Android
	
		zIndex: 1, // S'assure que le conteneur de réponse est visuellement au-dessus
	},
	
	replyingToText: {
		fontStyle: "italic",
		color: "grey",
	// Autres styles pour le texte de réponse
	},
	// Définissez deux nouveaux styles dans votre objet StyleSheet pour gérer l'alignement des icônes
	iconContainerLeft: {
		flexDirection: 'row',
		justifyContent: 'flex-start', // Alignez les icônes à gauche pour les messages à gauche
		marginTop: 5,
		paddingLeft: 20,

	},
	
	iconContainerRight: {
		flexDirection: 'row',
		justifyContent: 'flex-end', // Alignez les icônes à droite pour les messages à droite
		marginTop: 5,
		paddingRight: 20,
	},
	contentNotContainer:{
		flex:1,
	},
	iconStyle: {
		marginHorizontal: 3, // Ajoute un espace horizontal de 5 entre chaque icône
  	},
	// Mise à jour dans getStyles
	loadingContainer: {
		flexDirection: 'row', // Organise les enfants horizontalement
		alignItems: 'center', // Alignement vertical au centre
		justifyContent: 'space-between', // Répartit l'espace également entre les enfants
		width: '100%', // S'étend sur toute la largeur
		paddingHorizontal: 20, // Ajustez selon vos besoins pour l'espacement des côtés
	},
  
	buttonClose: {
		position: 'absolute', // Positionnement absolu pour le placer sur le côté droit
		right: 20, // Ajustez selon le besoin pour le placement à droite
		top: 20, // Ajustez selon le besoin pour le placement en haut
	},
	
	buttonClose: {
		backgroundColor: "transparent",
	},
	centeredView: {
		flex: 1,
		justifyContent: "flex-start", // Aligner le contenu en haut
		alignItems: "center",
		paddingTop: 60, // Ajuste selon le besoin pour l'espacement en haut

	},
	modalView: {
		flexDirection: 'row', // Organise les enfants horizontalement
		alignItems: 'center', // Centre les éléments verticalement dans le conteneur
		justifyContent: 'space-between', // Répartit l'espace uniformément entre les enfants
		width: '70%', // Utilisez toute la largeur disponible
		paddingHorizontal: 20, // Ajuste selon le besoin
		paddingTop: 22, // Ajuste selon le besoin pour l'espacement en haut
		paddingBottom: 20, // Ajuste selon le besoin
		backgroundColor: "white",
		borderRadius:25,
		shadowColor: "#000",
		shadowOffset: {
		width: 0,
		height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		backgroundColor: theme.colors[mode].white,

	},
	navigationContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	  },
	  navigationText: {
		fontSize: 12, // Ajustez selon le besoin
		paddingHorizontal: 2, // Espace autour du texte
	  },
	
	
	
  
});

export default Message;