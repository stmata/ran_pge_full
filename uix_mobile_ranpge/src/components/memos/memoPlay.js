import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    withTiming,
  } from 'react-native-reanimated';

import theme from '../../theme';
import { useTheme } from '../../context/ThemeContext';

const MemoPlay = ({ uri , metering  }) => {
  const [sound, setSound] = useState(null);
  const [status, setStatus] = useState(null);

  const { isDarkTheme } = useTheme(); // Utilisez le contexte du thème
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


  async function loadSound() {
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri:uri },
      { progressUpdateIntervalMillis: 1000 / 60 },
      onPlaybackStatusUpdate
    );
    setSound(newSound);
  }

  const onPlaybackStatusUpdate = useCallback((newStatus) => {
    setStatus(newStatus);
    if (!newStatus.isLoaded || !sound) {
      return;
    }
    if (newStatus.didJustFinish) {
      sound.setPositionAsync(0);
    }
  }, [sound]);

  useEffect(() => {
    console.log(metering)
    loadSound().catch(error => {
      console.log("Erreur lors du chargement du son:", error);
    });
    return () => sound ? sound.unloadAsync() : undefined;
  }, [uri , metering]);

  async function playSound() {
    if (!sound) {
      return;
    }
    if (status?.isLoaded && status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.replayAsync();
    }
  }

  const formatMillis = (millis) => {
    const minutes = Math.floor(millis / (1000 * 60));
    const seconds = Math.floor((millis % (1000 * 60)) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const position = status?.isLoaded ? status.positionMillis : 0;
  const duration = status?.isLoaded ? status.durationMillis : 1;
  const progress = position / duration;

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    left: `${progress * 100}%`,
  }));

  let numLines = 50;
  let lines = [];

  for (let i = 0; i < numLines; i++) {
    const meteringIndex = Math.floor((i *metering.length) / numLines);
    const nextMeteringIndex = Math.ceil(((i + 1) *metering.length) / numLines);
    const values = metering.slice(meteringIndex, nextMeteringIndex);
    const average = values.reduce((sum, a) => sum + a, 0) / values.length;
    lines.push(average);
  }

  return (
    <View style={styles.container}>
      <FontAwesome5 onPress={playSound} name={isPlaying ? 'pause' : 'play'} size={20} color={'gray'} />
      <View style={styles.playbackContainer}>
        <View style={styles.wave}>
          {lines.map((db, index) => (
            <View key={index} style={[
              styles.waveLine,
              {
                height: interpolate(db, [-60, 0], [5, 50], Extrapolate.CLAMP),
                backgroundColor: progress > index / lines.length ? 'royalblue' : 'gainsboro',
              },
            ]} />
          ))}
        </View>
        <Text style={styles.timeText}>
          {formatMillis(position || 0)} / {formatMillis(duration || 0)}
        </Text>
      </View>
    </View>
  );
};

const getStyles = (mode) => StyleSheet.create({
  container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      gap: 10,
      flex: 1, // Permet à MemoPlay de s'étendre ou de se contracter selon l'espace disponible
    },

  playbackContainer: {
    flex: 1,
    height: 70,
    justifyContent: 'center',
  },
  playbackBackground: {
    height: 3,
    backgroundColor: 'gainsboro',
    borderRadius: 5,
  },
  playbackIndicator: {
    width: 10,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: 'royalblue',
    position: 'absolute',
  },

  wave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  waveLine: {
    flex: 1,
    height: 30,
    backgroundColor: 'gainsboro',
    borderRadius: 20,
  },
  timeText:{
    color: theme.colors[mode].gray,
    fontSize: 12,
  }
});

export default MemoPlay;
