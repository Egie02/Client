import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'expo-router';  
import { aboutData, privacyData } from './settingsContent';
import { useTheme } from '../../theme/ThemeManager';
import ThemeToggle from '../../components/ThemeToggle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TutorialModal from '../components/TutorialModal';
import { LinearGradient } from 'expo-linear-gradient';
import { useOTCPINStatus } from '../(services)/hooks/useOTCPINStatus';

const Settings = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [showTutorial, setShowTutorial] = useState(false);
  const [previousThemeState, setPreviousThemeState] = useState(null);
  
  // Use optimized OTCPIN status hook
  const { shouldShowChangePIN, isLoading: isOTCPINLoading } = useOTCPINStatus();
  
  // Get theme context
  const {
    themeType,
    colors,
    getGradientColors,
    isDefault,
    userTier
  } = useTheme();

  const gradientColors = getGradientColors();

  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const tutorialSteps = [
    {
      title: 'Welcome to Settings',
      description: 'This is your settings page where you can customize your app experience and access important information.'
    },
    {
      title: 'Appearance',
      description: 'Use the theme toggle to switch between light and dark modes, or choose a special theme based on your membership tier.'
    },
    {
      title: 'Information',
      description: 'Access important information about the cooperative, including our mission, vision, and data privacy policies.'
    },
    {
      title: 'Security',
      description: 'Change your PIN to keep your account secure. This option is only available when PIN security is enabled.'
    }
  ];



  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const tutorialShown = await AsyncStorage.getItem('settings_tutorial_shown');
        if (!tutorialShown) {
          setShowTutorial(true);
        }
      } catch (error) {
        // Silent error handling
      }
    };
    
    checkTutorialStatus();
  }, []);

  // Theme toggle listener
  useEffect(() => {
    const currentThemeState = {
      themeType,
      isDefault,
      userTier
    };

    // Only trigger listener if this isn't the initial render
    if (previousThemeState !== null) {
      // Check if theme was toggled between default and tier theme
      if (previousThemeState.isDefault !== isDefault) {
        handleThemeToggle(previousThemeState, currentThemeState);
      }
      // Check if tier theme changed
      else if (previousThemeState.userTier !== userTier || previousThemeState.themeType !== themeType) {
        handleThemeChange(previousThemeState, currentThemeState);
      }
    }

    // Update previous theme state
    setPreviousThemeState(currentThemeState);
  }, [themeType, isDefault, userTier]);

  // Handler for theme toggle between default and tier themes
  const handleThemeToggle = async (prevState, currentState) => {
    // Silent theme toggle
    const newTheme = themeType === THEME_TYPES.DEFAULT ? THEME_TYPES.TIER : THEME_TYPES.DEFAULT;
    await switchTheme(newTheme);
    
    // Example: Save theme preference to AsyncStorage
    AsyncStorage.setItem('theme_preference', JSON.stringify({
      isDefault: currentState.isDefault,
      themeType: currentState.themeType,
      userTier: currentState.userTier,
      toggledAt: new Date().toISOString()
    })).catch(error => {
      // Silent error handling
    });
  };

  // Handler for theme changes within tier themes
  const handleThemeChange = (prevState, currentState) => {
    // Silent theme change
  };

  // Function to determine if tier colors are light or dark
  const isLightTierColor = (tierName) => {
    const lightTiers = ['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'];
    return lightTiers.includes(tierName);
  };

  // Get adaptive background color based on tier
  const getAdaptiveBackgroundColor = () => {
    if (isDefault) {
      return '#E0F7FA'; // Default background
    }
    
    // Special tier-based backgrounds for premium tiers
    if (['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'].includes(userTier)) {
      return 'transparent'; // Use transparent for gradient background
    }
    
    // For other tier themes, adapt based on color brightness
    if (isLightTierColor(userTier)) {
      // Light tier colors get darker background
      return colors.dark || '#2D3748';
    } else {
      // Dark tier colors get lighter background  
      return colors.light || '#F7FAFC';
    }
  };

  // Get adaptive text color for main background
  const getAdaptiveTextColor = () => {
    if (isDefault) {
      return '#444'; // Default text color
    }
    
    if (isLightTierColor(userTier)) {
      // Dark background needs light text
      return colors.light || '#F7FAFC';
    } else {
      // Light background needs dark text
      return colors.dark || '#2D3748';
    }
  };

  const toggleAbout = () => {
    setShowAbout(!showAbout);
    setShowPrivacy(false);
  };

  const togglePrivacy = () => {
    setShowPrivacy(!showPrivacy);
    setShowAbout(false);
  };

  const renderAboutContent = () => {
    return (
      <View style={[styles.contentContainer, isDefault ? null : {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }]}>
        <Text style={[styles.mainTitle, isDefault ? null : {
          color: colors.dark,
        }]}>{aboutData.cooperative_name}</Text>
        
        {/* Historical Background */}
        <View style={[styles.section, isDefault ? null : {
          backgroundColor: colors.light,
        }]}>
          <Text style={[styles.sectionTitle, isDefault ? null : {
            color: colors.middle,
          }]}>Historical Background</Text>
          <Text style={[styles.sectionText, isDefault ? null : {
            color: colors.dark,
          }]}>
            {aboutData.historical_background.origin}
          </Text>
        </View>

        {/* Mission, Vision, Goal */}
        {[
          { title: aboutData.mission, content: aboutData.micontent.content },
          { title: aboutData.vision, content: aboutData.vcontent.content },
          { title: aboutData.goal, content: aboutData.gcontent.content }
        ].map((item, index) => (
          <View key={index} style={[styles.section, isDefault ? null : {
            backgroundColor: colors.light,
          }]}>
            <Text style={[styles.sectionTitle, isDefault ? null : {
              color: colors.middle,
            }]}>{item.title}</Text>
            <Text style={[styles.sectionText, isDefault ? null : {
              color: colors.dark,
            }]}>{item.content}</Text>
          </View>
        ))}

        {/* Cooperative Principles */}
        <View style={[styles.section, isDefault ? null : {
          backgroundColor: colors.light,
        }]}>
          <Text style={[styles.sectionTitle, isDefault ? null : {
            color: colors.middle,
          }]}>{aboutData.core}</Text>
          {Object.values(aboutData.cvcontent).map((value, index) => (
            <Text key={index} style={[styles.bulletPoint, isDefault ? null : {
              color: colors.dark,
            }]}>• {value}</Text>
          ))}
        </View>

        {/* Membership Information */}
        <View style={[styles.section, isDefault ? null : {
          backgroundColor: colors.light,
        }]}>
          <Text style={[styles.sectionTitle, isDefault ? null : {
            color: colors.middle,
          }]}>{aboutData.membership}</Text>
          {Object.values(aboutData.membershipContent).map((value, index) => (
            <Text key={index} style={[styles.bulletPoint, isDefault ? null : {
              color: colors.dark,
            }]}>• {value}</Text>
          ))}
        </View>

        {/* Services Offered */}
        <View style={[styles.section, isDefault ? null : {
          backgroundColor: colors.light,
        }]}>
          <Text style={[styles.sectionTitle, isDefault ? null : {
            color: colors.middle,
          }]}>{aboutData.services}</Text>
          {Object.values(aboutData.servicesContent).map((value, index) => (
            <Text key={index} style={[styles.bulletPoint, isDefault ? null : {
              color: colors.dark,
            }]}>• {value}</Text>
          ))}
        </View>

        {/* Key Achievements */}
        <View style={[styles.section, isDefault ? null : {
          backgroundColor: colors.light,
        }]}>
          <Text style={[styles.sectionTitle, isDefault ? null : {
            color: colors.middle,
          }]}>{aboutData.achievements}</Text>
          {Object.values(aboutData.achievementsContent).map((value, index) => (
            <Text key={index} style={[styles.bulletPoint, isDefault ? null : {
              color: colors.dark,
            }]}>• {value}</Text>
          ))}
        </View>

        {/* Governance Structure */}
        <View style={[styles.section, isDefault ? null : {
          backgroundColor: colors.light,
        }]}>
          <Text style={[styles.sectionTitle, isDefault ? null : {
            color: colors.middle,
          }]}>{aboutData.governance}</Text>
          {Object.values(aboutData.governanceContent).map((value, index) => (
            <Text key={index} style={[styles.bulletPoint, isDefault ? null : {
              color: colors.dark,
            }]}>• {value}</Text>
          ))}
        </View>
      </View>
    );
  };

  const renderPrivacyContent = () => {
    return (
      <View style={[styles.contentContainer, isDefault ? null : {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }]}>
        <Text style={[styles.mainTitle, isDefault ? null : {
          color: colors.dark,
        }]}>{privacyData.title}</Text>
        
        <View style={[styles.section, isDefault ? null : {
          backgroundColor: colors.light,
        }]}>
          <Text style={[styles.sectionText, isDefault ? null : {
            color: colors.dark,
          }]}>{privacyData.introduction}</Text>
        </View>

        {privacyData.sections.map((section, index) => (
          <View key={index} style={[styles.section, isDefault ? null : {
            backgroundColor: colors.light,
          }]}>
            <Text style={[styles.sectionTitle, isDefault ? null : {
              color: colors.middle,
            }]}>{section.title}</Text>
            {section.content.map((item, idx) => (
              <Text key={idx} style={[styles.bulletPoint, isDefault ? null : {
                color: colors.dark,
              }]}>• {item}</Text>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderAboutView = () => {
    return (
      <View style={[styles.container, {
        backgroundColor: getAdaptiveBackgroundColor(),
      }]}>
        {/* Tier-specific gradient background for special tiers */}
        {['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'].includes(userTier) && (
          <LinearGradient
            colors={gradientColors}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {renderAboutContent()}
        </ScrollView>
        <TouchableOpacity
          style={[styles.button, styles.closeButton, isDefault ? null : {
            backgroundColor: colors.middle,
          }]}
          onPress={toggleAbout}
        >
          <Text style={[styles.buttonText, isDefault ? null : {
            color: colors.contrast,
          }]}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPrivacyView = () => {
    return (
      <View style={[styles.container, {
        backgroundColor: getAdaptiveBackgroundColor(),
      }]}>
        {/* Tier-specific gradient background for special tiers */}
        {['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'].includes(userTier) && (
          <LinearGradient
            colors={gradientColors}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {renderPrivacyContent()}
        </ScrollView>
        <TouchableOpacity
          style={[styles.button, styles.closeButton, isDefault ? null : {
            backgroundColor: colors.middle,
          }]}
          onPress={togglePrivacy}
        >
          <Text style={[styles.buttonText, isDefault ? null : {
            color: colors.contrast,
          }]}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMainView = () => {
    return (
      <View style={[styles.container, {
        backgroundColor: getAdaptiveBackgroundColor(),
      }]}>
        {/* Tier-specific gradient background for special tiers */}
        {['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'].includes(userTier) && (
          <LinearGradient
            colors={gradientColors}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <TutorialModal
          visible={showTutorial}
          onClose={() => setShowTutorial(false)}
          steps={tutorialSteps}
          storageKey="settings_tutorial_shown"
          onComplete={() => setShowTutorial(false)}
        />

        {/* Theme Toggle Section */}
        <View style={styles.themeSection}>
          <Text style={[styles.sectionHeaderText, {
            color: getAdaptiveTextColor(),
          }]}>Appearance</Text>
          <ThemeToggle 
            style={styles.themeToggleContainer}
            showLabel={true}
            compact={false}
          />
        </View>

        {/* Settings Buttons */}
        <View style={styles.buttonsSection}>
          <Text style={[styles.sectionHeaderText, {
            color: getAdaptiveTextColor(),
          }]}>Information</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.aboutButton, isDefault ? null : {
              backgroundColor: colors.middle,
            }]} 
            onPress={toggleAbout}
          >
            <Text style={[styles.buttonText, isDefault ? null : {
              color: colors.contrast,
            }]}>About Us</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.privacyButton, isDefault ? null : {
              backgroundColor: colors.accent,
            }]} 
            onPress={togglePrivacy}
          >
            <Text style={[styles.buttonText, isDefault ? null : {
              color: colors.contrast,
            }]}>Data Privacy</Text>
          </TouchableOpacity>
        </View>

        {/* Security Section - Show Change PIN when OTCPIN is GRANTED */}
        {(shouldShowChangePIN || isOTCPINLoading) && (
          <View style={styles.buttonsSection}>
            <Text style={[styles.sectionHeaderText, {
              color: getAdaptiveTextColor(),
            }]}>Security</Text>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.changePINButton, 
                isDefault ? null : {
                  backgroundColor: colors.primary,
                },
                isOTCPINLoading && { opacity: 0.6 }
              ]} 
              onPress={() => router.push('/(mobile)/ChangePassword')}
              disabled={isOTCPINLoading}
            >
              <Text style={[styles.buttonText, isDefault ? null : {
                color: colors.contrast,
              }]}>
                {isOTCPINLoading ? 'Loading...' : 'Change PIN'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (showAbout) return renderAboutView();
  if (showPrivacy) return renderPrivacyView();
  return renderMainView();
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA', // This will be overridden by adaptive color
    padding: 20,
  },
  scrollView: {
    flex: 1,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#444', // This will be overridden by adaptive color
    marginBottom: 30,
    textAlign: 'center',
  },
  themeSection: {
    marginBottom: 30,
  },
  buttonsSection: {
    marginBottom: 20,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444', // This will be overridden by adaptive color
    marginBottom: 16,
    marginLeft: 4,
  },
  themeToggleContainer: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutButton: {
    backgroundColor: '#3F51B5',
  },
  privacyButton: {
    backgroundColor: '#00796B',
  },
  changePINButton: {
    backgroundColor: '#FF5722',
  },
  closeButton: {
    backgroundColor: '#3F51B5',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  section: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#303F9F',
    marginBottom: 10,
    textAlign: 'left',
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
    textAlign: 'justify',
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
    marginLeft: 10,
    marginBottom: 5,
  },
});

