import React,{useContext} from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ImageBackground } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
import theme from '../theme';
import { useTheme } from '../context/ThemeContext';

const Wave = () => {
  const { isDarkTheme } = useTheme(); // Utilisez le contexte du thème
  const mode = isDarkTheme ? 'dark' : 'light';

  // Ajustez la hauteur ici pour être 2/3 de la hauteur de l'écran
  const adjustedHeight = screenHeight * 2 / 3; 

  return (
    <View style={[styles.container, { height: adjustedHeight }]}>
      <ImageBackground
        source={require('../../assets/images/splachScreen.png')}
        style={{ width: screenWidth, height: adjustedHeight }}
      >
        <Svg
          height="100%" // Utiliser une hauteur relative pour SVG
          width={screenWidth}
          viewBox={`0 0 ${screenWidth} ${adjustedHeight}`}
          style={styles.svg}
        >
         {/* <Path
           d={`M0,${screenHeight / 2.1} 
           C${screenWidth / 4},${screenHeight / 2.4} 
           ${screenWidth / 2.5},${screenHeight / 2.3} 
           ${screenWidth / 2},${screenHeight / 2.2} 
           S${3 * screenWidth / 4},${screenHeight / 1.9} 
           ${screenWidth},${screenHeight / 2.5} 
           V${screenHeight / 2} H0 Z`}     
          fill={theme.colors[mode].white} // Utiliser une couleur semi-transparente pour voir l'image derrière
        /> */}
        <Path
            d={`M0,${adjustedHeight * 0.89} 
            C${screenWidth / 4},${adjustedHeight * 0.96} 
            ${screenWidth / 2.5},${adjustedHeight * 0.95} 
            ${screenWidth / 2},${adjustedHeight * 0.9} 
            S${3 * screenWidth / 4},${adjustedHeight * 0.8} 
            ${screenWidth},${adjustedHeight * 0.9} 
            V${adjustedHeight} H0 Z`}
            fill={theme.colors[mode].white} // Utiliser une couleur semi-transparente pour voir l'image derrière
          />
        </Svg>
      </ImageBackground>
    </View>
  );
};

// Ajustez les styles pour utiliser la nouvelle hauteur ajustée
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    width: screenWidth,
    // La hauteur est maintenant définie dynamiquement dans le style inline de <View>
  },
  svg: {
    position: 'absolute',
    top: 0,
  },
});


export default Wave;
