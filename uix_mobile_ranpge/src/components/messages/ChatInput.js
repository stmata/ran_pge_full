import React, { useState, useEffect, useRef, memo } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	Platform,
	TouchableOpacity,
	KeyboardAvoidingView,
	Keyboard, 
	Dimensions
} from "react-native";

import Animated, {
	useSharedValue,
	withSpring,
	withTiming,
	useAnimatedStyle,
	withRepeat,
	interpolate,
} from "react-native-reanimated";

import { Recording } from 'expo-av/build/Audio';

import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import { useTheme } from '../../context/ThemeContext';

import theme from "../../theme";
import { Audio } from 'expo-av';
import { collapseTopMarginForChild } from "react-native-render-html";
import { color } from "@rneui/base";
import MemoPlay from "../memos/memoPlay";

const  heightScreen = Dimensions.get('window').height;

const ChatInput = ({ reply, closeReply, isLeft, username,onSend,allreply }) => {
    const [message, setMessage] = useState("");
    const height = useSharedValue(70);
    const [isTyping, setIsTyping] = useState(false);
    const [inputHeight, setInputHeight] = useState(0);
    const { isDarkTheme } = useTheme();
    const mode = isDarkTheme ? 'dark' : 'light';
    const styles = getStyles(mode);
    const [recording, setRecording] = useState();
    //const recordingRef = useRef(new Audio.Recording());
    // animationScale = useSharedValue(0);
	const [audioMetering, setAudioMetering] = useState([]);
	const metering = useSharedValue(-100);
	const [uri, setUri] = useState(null);



	async function startRecording() {
		try {
		  setAudioMetering([]);
	
		  await Audio.requestPermissionsAsync();
		  await Audio.setAudioModeAsync({
			allowsRecordingIOS: true,
			playsInSilentModeIOS: true,
		  });
	
		  const { recording } = await Audio.Recording.createAsync(
			Audio.RecordingOptionsPresets.HIGH_QUALITY,
			undefined,
			100
		  );
		  setRecording(recording);
	
		  recording.setOnRecordingStatusUpdate((status) => {
			if (status.metering) {
			  metering.value = status.metering;
			  setAudioMetering((curVal) => [...curVal, status.metering || -100]);
			}
		  });
		} catch (err) {
		  console.error('Failed to start recording', err);
		}
	  }
	
	async function stopRecording() {
		if (!recording) {
			return;
		}

		console.log('Stopping recording..');
		setRecording(undefined);
		await recording.stopAndUnloadAsync();
		await Audio.setAudioModeAsync({
			allowsRecordingIOS: false,
		});
		const uri = recording.getURI();
		console.log('Recording stopped and stored at', uri);
		metering.value = -100;
		if (uri) {
			setUri(uri);
			//onSend({ type: 'audio', content: uri });
		}
	}


    // Ajuste la hauteur du TextInput basée sur son contenu
    const handleContentSizeChange = (event) => {
        const contentHeight = event.nativeEvent.contentSize.height;
        setInputHeight(contentHeight + 20);
    };

    // Calcule la hauteur totale du composant basée sur la présence d'une réponse et la hauteur du TextInput
    useEffect(() => {
        const baseHeight = reply ? 130 : 70;
        const totalHeight = Math.max(baseHeight, inputHeight + (reply ? 60 : 0));
        height.value = withSpring(totalHeight);
    }, [reply, inputHeight]);

	async function handlePress() {
		if (message.trim()) {
			// Concatène le message de réponse si présent
			const fullMessage = reply ? `Replying to: ${allreply}\n${message}` : message;
			onSend({ type: 'text', content: fullMessage, metering:[] });
			setMessage('');
			if (reply) closeReply(); // Ferme le reply après l'envoi
			Keyboard.dismiss();
		}
		else if (!recording) {
			await startRecording();
		}
	}

	const animatedRecordWave = useAnimatedStyle(() => {
		const size = withTiming(
		  interpolate(metering.value, [-160, -60, 0], [0, 0, -30]),
		  { duration: 100 }
		);
		return {
		  top: size,
		  bottom: size,
		  left: size,
		  right: size,
		  backgroundColor: `rgba(255, 45, 0, ${interpolate(
			metering.value,
			[-160, -60, -10],
			[0.7, 0.3, 0.7]
		  )})`,
		};
	  });
	
	  const animatedRedCircle = useAnimatedStyle(() => ({
		width: withTiming(recording ? '40%' : '40%'),
		borderRadius: withTiming(recording ? 5 : 35),
	  }));

	

	const heightAnimatedStyle = useAnimatedStyle(() => {
		return {
			height: height.value,
		}
	})

	const handleDelete = () =>{
		setUri(null);
	}

	const handleSendAudio = () =>{
		onSend({ type: 'audio', content: uri , metering: audioMetering });
		setUri(null);
	}

	// useEffect(() => {
    //     if (recording) {
    //         animationScale.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
    //     } else {
    //         animationScale.value = withTiming(1, { duration: 500 });
    //     }
    // }, [recording]);

    // const recordingAnimationStyle = useAnimatedStyle(() => {
    //     return {
    //         transform: [{ scale: animationScale.value }],
    //     };
    // });

    // useEffect(() => {
    //     return recordingRef.current ? () => {
    //         recordingRef.current.stopAndUnloadAsync();
    //     } : undefined;
    // }, []);


	

	// async function startRecording() {
	// 	Keyboard.dismiss();
	// 	try {
			
	// 	const { status } = await Audio.requestPermissionsAsync();
	// 	if (status !== 'granted') return;

	// 	await Audio.setAudioModeAsync({
	// 		allowsRecordingIOS: true,
	// 		playsInSilentModeIOS: true,
	// 	});

	// 	const recording = new Audio.Recording();
	// 	await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
	// 	recordingRef.current = recording;
	// 	await recording.startAsync();
	// 	setRecording(true);
	// 	} catch (error) {
	// 	console.error('Failed to start recording', error);
	// 	}
	// }

	// async function stopRecording() {
	// 	if (!recordingRef.current) return;
	// 	await recordingRef.current.stopAndUnloadAsync();
	// 	const uri = recordingRef.current.getURI();
	// 	recordingRef.current = null;
	// 	setRecording(false);
	// 	onSend({ type: 'audio', content: uri });
	// }

	// if(uri){
	// 	setMemo((existingMemos) => [uri, ...existingMemos]);
	// }

	

	return (
		recording ? (
		  <View style={styles.stopRecordingView}>
			<View>
				<Animated.View style={[styles.recordWave, animatedRecordWave]} />
				<TouchableOpacity onPress={stopRecording} style={styles.stopRecording}>
					<Animated.View style={[styles.redCircle, animatedRedCircle]} />
				</TouchableOpacity>
			</View>
		  </View>
		) : (
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "android" ? 100 : 0}
			>
				<Animated.View style={[styles.container, heightAnimatedStyle]}>
				{reply && (
					<View style={styles.replyContainer}>
					<TouchableOpacity onPress={closeReply} style={styles.closeReply}>
						<Icon name="close" color={theme.colors[mode].black} size={20} />
					</TouchableOpacity>
					<Text style={styles.title}>
						Response to {isLeft ? username : "Me"}
					</Text>
					<Text style={styles.reply}>{reply}</Text>
					</View>
				)}
				<View style={styles.innerContainer}>
					<View style={[styles.inputAndMicrophone, {borderColor: isTyping ? theme.colors[mode].darkGray : theme.colors[mode].gray, borderWidth: isTyping ? 0.7 : 1,}]}>
					{uri ? (
						<>
							<TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
								<Icon
									name="trash-can-outline" // Assurez-vous que c'est le bon nom d'icône pour "delete"
									size={26}
									color={theme.colors[mode].black}
									style={styles.deleteIcon}
								/>
							</TouchableOpacity>
							<MemoPlay uri={uri} metering={audioMetering}/>
							<TouchableOpacity style={styles.sendButton} onPress={handleSendAudio}>
							<Icon
								name="send"
								size={26}
								color={theme.colors[mode].black}
								style={styles.microphoneAndLock}
							/>
						</TouchableOpacity>
						</>
					) : (
						<>
						<TextInput
							multiline
							placeholder="Message Sk ..."
							placeholderTextColor={theme.colors[mode].gray}
							style={styles.input}
							value={message}
							onChangeText={setMessage}
							onFocus={() => setIsTyping(true)}
							onBlur={() => setIsTyping(false)}
							onContentSizeChange={handleContentSizeChange}
						/>
						<TouchableOpacity style={styles.sendButton} onPress={handlePress}>
							<Icon
								name={recording || !message.trim() ? "microphone" : "send"}
								size={26}
								color={theme.colors[mode].black}
								style={styles.microphoneAndLock}
							/>
						</TouchableOpacity>
						</>
					)}
					

					
					</View>
					
				</View>
			
				</Animated.View>
			</KeyboardAvoidingView>
		)
	)
	
};

