import { Text, View, Animated, Image, Dimensions, TouchableOpacity, Platform, StatusBar } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { indexStyle } from './components/styles/style';

const { width, height } = Dimensions.get('window');

const Index = () => {
  const router = useRouter();
  const [hasClicked, setHasClicked] = useState(false);
  
  // Platform logo animations
  const platformLogoScale = useRef(new Animated.Value(0)).current;
  const platformLogoOpacity = useRef(new Animated.Value(0)).current;
  const platformLogoRotate = useRef(new Animated.Value(0)).current;
  
  // Main logo animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Title animations
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(50)).current;
  
  // Background animations
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  
  // Particle animations
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const particle4 = useRef(new Animated.Value(0)).current;
  
  const particle1X = useRef(new Animated.Value(-50)).current;
  const particle1Y = useRef(new Animated.Value(height + 50)).current;
  const particle2X = useRef(new Animated.Value(width + 50)).current;
  const particle2Y = useRef(new Animated.Value(-50)).current;
  const particle3X = useRef(new Animated.Value(-50)).current;
  const particle3Y = useRef(new Animated.Value(height/2)).current;
  const particle4X = useRef(new Animated.Value(width + 50)).current;
  const particle4Y = useRef(new Animated.Value(height/3)).current;
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const clickToStartAnim = useRef(new Animated.Value(0)).current;
  const clickToStartPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start particle animations
    const startParticleAnimations = () => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(particle1X, {
            toValue: width + 100,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(particle1Y, {
            toValue: -100,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(particle1, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          })
        ])
      ).start();

      Animated.loop(
        Animated.parallel([
          Animated.timing(particle2X, {
            toValue: -100,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(particle2Y, {
            toValue: height + 100,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(particle2, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          })
        ])
      ).start();

      Animated.loop(
        Animated.parallel([
          Animated.timing(particle3X, {
            toValue: width + 100,
            duration: 10000,
            useNativeDriver: true,
          }),
          Animated.timing(particle3, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: true,
          })
        ])
      ).start();

      Animated.loop(
        Animated.parallel([
          Animated.timing(particle4X, {
            toValue: -100,
            duration: 7000,
            useNativeDriver: true,
          }),
          Animated.timing(particle4, {
            toValue: 1,
            duration: 7000,
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    const startClickToStartPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(clickToStartPulse, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(clickToStartPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    const startMainAnimation = () => {
      Animated.sequence([
        // Background transition
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        
        // Platform logo appears
        Animated.parallel([
          Animated.spring(platformLogoScale, {
            toValue: 1,
            friction: Platform.OS === 'ios' ? 8 : 6,
            tension: Platform.OS === 'ios' ? 100 : 120,
            useNativeDriver: true,
          }),
          Animated.timing(platformLogoOpacity, {
            toValue: 1,
            duration: Platform.OS === 'ios' ? 600 : 700,
            useNativeDriver: true,
          }),
          Animated.timing(platformLogoRotate, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ]),
        
        Animated.delay(Platform.OS === 'ios' ? 800 : 900),
        
        // Platform logo fades, app logo appears
        Animated.parallel([
          Animated.timing(platformLogoOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          })
        ]),
        
        Animated.delay(300),
        
        // Title appears
        Animated.parallel([
          Animated.spring(titleTranslateY, {
            toValue: 0,
            friction: 6,
            tension: 120,
            useNativeDriver: true,
          }),
          Animated.timing(titleFadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          })
        ]),
        
        Animated.delay(1000),
        
        // Button appears
        Animated.spring(clickToStartAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        })
      ]).start(() => {
        startClickToStartPulse();
      });
    };

    startParticleAnimations();
    startPulseAnimation();
    startMainAnimation();
  }, []);

  const handleClickToStart = () => {
    if (hasClicked) return; // Prevent multiple clicks
    
    setHasClicked(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(titleFadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(clickToStartAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (Platform.OS === 'web') {
        router.push("/authweb/Login");
      } else {
        router.push("/authmobile/Login");
      }
    });
  };

  // Static platform-specific background colors
  const backgroundColor = Platform.OS === 'ios' ? '#1a1a1a' : '#B2EBF2';

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const platformRotate = platformLogoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const getPlatformLogo = () => {
    if (Platform.OS === 'ios') {
      return { name: 'apple', size: 60, color: '#FFFFFF' };
    } else {
      return { name: 'android', size: 70, color: '#A4C639' };
    }
  };

  const platformLogo = getPlatformLogo();

  return (
    <>
      <StatusBar 
        barStyle="light-content"
        backgroundColor={Platform.OS === 'ios' ? '#000000' : '#E0F7FA'} 
      />
      <View style={[indexStyle.container]}>
        <Animated.View 
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor,
              opacity: backgroundOpacity,
            }
          ]} 
        />

        {/* Particles */}
        <Animated.View
          style={{
            position: 'absolute',
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#4FC3F7',
            opacity: 0.6,
            transform: [
              { translateX: particle1X },
              { translateY: particle1Y },
              { scale: particle1 }
            ]
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            width: 15,
            height: 15,
            borderRadius: 7.5,
            backgroundColor: '#81C784',
            opacity: 0.5,
            transform: [
              { translateX: particle2X },
              { translateY: particle2Y },
              { scale: particle2 }
            ]
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            width: 25,
            height: 25,
            borderRadius: 12.5,
            backgroundColor: '#FFB74D',
            opacity: 0.4,
            transform: [
              { translateX: particle3X },
              { translateY: particle3Y },
              { scale: particle3 }
            ]
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: '#F06292',
            opacity: 0.5,
            transform: [
              { translateX: particle4X },
              { translateY: particle4Y },
              { scale: particle4 }
            ]
          }}
        />

        <Animated.View
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: Platform.OS === 'ios' ? '#333333' : '#B2DFDB',
            opacity: 0.3,
            transform: [{ scale: pulseAnim }]
          }}
        />

        {/* Platform Logo */}
        <Animated.View
          style={{
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: platformLogoOpacity,
            transform: [
              { scale: platformLogoScale },
              { rotate: platformRotate }
            ]
          }}
        >
          <MaterialCommunityIcons 
            name={platformLogo.name}
            size={platformLogo.size}
            color={platformLogo.color}
          />
        </Animated.View>

        {/* App Logo */}
        <Animated.View
          style={[
            indexStyle.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate }
              ]
            }
          ]}
        >
          <Image 
            source={require('../assets/adaptive-icon.png')}
            style={indexStyle.logo}
          />
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: height * 0.35,
            width: '100%',
            alignItems: 'center',
            opacity: titleFadeAnim,
            transform: [{ translateY: titleTranslateY }]
          }}
        >
          <Text style={[indexStyle.title, { 
            fontSize: 32, 
            fontWeight: '800',
            color: '#FFFFFF',
            textShadowColor: '#000000',
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 1,
          }]}>
            MMPC Mobile
          </Text>
          <Animated.View
            style={{
              marginTop: 10,
              width: 100,
              height: 4,
              backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#303481',
              borderRadius: 2,
              opacity: titleFadeAnim,
              transform: [{ scaleX: titleFadeAnim }]
            }}
          />
        </Animated.View>

        {/* Button */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: height * 0.15,
            width: '100%',
            alignItems: 'center',
            opacity: clickToStartAnim,
            transform: [
              { scale: clickToStartAnim },
              { scale: clickToStartPulse }
            ]
          }}
        >
          <TouchableOpacity
            onPress={handleClickToStart}
            disabled={hasClicked}
            style={{
              backgroundColor: hasClicked 
                ? (Platform.OS === 'ios' ? '#666666' : '#9E9E9E')
                : (Platform.OS === 'ios' ? '#007AFF' : '#303481'),
              paddingHorizontal: 40,
              paddingVertical: 15,
              borderRadius: 30,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: hasClicked ? 0.1 : 0.3,
              shadowRadius: 8,
              elevation: hasClicked ? 2 : 8,
            }}
            activeOpacity={hasClicked ? 1 : 0.8}
          >
            <Text style={{
              color: hasClicked ? '#CCCCCC' : '#FFFFFF',
              fontSize: 18,
              fontWeight: '700',
              textAlign: 'center',
              letterSpacing: 1
            }}>
              {hasClicked ? 'REDIRECTING...' : 'TAP TO START'}
            </Text>
          </TouchableOpacity>
          
          <Animated.View
            style={{
              marginTop: 15,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#303481',
              opacity: 0.6,
              transform: [{ scale: clickToStartPulse }]
            }}
          />
        </Animated.View>

        {/* Accent circles */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 100,
            right: 50,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#4FC3F7',
            opacity: 0.2,
            transform: [{ scale: pulseAnim }]
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 150,
            left: 30,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#81C784',
            opacity: 0.3,
            transform: [{ scale: pulseAnim }]
          }}
        />
      </View>
    </>
  );
}

export default Index;