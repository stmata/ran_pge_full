// components/ProgressRoutes.js
import React from 'react';
import { View, ScrollView, Text ,StyleSheet} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const ProgressRoutes = () => {
    return(
    
      <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Text>Progrès</Text>
        <View style={styles.stars}>
          {[...Array(5)].map((_, index) => {
            return (
              <AntDesign 
                key={index} 
                name="star" 
                size={24} 
                color={index < 4 ? "gold" : "grey"} 
              />
            );
          })}
        </View>
      </View>
    
    );
};

const styles = StyleSheet.create({
    stars: {
      flexDirection: 'row',
      marginVertical: 8,
    }
  });
export default ProgressRoutes;
