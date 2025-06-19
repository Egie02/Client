/**
 * SplashIOS - iOS-optimized splash screen
 * Features Apple logo first, then app logo with iOS-native animations
 */

import { Text, View, Animated, Image, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SplashIOS = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Platform logo animations
  const appleLogoScale = useRef(new Animated.Value(0)).current;
  const appleLogoOpacity = useRef(new Animated.Value(0)).current;
  
  // App logo animations
  const appLogoScale = useRef(new Animated.Value(0)).current;
  const appLogoOpacity = useRef(new Animated.Value(0)).current;
  
  // Title animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  
  // Background animations
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  
  // Button animations
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  
  // Subtle particle effects (iOS-optimized - only 2 particles)
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle1X = useRef(new Animated.Value(width * 0.2)).current;
  const particle1Y = useRef(new Animated.Value(height * 0.3)).current;
  
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle2X = useRef(new Animated.Value(width * 0.8)).current;
  const particle2Y = useRef(new Animated.Value(height * 0.7)).current;

  useEffect(() => {
    // Start the iOS-optimized animation sequence
    const startAnimationSequence = () => {
      Animated.sequence([
        // Phase 1: Background fade in (500ms)
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        
        // Phase 2: Apple logo appears (600ms)
        Animated.parallel([
          Animated.spring(appleLogoScale, {
            toValue: 1,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(appleLogoOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          })
        ]),
        
        // Phase 3: Brief pause (800ms)
        Animated.delay(800),
        
        // Phase 4: Apple logo fade out, app logo fade in (400ms)
        Animated.parallel([
          Animated.timing(appleLogoOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(appLogoScale, {
            toValue: 1,
            friction: 6,
            tension: 120,
            useNativeDriver: true,
          }),
          Animated.timing(appLogoOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          })
        ]),
        
        // Phase 5: Title appears (500ms)
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(titleTranslateY, {
            toValue: 0,
            friction: 7,
            tension: 100,
            useNativeDriver: true,
          })
        ]),
        
        // Phase 6: Button appears (400ms)
        Animated.delay(600),
        Animated.parallel([
          Animated.spring(buttonScale, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          })
        ])
      ]).start(() => {
        // Start button pulsing after main sequence
        startButtonPulse();
        startSubtleParticles();
      });
    };

    // iOS-optimized subtle particle animation
    const startSubtleParticles = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(particle1, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(particle1, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            })
          ]),
          Animated.timing(particle1Y, {
            toValue: height * 0.1,
            duration: 6000,
            useNativeDriver: true,
          })
        ])
      ).start();
      
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(particle2, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(particle2, {
              toValue: 0,
              duration: 4000,
              useNativeDriver: true,
            })
          ]),
          Animated.timing(particle2Y, {
            toValue: height * 0.9,
            duration: 8000,
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    // Subtle button pulse (iOS-style)
    const startButtonPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonPulse, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(buttonPulse, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    // Start the animation sequence
    startAnimationSequence();
  }, []);

  // Handle navigation
  const handleGetStarted = () => {
    // iOS-style exit animation
    Animated.parallel([
      Animated.timing(appLogoOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start(() => {
      router.push("/authmobile/Login");
    });
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Animated.View 
        style={[
          styles.container,
          { 
            opacity: backgroundOpacity,
            paddingTop: insets.top,
            paddingBottom: insets.bottom 
          }
        ]}
      >
        {/* iOS Background */}
        <View style={styles.background} />
        
        {/* Subtle Particles */}
        <Animated.View
          style={[
            styles.particle,
            {
              opacity: particle1,
              transform: [
                { translateX: particle1X },
                { translateY: particle1Y },
                { scale: particle1 }
              ]
            }
          ]}
        />
        <Animated.View
          style={[
            styles.particle2,
            {
              opacity: particle2,
              transform: [
                { translateX: particle2X },
                { translateY: particle2Y },
                { scale: particle2 }
              ]
            }
          ]}
        />

        {/* Apple Logo (Platform Logo) */}
        <Animated.View
          style={[
            styles.platformLogoContainer,
            {
              opacity: appleLogoOpacity,
              transform: [{ scale: appleLogoScale }]
            }
          ]}
        >
          <MaterialCommunityIcons 
            name="apple" 
            size={60} 
            color="#FFFFFF" 
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
          <Text style={styles.subtitle}>Powered by iOS</Text>
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [
                { scale: buttonScale },
                { scale: buttonPulse }
              ]
            }
          ]}
        >
          <TouchableOpacity
            onPress={handleGetStarted}
            style={styles.getStartedButton}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <MaterialCommunityIcons 
              name="arrow-right" 
              size={20} 
              color="#000000" 
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
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
  particle2: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    opacity: 0.4,
  },
  platformLogoContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appLogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  appLogo: {
    width: 120,
    height: 120,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: 'System', // iOS system font
  },
  titleUnderline: {
    width: 80,
    height: 3,
    backgroundColor: '#007AFF',
    borderRadius: 1.5,
    marginTop: 8,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
};

export default SplashIOS; 