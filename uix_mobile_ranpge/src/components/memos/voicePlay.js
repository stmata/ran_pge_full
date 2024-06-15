import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';
import theme from '../../theme'; // Assurez-vous que ce chemin est correct pour votre structure de projet
import { useTheme } from '../../context/ThemeContext'; // Idem

const VoicePlay = ({ uri , confirm}) => {
  const [sound, setSound] = useState(null);
  const [status, setStatus] = useState(null);
  const { isDarkTheme } = useTheme();
  const mode = isDarkTheme ? 'dark' : 'light';
  const styles = getStyles(mode);

  const animation1 = useRef(new Animated.Value(1)).current;
  const animation2 = useRef(new Animated.Value(1)).current;
  const animation3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function setAudioMode() {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
    }
  
    setAudioMode();
  }, []);


  useEffect(() => {
    // Fonction pour arrêter la lecture du son
    async function stopPlayback() {
      if (sound) {
        await sound.stopAsync();
        // Si nécessaire, remettre à zéro le statut ou effectuer d'autres nettoyages
        setStatus(null);
      }
    }
  
    // Vérifier si `confirm` est vrai, et si oui, arrêter la lecture du son
    if (confirm) {
      stopPlayback();
    }
  }, [confirm]); // Dépendance à `confirm`, pour que cela s'exécute chaque fois que `confirm` change
  

  useEffect(() => {
    let isMounted = true;

    async function loadAndPlay() {
        if (!uri) {
            console.log("URI de la ressource audio est null ou non défini.");
            return; // Quitte la fonction si uri est null ou non défini.
          }
      if (sound) {
        await sound.unloadAsync();
        if (isMounted) {
          setSound(null);
        }
      }

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      if (isMounted) {
        setSound(newSound);
        setStatus(status);
      }
    }

    loadAndPlay();

    return () => {
      isMounted = false;
      sound?.unloadAsync();
    };
  }, [uri]);

  useEffect(() => {
    if (status?.isPlaying) {
      animateBar(animation1);
      animateBar(animation2);
      animateBar(animation3);
    } else {
      [animation1, animation2, animation3].forEach(animation => {
        animation.stopAnimation();
        animation.setValue(1);
      });
    }
  }, [status?.isPlaying]);

  const onPlaybackStatusUpdate = (update) => {
    setStatus(() => update);
  };

  // Génère un nombre aléatoire entre min et max
  const getRandomValue = (min, max) => Math.random() * (max - min) + min;

  const animateBar = (animation) => {
    const createRandomAnimationSequence = () => {
      // Crée un tableau d'animations avec des valeurs aléatoires
      return Array.from({ length: 5 }, () => getRandomValue(0.5, 1.5)).map(value =>
        Animated.timing(animation, {
          toValue: value,
          duration: 500, // Durée de chaque animation
          useNativeDriver: true,
        })
      );
    };

    Animated.loop(
      Animated.sequence(createRandomAnimationSequence())
    ).start();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.playbackIndicator, { transform: [{ scaleY: animation1 }] }]} />
      <Animated.View style={[styles.playbackIndicator, { transform: [{ scaleY: animation2 }] }, styles.playbackIndicatorSpacing]} />
      <Animated.View style={[styles.playbackIndicator, { transform: [{ scaleY: animation3 }] }]} />
    </View>
  );
};

const getStyles = (mode) => StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: theme.colors[mode].background,
    width: '100%',
    height: 100,
  },
  playbackIndicator: {
    width: 30,
    height: 60,
    backgroundColor: theme.colors[mode].primary,
    margin: 2,
    borderRadius: 99,
  },
  playbackIndicatorSpacing: {
    marginHorizontal: 8,
  },
});

export default VoicePlay;
