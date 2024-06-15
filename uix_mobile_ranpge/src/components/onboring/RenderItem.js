import {StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import React from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  Extrapolate, // Use Extrapolate instead of Extrapolation
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

const RenderItem = ({index, x, item}) => {
  const {width: SCREEN_WIDTH} = useWindowDimensions();

  const lottieAnimationStyle = useAnimatedStyle(() => {
    const translateYAnimation = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [200, 0, -200],
      Extrapolate.CLAMP, // Use Extrapolate here
    );

    return {
      transform: [{translateY: translateYAnimation}],
    };
  });

  const circleAnimation = useAnimatedStyle(() => {
    const scale = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [1, 4, 4],
      Extrapolate.CLAMP, // And also here
    );

    return {
      transform: [{scale}],
    };
  });

  return (
    <View style={[styles.itemContainer, {width: SCREEN_WIDTH}]}>
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            {
              width: SCREEN_WIDTH,
              height: SCREEN_WIDTH,
              borderRadius: SCREEN_WIDTH / 2,
              backgroundColor: item.backgroundColor,
            },
            circleAnimation,
          ]}
        />
      </View>
      <Animated.View style={lottieAnimationStyle}>
        <LottieView
          source={item.animation}
          style={{
            width: SCREEN_WIDTH * 0.9,
            height: SCREEN_WIDTH * 0.9,
          }}
          autoPlay
          loop
        />
      </Animated.View>
      <Text style={[styles.itemText, {color: item.textColor}]}>
        {item.text}
      </Text>
      <Text style={[styles.descriptionText, {color: item.textColor}]}>
        {item.description}
      </Text>
    </View>
  );
};

export default RenderItem;

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 120,
  },
  itemText: {
    textAlign: 'center',
    fontSize: 44,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  descriptionText: {
    textAlign: 'center',
    fontSize: 18, // Smaller than the main text for distinction
    fontWeight: 'normal', // Lighter weight than the main text
    marginBottom: 20, // Adjusted for spacing
    marginHorizontal: 20,
    lineHeight: 24, // Adjust line height for better readability
  },
  circleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

