import React, { useState, useEffect, useRef } from "react";
import { ScrollView, View, Text, StyleSheet, Image, Dimensions } from "react-native";
import Message from "./Message";
import theme from "../../theme";
import { useTheme } from '../../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;
const logoWidth = screenWidth * 0.12; // Exemple: 50% de la largeur de l'écran
const logoHeight = (logoWidth * 32) / 32; // Conserver le ratio d'aspect original du logo
const MessagesList = ({ onSwipeToReply, messages, regenerateMessage  }) => {
    const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
    const mode = isDarkTheme ? 'dark' : 'light';
    const styles = getStyles(mode);
    const scrollViewRef = useRef();
    const isEmpty = !messages || messages.length === 0;

    useEffect(() => {
        // S'assurer que le ScrollView défile vers le bas chaque fois que les messages sont mis à jour
        if (!isEmpty) {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]); // Dépendance aux messages pour déclencher le défilement

    // Si newChat est true et messages est vide, affichez le logo au milieu
    if (isEmpty) {
        return (
            <View style={styles.centered}>
                <Image
                    source={require("../../../assets/images/favico.png")} // Assurez-vous que le chemin d'accès est correct
                    style={styles.logo}
                />
                <Text style={styles.helpText}>How can I help you today?</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.scrollViewStyle}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            keyboardDismissMode="on-drag"
        >
            {messages.map((message, index) => {
                
                // Déterminer le contenu du message en fonction de la présence de versions régénérées
                const messageContent = message.regenerate ? message.versions : message.text; // Texte original du message
                const isLastMessage = index === messages.length - 1;
                return (
                    <Message
                        key={index}
                        time={message.time}
                        isLeft={message.user !== 0}
                        message={messageContent}
                        onSwipe={onSwipeToReply}
                        typingIndicator={!!message.typingIndicator}
                        response={!!message.response}
                        nouveau={!!message.nouveau}
                        regenerateMessage={regenerateMessage}
                        error={!!message.error}
                        type={message.type}
                        metering={message.metering}
                        id={message.id}
                        isLastMessage={isLastMessage} 
                    />
                );
            })}
        </ScrollView>
    );
};

const getStyles = (mode) => StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors[mode].white,
    },
    logo: {
        width: logoWidth, // Ajustez selon la taille de votre logo
        height: logoHeight, // Ajustez selon la taille de votre logo
        marginBottom: 20,
    },
    helpText: {
        fontSize: 20,
        color: theme.colors[mode].black,
        fontStyle: 'italic',
        //fontWeight: 'bold',
    },
    scrollViewStyle: {
        backgroundColor: theme.colors[mode].white,
        flex: 1,
    },
});

export default MessagesList;
