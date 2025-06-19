import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
  Vibration,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { changePIN } from '../(services)/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeManager';
import { useOTCPINStatus } from '../(services)/hooks/useOTCPINStatus';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// PIN validation rules
const PIN_VALIDATION = {
  MIN_LENGTH: 4,
  MAX_LENGTH: 4,
  FORBIDDEN_PINS: ['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999'],
  SEQUENTIAL_PATTERNS: ['0123', '1234', '2345', '3456', '4567', '5678', '6789'],
  REPEATED_PATTERNS: /^(.)\1+$/,
};

// Color utility functions
const hexToRgb = (hex) => {
  if (!hex) return null;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const getLuminance = (color) => {
  if (!color) return 0.5; // Default to medium luminance
  
  const rgb = hexToRgb(color);
  if (!rgb) return 0.5;
  
  // Convert RGB to relative luminance using WCAG formula
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const isLightColor = (color) => {
  return getLuminance(color) > 0.5;
};

const getContrastColor = (backgroundColor, lightColor = '#FFFFFF', darkColor = '#1A1A1A') => {
  return isLightColor(backgroundColor) ? darkColor : lightColor;
};

const getAdaptiveColors = (colors, isDefault, userTier) => {
  if (isDefault) {
    return {
      primaryText: '#1A1A1A',
      secondaryText: '#666666',
      background: '#E0F7FA',
      gradientStart: '#E0F7FA',
      gradientEnd: '#B2EBF2',
      cardBackground: 'rgba(255, 255, 255, 0.9)',
      cardText: '#1A1A1A',
      buttonBackground: '#303481',
      buttonText: '#FFFFFF',
    };
  }

  // For tier themes, determine colors based on brightness
  const primaryColor = colors.primary || '#303481';
  const backgroundColor = colors.light || colors.background || primaryColor;
  
  const isPrimaryLight = isLightColor(primaryColor);
  const isBackgroundLight = isLightColor(backgroundColor);
  
  return {
    primaryText: getContrastColor(backgroundColor),
    secondaryText: getContrastColor(backgroundColor, '#CCCCCC', '#888888'),
    background: backgroundColor,
    gradientStart: colors.light || backgroundColor,
    gradientEnd: colors.middle || colors.primary || backgroundColor,
    cardBackground: isBackgroundLight 
      ? 'rgba(255, 255, 255, 0.95)' 
      : 'rgba(0, 0, 0, 0.3)',
    cardText: isBackgroundLight ? '#1A1A1A' : '#FFFFFF',
    buttonBackground: primaryColor,
    buttonText: getContrastColor(primaryColor),
    accentColor: colors.accent || colors.middle || primaryColor,
    borderColor: isBackgroundLight 
      ? 'rgba(0, 0, 0, 0.1)' 
      : 'rgba(255, 255, 255, 0.2)',
  };
};

const ChangePassword = () => {
  // State management
  const [formData, setFormData] = useState({
    oldPIN: '',
    newPIN: '',
    confirmPIN: '',
  });
  const [uiState, setUIState] = useState({
    loading: false,
    step: 'old', // 'old', 'new', 'confirm', 'success'
    isFirstTime: false,
    errors: {},
    attempts: 0,
  });

  // Animations
  const [animations] = useState({
    shakeAnim: new Animated.Value(0),
    fadeAnim: new Animated.Value(1),
    scaleAnim: new Animated.Value(1),
    progressAnim: new Animated.Value(0),
  });

  const router = useRouter();
  const { colors, getGradientColors, isDefault, userTier } = useTheme();
  const { invalidateCache } = useOTCPINStatus();
  const gradientColors = getGradientColors();

  // Get adaptive colors based on theme
  const adaptiveColors = useMemo(() => 
    getAdaptiveColors(colors, isDefault, userTier), 
    [colors, isDefault, userTier]
  );

  // Computed values
  const currentPIN = useMemo(() => {
    return formData[uiState.step === 'old' ? 'oldPIN' : 
                    uiState.step === 'new' ? 'newPIN' : 'confirmPIN'];
  }, [formData, uiState.step]);

  const progress = useMemo(() => {
    if (uiState.step === 'success') return 1;
    
    const currentStepIndex = uiState.step === 'old' ? 0 : 
                           uiState.step === 'new' ? 1 : 2;
    const totalSteps = uiState.isFirstTime ? 2 : 3;
    return currentStepIndex / (totalSteps - 1);
  }, [uiState.step, uiState.isFirstTime]);

  // Initialize component
  useEffect(() => {
    initializeComponent();
    animateProgress();
  }, []);

  useEffect(() => {
    animateProgress();
  }, [progress]);

  const initializeComponent = async () => {
    try {
      const firstTimeFlag = await AsyncStorage.getItem('isFirstTimeLogin');
      if (firstTimeFlag === 'true') {
        setUIState(prev => ({ ...prev, isFirstTime: true, step: 'new' }));
        setFormData(prev => ({ ...prev, oldPIN: '1234' }));
        await AsyncStorage.removeItem('isFirstTimeLogin');
      }
    } catch (error) {
      console.warn('Error initializing ChangePassword:', error);
    }
  };

  const animateProgress = () => {
    Animated.timing(animations.progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // PIN validation
  const validatePIN = useCallback((pin, type = 'new') => {
    const errors = [];

    if (pin.length !== PIN_VALIDATION.MAX_LENGTH) {
      errors.push('PIN must be exactly 4 digits');
    }

    if (type === 'new') {
      if (PIN_VALIDATION.FORBIDDEN_PINS.includes(pin)) {
        errors.push('This PIN is too common. Please choose a different one.');
      }

      if (PIN_VALIDATION.SEQUENTIAL_PATTERNS.some(pattern => pattern === pin)) {
        errors.push('Sequential PINs are not allowed.');
      }

      if (PIN_VALIDATION.REPEATED_PATTERNS.test(pin)) {
        errors.push('Repeated digits are not allowed.');
      }

      if (pin === formData.oldPIN) {
        errors.push('New PIN must be different from current PIN.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [formData.oldPIN]);

  // Animation helpers
  const triggerShakeAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(animations.shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(animations.shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(animations.shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(animations.shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [animations.shakeAnim]);

  const triggerSuccessAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(animations.scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.timing(animations.scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [animations.scaleAnim]);

  // Input handlers
  const handleKeyPress = useCallback((key) => {
    if (uiState.loading) return;

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate(30);
    }

    const currentField = uiState.step === 'old' ? 'oldPIN' : 
                        uiState.step === 'new' ? 'newPIN' : 'confirmPIN';
    
    if (currentPIN.length < PIN_VALIDATION.MAX_LENGTH) {
      const newPIN = currentPIN + key;
      
      setFormData(prev => ({
        ...prev,
        [currentField]: newPIN
      }));

      // Auto-advance when PIN is complete
      if (newPIN.length === PIN_VALIDATION.MAX_LENGTH) {
        setTimeout(() => {
          if (uiState.step === 'confirm') {
            handleChangePassword();
          } else {
            handleNext();
          }
        }, 300);
      }
    }
  }, [currentPIN, uiState.step, uiState.loading, handleChangePassword, handleNext]);

  const handleDelete = useCallback(() => {
    if (uiState.loading) return;

    if (Platform.OS === 'ios') {
      Vibration.vibrate(30);
    }

    const currentField = uiState.step === 'old' ? 'oldPIN' : 
                        uiState.step === 'new' ? 'newPIN' : 'confirmPIN';
    
    setFormData(prev => ({
      ...prev,
      [currentField]: prev[currentField].slice(0, -1)
    }));

    // Clear errors when user starts correcting
    if (uiState.errors[currentField]) {
      setUIState(prev => ({
        ...prev,
        errors: { ...prev.errors, [currentField]: undefined }
      }));
    }
  }, [uiState.step, uiState.loading, uiState.errors]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    const currentField = uiState.step === 'old' ? 'oldPIN' : 'newPIN';
    const currentValue = formData[currentField];

    if (currentValue.length !== PIN_VALIDATION.MAX_LENGTH) {
      triggerShakeAnimation();
      return;
    }

    // Validate new PIN
    if (uiState.step === 'new') {
      const validation = validatePIN(currentValue, 'new');
      if (!validation.isValid) {
        setUIState(prev => ({
          ...prev,
          errors: { ...prev.errors, newPIN: validation.errors[0] }
        }));
        triggerShakeAnimation();
        return;
      }
    }

    // Progress to next step
    const nextStep = uiState.step === 'old' ? 'new' : 'confirm';
    
    // Clear errors and update step
    setUIState(prev => ({ ...prev, step: nextStep, errors: {} }));
    
    // Clear the next field only
    const nextField = nextStep === 'new' ? 'newPIN' : 'confirmPIN';
    setFormData(prev => ({ ...prev, [nextField]: '' }));

    triggerSuccessAnimation();
  }, [uiState.step, formData, validatePIN, triggerShakeAnimation, triggerSuccessAnimation]);

  const handleBack = useCallback(() => {
    if (uiState.step === 'new' && uiState.isFirstTime) {
      Alert.alert(
        'PIN Change Required',
        'You must create a new PIN to continue using the app.',
        [{ text: 'OK' }]
      );
      return;
    }

    const prevStep = uiState.step === 'confirm' ? 'new' : 'old';
    
    // Clear errors and update step
    setUIState(prev => ({ ...prev, step: prevStep, errors: {} }));
    
    // Clear current field only, keep previous steps' data
    if (uiState.step === 'confirm') {
      setFormData(prev => ({ ...prev, confirmPIN: '' }));
    } else if (uiState.step === 'new') {
      setFormData(prev => ({ ...prev, newPIN: '', confirmPIN: '' }));
    }
  }, [uiState.step, uiState.isFirstTime]);

  // Main PIN change logic
  const handleChangePassword = async () => {
    try {
      setUIState(prev => ({ ...prev, loading: true, errors: {} }));

      // Final validation - ensure both PINs are complete and match
      if (formData.newPIN.length !== 4 || formData.confirmPIN.length !== 4) {
        setUIState(prev => ({
          ...prev,
          loading: false,
          errors: { confirmPIN: 'Please complete both PIN fields' },
          attempts: prev.attempts + 1
        }));
        triggerShakeAnimation();
        return;
      }

      if (formData.newPIN !== formData.confirmPIN) {
        setUIState(prev => ({
          ...prev,
          loading: false,
          errors: { confirmPIN: 'PINs do not match' },
          attempts: prev.attempts + 1
        }));
        setFormData(prev => ({ ...prev, confirmPIN: '' }));
        triggerShakeAnimation();
        return;
      }

      const validation = validatePIN(formData.newPIN, 'new');
      if (!validation.isValid) {
        setUIState(prev => ({
          ...prev,
          loading: false,
          errors: { newPIN: validation.errors[0] },
          attempts: prev.attempts + 1,
          step: 'new' // Fix: Set step correctly in same state update
        }));
        setFormData(prev => ({ ...prev, newPIN: '', confirmPIN: '' }));
        triggerShakeAnimation();
        return;
      }

      // Get phone number
      const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      if (!phoneNumber) {
        Alert.alert('Error', 'Session expired. Please login again.');
        router.replace('/authmobile/Login');
        return;
      }

      // Call API
      const response = await changePIN(
        phoneNumber, 
        formData.oldPIN, 
        formData.newPIN, 
        uiState.isFirstTime
      );

      if (response.success) {
        // Invalidate OTCPIN cache to refresh UI
        invalidateCache();
        
        setUIState(prev => ({ ...prev, step: 'success', loading: false }));
        triggerSuccessAnimation();

        const successMessage = uiState.isFirstTime 
          ? 'Welcome! Your new PIN has been created successfully.'
          : 'PIN changed successfully! Please login again with your new PIN.';
        
        setTimeout(() => {
          Alert.alert('Success', successMessage, [
            {
              text: 'Continue',
              onPress: () => {
                if (uiState.isFirstTime) {
                  router.replace('/(mobile)/MobileDashboard');
                } else {
                  router.replace('/authmobile/Login');
                }
              }
            }
          ]);
        }, 1000);
      } else {
        throw new Error(response.message || 'PIN change failed');
      }
    } catch (error) {
      setUIState(prev => ({
        ...prev,
        loading: false,
        attempts: prev.attempts + 1,
        errors: { general: error.message },
        // Fix: Better error step handling
        step: error.message?.toLowerCase().includes('current pin') && !uiState.isFirstTime ? 'old' : prev.step
      }));
      
      // Reset form data based on error type
      if (error.message?.toLowerCase().includes('current pin') && !uiState.isFirstTime) {
        setFormData(prev => ({ ...prev, oldPIN: '', newPIN: '', confirmPIN: '' }));
      } else if (error.message?.toLowerCase().includes('new pin')) {
        setFormData(prev => ({ ...prev, newPIN: '', confirmPIN: '' }));
      } else {
        setFormData(prev => ({ ...prev, confirmPIN: '' }));
      }
      
      triggerShakeAnimation();
      Alert.alert('Error', error.message);
    }
  };

  // UI Renderers
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressTrack, { backgroundColor: adaptiveColors.borderColor }]}>
        <Animated.View 
          style={[
            styles.progressFill,
            {
              width: animations.progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: adaptiveColors.buttonBackground,
            }
          ]} 
        />
      </View>
      <Text style={[styles.progressText, { color: adaptiveColors.primaryText }]}>
        Step {uiState.isFirstTime ? (uiState.step === 'new' ? 1 : 2) : 
              (uiState.step === 'old' ? 1 : uiState.step === 'new' ? 2 : 3)} of {uiState.isFirstTime ? 2 : 3}
      </Text>
    </View>
  );

  const renderPINDisplay = () => (
    <Animated.View 
      style={[
        styles.pinContainer,
        { transform: [{ translateX: animations.shakeAnim }] }
      ]}
    >
      {[0, 1, 2, 3].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.pinDot,
            {
              backgroundColor: currentPIN.length > index 
                ? adaptiveColors.buttonBackground
                : 'transparent',
              borderColor: adaptiveColors.buttonBackground,
              transform: [{ scale: animations.scaleAnim }],
            }
          ]}
        >
          {currentPIN.length > index && (
            <View style={[styles.pinDotInner, { backgroundColor: adaptiveColors.buttonText }]} />
          )}
        </Animated.View>
      ))}
    </Animated.View>
  );

  const renderKeypad = () => (
    <View style={styles.keypadContainer}>
      <View style={styles.keypadGrid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.keypadButton,
              { 
                backgroundColor: adaptiveColors.buttonBackground,
                shadowColor: adaptiveColors.primaryText,
              }
            ]}
            onPress={() => handleKeyPress(num.toString())}
            activeOpacity={0.7}
          >
            <Text style={[styles.keypadButtonText, { color: adaptiveColors.buttonText }]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
        
        <View style={styles.keypadEmpty} />
        
        <TouchableOpacity
          style={[
            styles.keypadButton,
            { 
              backgroundColor: adaptiveColors.buttonBackground,
              shadowColor: adaptiveColors.primaryText,
            }
          ]}
          onPress={() => handleKeyPress('0')}
          activeOpacity={0.7}
        >
          <Text style={[styles.keypadButtonText, { color: adaptiveColors.buttonText }]}>
            0
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.keypadButton,
            styles.deleteButton,
            { 
              borderColor: adaptiveColors.buttonBackground,
              shadowColor: adaptiveColors.primaryText,
            }
          ]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="backspace-outline" 
            size={24} 
            color={adaptiveColors.buttonBackground} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      {uiState.step !== 'old' && !uiState.isFirstTime && (
        <TouchableOpacity 
          style={[
            styles.actionButton,
            styles.backActionButton,
            { 
              borderColor: adaptiveColors.buttonBackground,
              backgroundColor: 'transparent',
              shadowColor: adaptiveColors.primaryText,
            }
          ]} 
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonContent}>
            <Ionicons 
              name="arrow-back" 
              size={18} 
              color={adaptiveColors.buttonBackground} 
              style={styles.backButtonIcon}
            />
            <Text style={[styles.backButtonText, { color: adaptiveColors.buttonBackground }]}>
              Back
            </Text>
          </View>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={[
          styles.actionButton,
          styles.nextActionButton,
          {
            backgroundColor: adaptiveColors.buttonBackground,
            opacity: currentPIN.length === 4 ? 1 : 0.5,
            shadowColor: adaptiveColors.primaryText,
            flex: uiState.step === 'old' || uiState.isFirstTime ? 1 : 0.65,
          }
        ]}
        onPress={uiState.step === 'confirm' ? handleChangePassword : handleNext}
        disabled={currentPIN.length !== 4 || uiState.loading}
        activeOpacity={0.8}
      >
        <View style={styles.nextButtonContent}>
          <Text style={[styles.nextButtonText, { color: adaptiveColors.buttonText }]}>
            {uiState.step === 'confirm' ? 'Change PIN' : 'Next'}
          </Text>
          {uiState.step !== 'confirm' && (
            <Ionicons 
              name="arrow-forward" 
              size={18} 
              color={adaptiveColors.buttonText} 
              style={styles.nextButtonIcon}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  const getStepTitle = () => {
    if (uiState.step === 'success') return 'Success!';
    if (uiState.isFirstTime) {
      return uiState.step === 'new' ? 'Create Your New PIN' : 'Confirm Your New PIN';
    }
    return uiState.step === 'old' ? 'Enter Current PIN' : 
           uiState.step === 'new' ? 'Enter New PIN' : 
           'Confirm New PIN';
  };

  const getStepSubtitle = () => {
    if (uiState.step === 'success') return 'Your PIN has been changed successfully!';
    if (uiState.isFirstTime && uiState.step === 'new') {
      return 'Choose a secure 4-digit PIN that you\'ll remember';
    }
    if (uiState.step === 'new') {
      return 'Choose a secure PIN that\'s different from your current one';
    }
    if (uiState.step === 'confirm') {
      return 'Enter your new PIN again to confirm';
    }
    return 'Enter your current 4-digit PIN';
  };

  if (uiState.step === 'success') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={isDefault ? [adaptiveColors.gradientStart, adaptiveColors.gradientEnd] : gradientColors}
          style={styles.container}
        >
          <StatusBar 
            backgroundColor={isDefault ? adaptiveColors.gradientStart : gradientColors[0]} 
            barStyle={isLightColor(isDefault ? adaptiveColors.gradientStart : gradientColors[0]) ? "dark-content" : "light-content"} 
          />
          
          <View style={styles.mainContainer}>
            <Animated.View 
              style={[
                styles.successContainer,
                { transform: [{ scale: animations.scaleAnim }] }
              ]}
            >
              <View style={[styles.successCard, { backgroundColor: adaptiveColors.cardBackground }]}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={80} 
                  color={adaptiveColors.accentColor || '#4CAF50'} 
                />
                <Text style={[styles.successTitle, { color: adaptiveColors.cardText }]}>
                  {getStepTitle()}
                </Text>
                <Text style={[styles.successSubtitle, { color: adaptiveColors.secondaryText }]}>
                  {getStepSubtitle()}
                </Text>
              </View>
            </Animated.View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={isDefault ? [adaptiveColors.gradientStart, adaptiveColors.gradientEnd] : gradientColors}
        style={styles.container}
      >
        <StatusBar 
          backgroundColor={isDefault ? adaptiveColors.gradientStart : gradientColors[0]} 
          barStyle={isLightColor(isDefault ? adaptiveColors.gradientStart : gradientColors[0]) ? "dark-content" : "light-content"} 
        />
        
        {!uiState.isFirstTime && (
          <TouchableOpacity 
            style={[
              styles.backToSettings, 
              { 
                backgroundColor: adaptiveColors.cardBackground,
                borderColor: adaptiveColors.borderColor,
                shadowColor: adaptiveColors.primaryText,
              }
            ]}
            onPress={() => router.replace('/(mobile)/Settings')}
            activeOpacity={0.7}
          >
            <View style={styles.backToSettingsContent}>
              <Ionicons 
                name="arrow-back" 
                size={20} 
                color={adaptiveColors.cardText} 
                style={styles.backToSettingsIcon}
              />
              <Text style={[styles.backToSettingsText, { color: adaptiveColors.cardText }]}>
                Settings
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.mainContainer}>
          <View style={[styles.contentCard, { backgroundColor: adaptiveColors.cardBackground }]}>
            {renderProgressBar()}

            {uiState.isFirstTime && (
              <View style={styles.welcomeHeader}>
                <Text style={[styles.welcomeTitle, { color: adaptiveColors.cardText }]}>
                  Welcome!
                </Text>
                <Text style={[styles.welcomeSubtitle, { color: adaptiveColors.secondaryText }]}>
                  For your security, let's create a new PIN to replace the default one.
                </Text>
              </View>
            )}

            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: adaptiveColors.cardText }]}>
                {getStepTitle()}
              </Text>
              <Text style={[styles.stepSubtitle, { color: adaptiveColors.secondaryText }]}>
                {getStepSubtitle()}
              </Text>
              
              {uiState.errors.general && (
                <Text style={styles.errorText}>{uiState.errors.general}</Text>
              )}
              {uiState.errors[uiState.step === 'old' ? 'oldPIN' : uiState.step === 'new' ? 'newPIN' : 'confirmPIN'] && (
                <Text style={styles.errorText}>
                  {uiState.errors[uiState.step === 'old' ? 'oldPIN' : uiState.step === 'new' ? 'newPIN' : 'confirmPIN']}
                </Text>
              )}
            </View>

            {renderPINDisplay()}

            {!uiState.loading ? (
              <>
                {renderKeypad()}
                {renderActionButtons()}
              </>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator 
                  size="large" 
                  color={adaptiveColors.buttonBackground} 
                />
                <Text style={[styles.loadingText, { color: adaptiveColors.secondaryText }]}>
                  {uiState.step === 'confirm' ? 'Changing your PIN...' : 'Processing...'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  contentCard: {
    width: '100%',
    maxWidth: 380,
    minHeight: screenHeight * 0.55,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  successCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTrack: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    marginVertical: 20,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  keypadContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    maxWidth: 240,
  },
  keypadButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  keypadButtonText: {
    fontSize: 26,
    fontWeight: '600',
  },
  keypadEmpty: {
    width: 65,
    height: 65,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backActionButton: {
    borderWidth: 2,
    flex: 0.35,
  },
  nextActionButton: {
    // backgroundColor set dynamically
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonIcon: {
    marginRight: 6,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonIcon: {
    marginLeft: 6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  backToSettings: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backToSettingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backToSettingsIcon: {
    marginRight: 6,
  },
  backToSettingsText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChangePassword;