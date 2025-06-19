import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { logoutAction } from '../(redux)/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeManager';


const CustomDrawerContent = React.memo((props) => {
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const dispatch = useDispatch();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [previousThemeState, setPreviousThemeState] = useState(null);
  
  // Get theme context
  const {
    themeType,
    colors,
    getGradientColors,
    getDrawerColors,
    isDefault,
    userTier
  } = useTheme();

  const drawerColors = getDrawerColors();

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
  const handleThemeToggle = (prevState, currentState) => {
    // Silent theme toggle
    
    // Example: Save theme preference to AsyncStorage
    AsyncStorage.setItem('themeToggleHistory', JSON.stringify({
      from: prevState.isDefault ? 'Default Theme' : `${prevState.userTier} Tier Theme`,
      to: currentState.isDefault ? 'Default Theme' : `${currentState.userTier} Tier Theme`,
      toggledAt: new Date().toISOString()
    }));
  };

  // Handler for theme changes within tier themes
  const handleThemeChange = (prevState, currentState) => {
    // Silent theme change
  };

  // Function to determine if tier colors are light or dark
  const isLightTierColor = (tierName) => {
    // Tiers that get darker drawer: silver, diamond
    const darkDrawerTiers = ['silver', 'diamond'];
    // Tiers that get lighter drawer: bronze, gold, roseGold, platinum, sapphire, emerald, ruby
    return darkDrawerTiers.includes(tierName);
  };

  // Get adaptive drawer colors based on theme
  const getAdaptiveDrawerColors = () => {
    if (isDefault) {
      return {
        backgroundColor: '#F8FAFC', // Light gray-blue background instead of dark
        activeTintColor: '#1E40AF', // Darker blue for active items
        inactiveTintColor: '#64748B', // Medium gray for inactive items
        activeBackgroundColor: 'rgba(30, 64, 175, 0.1)', // Light blue highlight
        headerGradient: ['#3B82F6', '#6366F1'] // Lighter blue gradient
      };
    }
    
    // Special case for diamond - light gradient with dark text
    if (userTier === 'diamond') {
      return {
        backgroundColor: colors.primary || '#F7FAFC', // Use tier primary color as base
        gradientBackground: getGradientColors() || [colors.primary, colors.accent], // Tier-specific gradient
        activeTintColor: '#1A202C', // Dark text for active items
        inactiveTintColor: '#2D3748', // Dark gray for inactive items
        activeBackgroundColor: colors.accent || 'rgba(0, 0, 0, 0.1)',
        headerGradient: getGradientColors() || [colors.primary, colors.accent]
      };
    }
    
    // Special case for other premium tiers - gradient background with white text
    if (['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby'].includes(userTier)) {
      return {
        backgroundColor: colors.primary || '#2D3748', // Use tier primary color as base
        gradientBackground: getGradientColors() || [colors.primary, colors.accent], // Tier-specific gradient
        activeTintColor: '#FFFFFF', // White text for active items
        inactiveTintColor: '#E2E8F0', // Light gray for inactive items
        activeBackgroundColor: colors.accent || 'rgba(255, 255, 255, 0.15)',
        headerGradient: getGradientColors() || [colors.primary, colors.accent]
      };
    }
    
    // For tier themes, adapt based on color brightness
    if (isLightTierColor(userTier)) {
      // Light tier colors get darker drawer
      return {
        backgroundColor: colors.dark || '#2D3748',
        activeTintColor: colors.light || '#F7FAFC',
        inactiveTintColor: colors.middle || '#A0AEC0',
        activeBackgroundColor: colors.accent || 'rgba(255, 255, 255, 0.1)',
        headerGradient: getGradientColors() || [colors.primary, colors.accent]
      };
    } else {
      // Dark tier colors get lighter drawer
      return {
        backgroundColor: colors.light || '#F7FAFC',
        activeTintColor: colors.dark || '#2D3748',
        inactiveTintColor: colors.middle || '#4A5568',
        activeBackgroundColor: colors.accent || 'rgba(0, 0, 0, 0.1)',
        headerGradient: getGradientColors() || [colors.primary, colors.accent]
      };
    }
  };

  const adaptiveDrawerColors = getAdaptiveDrawerColors();

  // Get adaptive welcome text color - separate from other drawer colors
  const getAdaptiveWelcomeTextColor = () => {
    if (isDefault) {
      return '#FFFFFF'; // White text for better contrast on gradient background
    }
    
    // For tier themes, adapt based on color brightness
    if (isLightTierColor(userTier)) {
      // Light tier colors get contrasting dark text
      return colors.contrast || '#F7FAFC';
    } else {
      // Dark tier colors get contrasting light text
      return colors.contrast || '#1F2937';
    }
  };

  const welcomeTextColor = getAdaptiveWelcomeTextColor();

  const getIconColor = (itemName) => {
    return selectedItem === itemName ? adaptiveDrawerColors.activeTintColor : adaptiveDrawerColors.inactiveTintColor;
  };

  const icons = {
    Profile: (isSelected) => <Ionicons name="person-circle" size={24} color={getIconColor('Dashboard')} />,
    Settings: (isSelected) => <Ionicons name="settings-sharp" size={24} color={getIconColor('Settings')} />,
    Logout: (isSelected) => <Ionicons name="log-out" size={24} color={getIconColor('Logout')} />,
    Icon: <Ionicons name="menu" size={30} color={adaptiveDrawerColors.activeTintColor} style={{ marginLeft: 10 }} />,
  };
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const getSelectedStyle = (itemName) => {
    return {
      style: selectedItem === itemName ? [styles.selectedItem, {
        backgroundColor: adaptiveDrawerColors.activeBackgroundColor,
      }] : null,
      labelStyle: [
        styles.drawerItemLabel,
        { color: adaptiveDrawerColors.inactiveTintColor },
        selectedItem === itemName ? [styles.selectedItemLabel, {
          color: adaptiveDrawerColors.activeTintColor,
        }] : null
      ]
    };
  };

  const handleItemPress = async (item) => {
    setSelectedItem(item);
    if (item === 'Dashboard') {
      router.push('/MobileDashboard');
    } else if (item === 'Settings') {
      router.push('/Settings');
    } else if (item === 'Logout') {
      handleLogout();
    }
  };

  useEffect(() => {
    const currentRoute = props.state?.routeNames[props.state.index];
    if (currentRoute?.includes('Dashboard')) {
      setSelectedItem('Dashboard');
    } else if (currentRoute?.includes('Settings')) {
      setSelectedItem('Settings');
    }
  }, [props.state]);

  const handleLogout = async () => {
    try {
      // Get the current phone number before clearing data
      const currentPhone = await AsyncStorage.getItem('tempPhone');
      
      // Clear user data but preserve phone number
      await AsyncStorage.multiRemove([
        'userInfo',
        'userData',
        'OTCPIN_DISABLED',
        'savedCredentials'
      ]);

      // If we had a phone number, restore it
      if (currentPhone) {
        await AsyncStorage.setItem('tempPhone', currentPhone);
      }
      
      dispatch(logoutAction());
      router.replace("/authmobile/Login");
    } catch (error) {
      // Silent error handling during logout
    }
  };

  return (
    <DrawerContentScrollView 
      {...props} 
      contentContainerStyle={[styles.drawerContentContainer, {
        backgroundColor: 'transparent', // Make transparent for gradient background
      }]}
    >
      {/* Gradient background for special tiers */}
      {['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'].includes(userTier) && (
        <LinearGradient
          colors={adaptiveDrawerColors.gradientBackground || [adaptiveDrawerColors.backgroundColor, adaptiveDrawerColors.backgroundColor]}
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
      
      {/* Regular background for other tiers */}
      {!['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'].includes(userTier) && (
        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: adaptiveDrawerColors.backgroundColor,
        }} />
      )}
      <LinearGradient
        colors={adaptiveDrawerColors.headerGradient}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
          <View style={styles.profileImageContainer}>
            <Image source={require('../../assets/icon.png')} style={styles.profileImage} />
          </View>
          <Text style={[styles.username, { color: welcomeTextColor }]}>Cooperative</Text>
        </Animated.View>
      </LinearGradient>
      
      <View style={[styles.menuContainer, {
        backgroundColor: ['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'].includes(userTier) 
          ? 'transparent' 
          : adaptiveDrawerColors.backgroundColor,
      }]}>
        <DrawerItem
          icon={() => icons.Profile()}
          label="Dashboard"
          labelStyle={getSelectedStyle('Dashboard').labelStyle}
          onPress={() => handleItemPress('Dashboard')}
          style={[styles.drawerItem, getSelectedStyle('Dashboard').style]}
        />
        
        <DrawerItem
          icon={() => icons.Settings()}
          label="Settings"
          labelStyle={getSelectedStyle('Settings').labelStyle}
          onPress={() => handleItemPress('Settings')}
          style={[styles.drawerItem, getSelectedStyle('Settings').style]}
        />

        <DrawerItem
          icon={() => icons.Logout()}
          label="Logout"
          labelStyle={getSelectedStyle('Logout').labelStyle}
          onPress={() => handleItemPress('Logout')}
          style={[styles.drawerItem, getSelectedStyle('Logout').style]}
        />
      </View>

      {/* Version Control Section */}
      <View style={[styles.versionContainer, {
        backgroundColor: ['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'].includes(userTier) 
          ? 'transparent' 
          : adaptiveDrawerColors.backgroundColor,
        borderTopColor: adaptiveDrawerColors.inactiveTintColor,
      }]}>
        <Text style={[styles.versionText, {
          color: adaptiveDrawerColors.inactiveTintColor,
        }]}>
          Version 1.0.0
        </Text>
        <Text style={[styles.buildText, {
          color: adaptiveDrawerColors.inactiveTintColor,
        }]}>
          Build 2025.06.17
        </Text>
      </View>
    </DrawerContentScrollView>
  );
});

