import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type SoundWaveProps = {
  isPlaying: boolean;
  color?: string;
  barCount?: number;
};

const SoundWave = ({ isPlaying, color = '#1db954', barCount = 50 }: SoundWaveProps) => {
  // Create animated values for each bar
  const animatedValues = useRef<Animated.Value[]>([]);
  
  // Initialize animated values if they don't exist
  if (animatedValues.current.length === 0) {
    animatedValues.current = Array(barCount).fill(0).map(() => new Animated.Value(0));
  }
  
  useEffect(() => {
    // Animation function for each bar
    const animateBars = () => {
      const animations = animatedValues.current.map((value, index) => {
        // Random height between 0.3 and 1.0
        const toValue = isPlaying ? 0.3 + Math.random() * 0.7 : 0.1 + Math.random() * 0.2;
        
        // Staggered animation speed
        const duration = isPlaying ? 400 + Math.random() * 600 : 1000;
        
        return Animated.timing(value, {
          toValue,
          duration,
          useNativeDriver: true,
        });
      });
      
      // Run all animations in parallel, then repeat
      Animated.parallel(animations).start(() => {
        if (isPlaying) {
          animateBars();
        }
      });
    };
    
    animateBars();
    
    return () => {
      // Stop animations on unmount
      animatedValues.current.forEach(value => {
        value.stopAnimation();
      });
    };
  }, [isPlaying, barCount]);
  
  return (
    <View style={styles.container}>
      {animatedValues.current.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              transform: [
                { 
                  scaleY: value,
                },
                {
                  translateY: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -50], // Move up as it scales
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 100,
    width: '100%',
    paddingHorizontal: 10,
  },
  bar: {
    width: 3,
    height: 100,
    borderRadius: 3,
    marginHorizontal: 1,
    backgroundColor: '#1db954',
  },
});

export default SoundWave;