const getStyles = (mode) => StyleSheet.create({
	recordingIndicator: {
        marginBottom: 20,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors[mode].primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
	stopRecordingView: {
		justifyContent: "center",
		alignItems: "center", 
		backgroundColor: theme.colors[mode].white, 
		height: heightScreen * 0.2, 
		borderTopWidth: 1, 
		borderTopColor: theme.colors[mode].darkGray,
		paddingVertical: 10,
	  },
	  stopRecording: {
		backgroundColor: theme.colors[mode].onlyWhite, // Use an accent color for the stop button
		borderWidth:1,
		borderRadius: 99, // Circular button
		width: 70, // Diameter of the circular button
		height: 70, // Diameter of the circular button
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000", // Optional: shadow for better visibility
		shadowOffset: {
		  width: 0,
		  height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5, // Android shadow
	  },
	container: {
		justifyContent: "center",
		backgroundColor: theme.colors[mode].white,
		flexGrow: 1,
	},
	replyContainer: {
		paddingHorizontal: 10,
		marginHorizontal: 10,
		justifyContent: "center",
		alignItems: "flex-start",
		backgroundColor: theme.colors[mode].white,
	},
	title: {
		marginTop: 5,
		fontWeight: "bold",
		color : theme.colors[mode].black,
	},
	closeReply: {
		position: "absolute",
		right: 10,
		top: 5,
		color: theme.colors[mode].black
	},
	reply: {
		marginTop: 5,
		color : theme.colors[mode].black,
	},
	innerContainer: {
		paddingHorizontal: 10,
		marginHorizontal: 10,
		justifyContent: "space-between",
		alignItems: "center",
		flexDirection: "row",
		paddingVertical: 10,
		flex: 1, // Assurez-vous que le conteneur peut s'étendre
	  },
	inputAndMicrophone: {
		flexDirection: "row",
		backgroundColor: "transparent",
		flex: 3,
		//marginRight: 10,
		paddingVertical: Platform.OS === "ios" ? 1 : 0,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom:15,
	},
	input: {
		flexGrow: 1, // Permet au TextInput de s'agrandir avec le contenu
  		minHeight: 35, // Hauteur minimale initiale
		backgroundColor: "transparent",
		paddingLeft: 20,
		color: theme.colors[mode].inputText,
		flex: 3,
		fontSize: 15,
		alignSelf: "center",
	},
	rightIconButtonStyle: {
		justifyContent: "center",
		alignItems: "center",
		paddingRight: 15,
		paddingLeft: 10,
		borderLeftWidth: 1,
		borderLeftColor: theme.colors[mode].white,
	},
	swipeToCancelView: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 30,
	},
	swipeText: {
		color: theme.colors[mode].description,
		fontSize: 15,
	},
	emoticonButton: {
		justifyContent: "center",
		alignItems: "center",
		paddingLeft: 10,
	},
	recordingActive: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingLeft: 10,
	},
	recordingTime: {
		color: theme.colors[mode].description,
		fontSize: 20,
		marginLeft: 5,
	},
	microphoneAndLock: {
		alignItems: "center",
		justifyContent: "flex-end",
	},
	lockView: {
		backgroundColor: "#eee",
		width: 60,
		alignItems: "center",
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		height: 130,
		paddingTop: 20,
	},
	sendButton: {
		backgroundColor: theme.colors[mode].white,
		borderRadius: 50,
		height: 50,
		width: 50,
		alignItems: "center",
		justifyContent: "center",
	},
	recordWave: {
		position: 'absolute',
		top: -20,
		bottom: -20,
		left: -20,
		right: -20,
		borderRadius: 99,
	},
	redCircle: {
		backgroundColor: theme.colors[mode].danger,
		aspectRatio: 1,
	},
	deleteButton: {
		marginRight: 10,
		marginStart: 10,
		//borderWidth:1,
		borderRadius: 25,
		backgroundColor:theme.colors[mode].danger,
		width:50,
		height:50,
		justifyContent:'center',
		alignItems:'center'
	},
	
});

export default ChatInput;