export default function Layout() {
  const [previousThemeState, setPreviousThemeState] = useState(null);
  
  const {
    themeType,
    colors,
    isDefault,
    userTier,
    getHeaderColors
  } = useTheme();

  // Theme toggle listener for main layout
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
        handleHeaderThemeToggle(previousThemeState, currentThemeState);
      }
      // Check if tier theme changed
      else if (previousThemeState.userTier !== userTier || previousThemeState.themeType !== themeType) {
        handleHeaderThemeChange(previousThemeState, currentThemeState);
      }
    }

    // Update previous theme state
    setPreviousThemeState(currentThemeState);
  }, [themeType, isDefault, userTier]);

  // Handler for layout theme toggle
  const handleHeaderThemeToggle = (prevState, currentState) => {
    // Silent theme toggle
    
    // Example: Save theme preference to AsyncStorage
    AsyncStorage.setItem('headerThemeToggleHistory', JSON.stringify({
      from: prevState.isDefault ? 'Default Theme' : `${prevState.userTier} Tier Theme`,
      to: currentState.isDefault ? 'Default Theme' : `${currentState.userTier} Tier Theme`,
      toggledAt: new Date().toISOString()
    }));
  };

  // Handler for layout theme changes
  const handleHeaderThemeChange = (prevState, currentState) => {
    // Silent theme change
  };

  // Get adaptive header colors
  const getAdaptiveHeaderColors = () => {
    if (isDefault) {
      return {
        backgroundColor: '#3B82F6', // Lighter blue header
        tintColor: '#FFFFFF', // Keep white text for contrast
        gradient: ['#3B82F6', '#6366F1'] // Lighter blue gradient
      };
    }
    
    return getHeaderColors() || {
      backgroundColor: colors.primary || '#3B82F6',
      tintColor: colors.contrast || '#fff',
      gradient: [colors.primary, colors.accent] || ['#3B82F6', '#6366F1']
    };
  };

  const headerColors = getAdaptiveHeaderColors();

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: headerColors.backgroundColor,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: headerColors.tintColor,
        headerTitleStyle: {
          fontWeight: '600',
        },
        drawerStyle: [styles.drawerStyle, {
          backgroundColor: isDefault ? '#F8FAFC' : (colors?.surface || '#F8FAFC'),
        }],
        drawerActiveBackgroundColor: 'transparent',
        drawerActiveTintColor: headerColors.tintColor,
        drawerInactiveTintColor: isDefault ? '#64748B' : (colors?.dark || '#64748B'),
        headerShown: true,
        swipeEdgeWidth: 100,
        drawerType: 'slide',
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="MobileDashboard"
        options={{
          drawerLabel: "Dashboard",
          title: "Dashboard",
          headerTitleAlign: 'center',
        }}
      />
      <Drawer.Screen
        name="Settings"
        options={{
          drawerLabel: "Settings",
          title: "Settings",
          headerTitleAlign: 'center',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContentContainer: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  profileImageContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  drawerItem: {
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 4,
  },
  drawerItemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedItem: {
    transform: [{ scale: 1.02 }],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedItemLabel: {
    fontWeight: '600',
  },
  drawerStyle: {
    width: 250,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 20,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  versionContainer: {
    padding: 16,
    borderTopWidth: 1,
    marginTop: 'auto',
    alignItems: 'center',
    opacity: 0.8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
  buildText: {
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.7,
  },
});
