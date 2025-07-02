// src/screens/SplashScreen.tsx
import React, {useEffect, useRef} from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';

const {width, height} = Dimensions.get('window');

interface SplashScreenProps {
  navigation: any;
}

export default function SplashScreen({navigation}: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      // Background fade in
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      // Logo scale and fade in together
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Hold for a moment
      Animated.delay(800),
      // Subtle pulse effect
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Navigate after animation completes
    const timeout = setTimeout(() => {
      navigation.replace('PhoneNumber');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [fadeAnim, scaleAnim, backgroundAnim, navigation]);

  const backgroundInterpolation = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#000000', '#0a0a0a'],
  });

  return (
    <Animated.View
      style={[styles.container, {backgroundColor: backgroundInterpolation}]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Subtle gradient overlay */}
      <View style={styles.gradientOverlay} />

      {/* Animated logo container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Subtle glow effect */}
        <View style={styles.logoGlow} />
      </Animated.View>

      {/* Optional: Loading indicator dots */}
      <View style={styles.loadingContainer}>
        <LoadingDots />
      </View>
    </Animated.View>
  );
}

// Simple loading dots component
const LoadingDots = () => {
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      const animateDot = (anim: Animated.Value, delay: number) => {
        return Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ]);
      };

      Animated.loop(
        Animated.parallel([
          animateDot(dot1Anim, 0),
          animateDot(dot2Anim, 200),
          animateDot(dot3Anim, 400),
        ]),
      ).start();
    };

    const timer = setTimeout(animateDots, 1500);
    return () => clearTimeout(timer);
  }, [dot1Anim, dot2Anim, dot3Anim]);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, {opacity: dot1Anim}]} />
      <Animated.View style={[styles.dot, {opacity: dot2Anim}]} />
      <Animated.View style={[styles.dot, {opacity: dot3Anim}]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    // Add subtle radial gradient effect
    opacity: 0.1,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    width: Math.min(width * 0.5, 200),
    height: Math.min(width * 0.5, 200),
    // Add subtle shadow for depth
    shadowColor: '#ffffff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGlow: {
    position: 'absolute',
    width: Math.min(width * 0.6, 240),
    height: Math.min(width * 0.6, 240),
    borderRadius: Math.min(width * 0.3, 120),
    backgroundColor: '#ffffff',
    opacity: 0.03,
    // blur: 30, // Not supported in React Native StyleSheet
  },
  loadingContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    width: '100%',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
  },
});
