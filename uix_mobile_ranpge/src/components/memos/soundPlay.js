import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import theme from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SoundPlay = ({ uri, setModalVisible }) => {
    const [sound, setSound] = useState(null);
    const [status, setStatus] = useState(null);
    const [isFinished, setIsFinished] = useState(false); // Nouvelle variable d'état
    const { isDarkTheme } = useTheme();
    const mode = isDarkTheme ? 'dark' : 'light';
    const styles = getStyles(mode);


    useEffect(() => {
      async function setAudioMode() {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
        });
      }
    
      setAudioMode();
    }, []);


    const onPlaybackStatusUpdate = useCallback((newStatus) => {
        setStatus(newStatus);
        if (newStatus.didJustFinish) {
        setIsFinished(true); // Met à jour isFinished lorsque l'audio est terminé
        }
    }, []);

    useEffect(() => {
        if (!uri) {
            console.log("URI de la ressource audio est null ou non défini.");
            return; // Quitte la fonction si uri est null ou non défini.
          }
        async function loadSound() {
        const { sound: newSound, status } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: false },
            onPlaybackStatusUpdate
        );
        setSound(newSound);
        setStatus(status);
        }

        loadSound();

        return () => {
        if (sound) {
            sound.unloadAsync();
        }
        };
    }, [uri, onPlaybackStatusUpdate]);

    const togglePlayback = async () => {
        if (status?.isPlaying) {
        await sound.pauseAsync();
        } else {
        if (isFinished) {
            await sound.playFromPositionAsync(0); // Relance l'audio du début si terminé
            setIsFinished(false); // Réinitialise isFinished
        } else {
            await sound.playAsync();
        }
        }
    };

  async function skipForwards() {
    if (sound && status) {
      const newPosition = (status.positionMillis || 0) + 15000; // Avance de 15 secondes
      await sound.setPositionAsync(newPosition);
    }
  }

  async function skipBackwards() {
    if (sound && status) {
      const newPosition = Math.max(0, (status.positionMillis || 0) - 15000); // Recule de 15 secondes
      await sound.setPositionAsync(newPosition);
    }
  }

  const formatMillis = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  };

  const handleClose = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={skipBackwards} style={styles.controlButton}>
        <Icon name="fast-rewind" size={30} color={theme.colors[mode].gray} />
      </TouchableOpacity>

      {isFinished ? (
            <TouchableOpacity onPress={togglePlayback} style={styles.controlButton}>
            <Icon name="replay" size={30} color={theme.colors[mode].gray} />
            </TouchableOpacity>
        ) : (
            <TouchableOpacity onPress={togglePlayback} style={styles.controlButton}>
            <FontAwesome5 name={status?.isPlaying ? 'pause' : 'play'} size={20} color={theme.colors[mode].gray} />
            </TouchableOpacity>
        )}

      <TouchableOpacity onPress={skipForwards} style={styles.controlButton}>
        <Icon name='fast-forward' size={30} color={theme.colors[mode].gray} />
      </TouchableOpacity>

      <View style={styles.playbackContainer}>
        <Text style={styles.timeText}>
          {status?.positionMillis ? formatMillis(status.positionMillis) : '0:00'} / {status?.durationMillis ? formatMillis(status.durationMillis) : '0:00'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.buttonClose]}
        onPress={handleClose}
      >
        <Icon name="close" size={24} color={theme.colors[mode].gray} />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (mode) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors[mode].background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '100%'
  },
  playbackContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10, // Ajoute un peu d'espace autour du texte
  },
  timeText: {
    color: theme.colors[mode].gray,
    fontSize: 14,
    textAlign: 'center', // Centre le texte dans son conteneur
  },
  controlButton: {
    marginHorizontal: 5, // Espacement entre les boutons
  },
  buttonClose: {
    backgroundColor: "transparent",
  },
});

export default SoundPlay;