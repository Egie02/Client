/**
 * SplashAndroid - Android-optimized splash screen
 * Features Android robot logo first, then app logo with Material Design animations
 */

import { Text, View, Animated, Image, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SplashAndroid = () => {
  const router = useRouter();
  
  // Platform logo animations
  const androidLogoScale = useRef(new Animated.Value(0)).current;
  const androidLogoOpacity = useRef(new Animated.Value(0)).current;
  
  // App logo animations
  const appLogoScale = useRef(new Animated.Value(0)).current;
  const appLogoOpacity = useRef(new Animated.Value(0)).current;
  
  // Title animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(50)).current;
  
  // Background animations
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  
  // Button animations
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start the Android animation sequence
    const startAnimationSequence = () => {
      Animated.sequence([
        // Phase 1: Background fade in
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        
        // Phase 2: Android logo appears
        Animated.parallel([
          Animated.spring(androidLogoScale, {
            toValue: 1,
            friction: 6,
            tension: 120,
            useNativeDriver: true,
          }),
          Animated.timing(androidLogoOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          })
        ]),
        
        // Phase 3: Brief pause
        Animated.delay(900),
        
        // Phase 4: Android logo fade out, app logo fade in
        Animated.parallel([
          Animated.timing(androidLogoOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(appLogoScale, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(appLogoOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          })
        ]),
        
        // Phase 5: Title appears
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(titleTranslateY, {
            toValue: 0,
            friction: 6,
            tension: 100,
            useNativeDriver: true,
          })
        ]),
        
        // Phase 6: Button appears
        Animated.delay(700),
        Animated.parallel([
          Animated.spring(buttonScale, {
            toValue: 1,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      ]).start();
    };

    startAnimationSequence();
  }, []);

  // Handle navigation
  const handleGetStarted = () => {
    Animated.parallel([
      Animated.timing(appLogoOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      router.push("/authmobile/Login");
    });
  };



  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
      <Animated.View 
        style={[
          styles.container,
          { 
            opacity: backgroundOpacity 
          }
        ]}
      >
        {/* Android Robot Logo (Platform Logo) */}
        <Animated.View
          style={[
            styles.platformLogoContainer,
            {
              opacity: androidLogoOpacity,
              transform: [{ scale: androidLogoScale }]
            }
          ]}
        >
          <MaterialCommunityIcons 
            name="android" 
            size={70} 
            color="#A4C639" 
          />
        </Animated.View>

        {/* App Logo */}
        <Animated.View
          style={[
            styles.appLogoContainer,
            {
              opacity: appLogoOpacity,
              transform: [{ scale: appLogoScale }]
            }
          ]}
        >
          <Image 
            source={require('../../assets/adaptive-icon.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }]
            }
          ]}
        >
          <Text style={styles.title}>MMPC MOBILE</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>Powered by Android</Text>
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }]
            }
          ]}
        >
          <TouchableOpacity
            onPress={handleGetStarted}
            style={styles.getStartedButton}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>GET STARTED</Text>
            <MaterialCommunityIcons 
              name="arrow-right" 
              size={22} 
              color="#FFFFFF" 
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E88E5',
  },
  platformLogoContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appLogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  appLogo: {
    width: 130,
    height: 130,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 70,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 90,
    height: 4,
    backgroundColor: '#FF5722',
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E8EAF6',
    textAlign: 'center',
    letterSpacing: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 90,
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
};

export default SplashAndroid; 