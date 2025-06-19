import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { manualLoadUser } from "../(redux)/authSlice";
import ProtectedRoute from "../../components/ProtectedRoute";
import { getUserData, transformUserData, validateUserData } from '../../utils/userDataSchema';
import { useTheme, THEME_TYPES } from '../../theme/ThemeManager';
import { 
  Text, 
  View, 
  ScrollView, 
  Alert, 
  Image, 
  BackHandler, 
  RefreshControl, 
  useWindowDimensions, 
  TouchableOpacity,
  Animated,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { layoutStyles, dashboardStyles as styles } from './style';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TutorialModal from '../components/TutorialModal';
import * as LocalAuthentication from 'expo-local-authentication';

import { getBiometricCredentials } from '../(services)/api/api';


// Simple barcode generation without external dependencies

// Preset profile pictures configuration
const PRESET_PROFILES = [
  {
    id: 'default',
    name: 'Default Avatar',
    icon: 'account-circle',
    type: 'icon'
  },
  {
    id: 'business-male',
    name: 'Business (Male)',
    icon: 'account-tie',
    type: 'icon'
  },
  {
    id: 'business-female',
    name: 'Business (Female)',
    icon: 'account-tie-hat',
    type: 'icon'
  },
  {
    id: 'casual-male',
    name: 'Casual (Male)',
    icon: 'account',
    type: 'icon'
  },
  {
    id: 'casual-female',
    name: 'Casual (Female)',
    icon: 'account-outline',
    type: 'icon'
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: 'account-supervisor',
    type: 'icon'
  },
  {
    id: 'star',
    name: 'Star Member',
    icon: 'account-star',
    type: 'icon'
  },
  {
    id: 'heart',
    name: 'VIP Member',
    icon: 'account-heart',
    type: 'icon'
  },
  {
    id: 'crown',
    name: 'Premium',
    icon: 'crown',
    type: 'icon'
  },
  {
    id: 'diamond',
    name: 'Elite',
    icon: 'diamond-stone',
    type: 'icon'
  }
];

// Custom Barcode Component for React Native (using Views)
const CustomBarcode = ({ value, width = 280, height = 100 }) => {
  const [barcodePattern, setBarcodePattern] = useState([]);

  useEffect(() => {
    if (value && value.trim() !== '') {
      try {
        // Generate a simple barcode pattern using character encoding
        const chars = value.split('');
        const totalBars = chars.length * 10; // 10 bars per character
        const barWidth = Math.max(1, Math.floor((width - 40) / totalBars));
        const barcodeHeight = height - 40;
        const pattern = [];
        
        chars.forEach((char, charIndex) => {
          const charCode = char.charCodeAt(0);
          
          // Create a pattern based on character code
          for (let i = 0; i < 10; i++) {
            const bit = (charCode + i) % 3; // Create varying pattern
            const isBar = bit > 0;
            
            if (isBar) {
              pattern.push({
                left: charIndex * 10 * barWidth + i * barWidth + 20,
                width: barWidth,
                height: barcodeHeight,
              });
            }
          }
        });

        setBarcodePattern(pattern);
      } catch (error) {
        setBarcodePattern([]);
      }
    } else {
      setBarcodePattern([]);
    }
  }, [value, width, height]);

  if (!barcodePattern || barcodePattern.length === 0) {
    return (
      <View style={{
        width: width,
        height: height,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
      }}>
        <MaterialCommunityIcons name="barcode" size={height * 0.4} color="#CBD5E1" />
        <Text style={{
          fontSize: 12,
          color: '#CBD5E1',
          marginTop: 4,
        }}>
          No barcode data
        </Text>
      </View>
    );
  }

  return (
    <View style={{
      width: width,
      height: height,
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
    }}>
      {/* Barcode Title */}
      <Text style={{
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 8,
        fontWeight: '600',
      }}>
        DIGITAL CERTIFICATE
      </Text>
      
      {/* Barcode Pattern */}
      <View style={{
        width: width - 20,
        height: height - 40,
        backgroundColor: '#FFFFFF',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
      }}>
        {barcodePattern.map((bar, index) => (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: bar.left,
              top: 10,
              width: bar.width,
              height: bar.height,
              backgroundColor: '#000000',
            }}
          />
        ))}
        
        {/* Start and End Guards */}
        <View style={{
          position: 'absolute',
          left: 10,
          top: 10,
          width: 2,
          height: height - 40,
          backgroundColor: '#000000',
        }} />
        <View style={{
          position: 'absolute',
          right: 10,
          top: 10,
          width: 2,
          height: height - 40,
          backgroundColor: '#000000',
        }} />
      </View>
      
      {/* Certificate ID */}
      <Text style={{
        fontSize: 9,
        color: '#374151',
        marginTop: 6,
        fontFamily: 'monospace',
        letterSpacing: 1,
      }}>
        {value}
      </Text>
    </View>
  );
};

const MobileDashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [activeLoanCategory, setActiveLoanCategory] = useState('Regular');
  const { user, loading, error } = useSelector((state) => state.auth);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [dailyRefreshCount, setDailyRefreshCount] = useState(0);
  const [refreshLimitReached, setRefreshLimitReached] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

  // Get theme context
  const {
    themeType,
    colors: themeColors,
    getGradientColors,
    isDefault,
    userTier,
    tierInfo
  } = useTheme();

  // Determine if we should use tier styling
  const useTierStyling = themeType === THEME_TYPES.TIER;
  const gradientColors = getGradientColors();

  // Function to determine if tier colors are light or dark
  const isLightTierColor = (tierName) => {
    const lightTiers = ['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'];
    return lightTiers.includes(tierName);
  };

  // Get adaptive background color based on tier
  const getAdaptiveBackgroundColor = () => {
    if (isDefault) {
      return '#F8FAFC'; // Default background
    }
    
    // Special tier-based backgrounds for premium tiers
    if (['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'].includes(userTier)) {
      return themeColors.primary || '#2D3748'; // Use tier primary color as base
    }
    
    // For other tier themes, adapt based on color brightness
    if (isLightTierColor(userTier)) {
      // Light tier colors get darker background
      return themeColors.dark || '#2D3748';
    } else {
      // Dark tier colors get lighter background  
      return themeColors.light || '#F7FAFC';
    }
  };

  // Get adaptive text color for main background
  const getAdaptiveTextColor = () => {
    if (isDefault) {
      return '#1F2937'; // Default text color
    }
    
    if (isLightTierColor(userTier)) {
      // Dark background needs light text
      return themeColors.light || '#F7FAFC';
    } else {
      // Light background needs dark text
      return themeColors.dark || '#2D3748';
    }
  };

  // Get adaptive text color for header elements (welcome text, date, etc.)
  const getHeaderTextColor = (element) => {
    if (isDefault) {
      return element === 'welcome' ? '#1F2937' : '#6B7280';
    }

    switch (userTier) {
      case 'silver':
        // Silver tier: dark text on light gradient
        return element === 'welcome' ? '#2D3748' : '#4A5568';
      
      case 'gold':
        // Gold tier: white text for better contrast on gold gradient
        return element === 'welcome' ? '#FFFFFF' : '#F7FAFC';
      
      case 'roseGold':
        // Rose Gold tier: white text for better contrast on rose gold gradient
        return element === 'welcome' ? '#FFFFFF' : '#F7FAFC';
      
      case 'platinum':
      case 'sapphire':
      case 'emerald':
      case 'ruby':
        // Dark tier colors: white text on dark gradient
        return element === 'welcome' ? '#FFFFFF' : '#F7FAFC';
      
      case 'diamond':
        // Diamond tier: elegant black text
        return element === 'welcome' ? '#1A202C' : '#2D3748';
      
      default:
        // Bronze and other tiers
        return element === 'welcome' ? themeColors.contrast : themeColors.light;
    }
  };

  // Get adaptive text color for tabs
  const getTabTextColor = (isActive) => {
    if (isDefault) {
      return isActive ? '#FFFFFF' : '#0F172A';
    }

    switch (userTier) {
      case 'silver':
        // Silver tier: dark text, white when active
        return isActive ? '#FFFFFF' : '#2D3748';
      
      case 'gold':
      case 'roseGold':
        // Light tier colors: dark text, white when active
        return isActive ? '#FFFFFF' : '#2D3748';
      
      case 'diamond':
        // Diamond tier: white when selected, black when unselected
        return isActive ? '#FFFFFF' : '#1A202C';
      
      default:
        // Other tiers use theme colors
        return isActive ? themeColors.contrast : themeColors.middle;
    }
  };

  // Get diamond tier special styling
  const getDiamondStyling = () => {
    if (userTier !== 'diamond') return {};
    
    return {
      shadowColor: '#E2E8F0',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    };
  };

  // Animation values
  const [scaleAnims] = useState(() => ({
    Profile: new Animated.Value(1),
    Savings: new Animated.Value(1),
    Shares: new Animated.Value(1),
    Loans: new Animated.Value(1),
    More: new Animated.Value(1),
  }));

  const tabs = [
    { 
      id: 'Profile', 
      label: 'Profile',
      color: useTierStyling ? themeColors.middle : '#0F172A'
    },
    { 
      id: 'Savings', 
      label: 'Savings',
      color: useTierStyling ? themeColors.middle : '#0F172A'
    },
    { 
      id: 'Shares', 
      label: 'Shares',
      color: useTierStyling ? themeColors.middle : '#0F172A'
    },
    { 
      id: 'Loans', 
      label: 'Loans',
      color: useTierStyling ? themeColors.middle : '#0F172A'
    },
    { 
      id: 'More', 
      label: 'More',
      color: useTierStyling ? themeColors.middle : '#0F172A'
    },
  ];

  // Generate loan categories from schema configuration
  const loanCategories = [
    'Regular', 'Additional', 'Appliances', 'Grocery', 'Quick', 'Other'
  ].map(categoryId => {
    const config = transformUserData.getLoanCategoryConfig(categoryId);
    return {
      id: categoryId,
      icon: config.icon,
      label: config.label.replace(' Loan', '') // Keep it short for display
    };
  });



  // Enhanced Daily refresh limit management with tier-based limits
  const getTierRefreshLimit = () => {
    // Define different limits based on user tier
    const tierLimits = {
      'bronze': 5,
      'silver': 8,
      'gold': 12,
      'roseGold': 15,
      'platinum': 20,
      'sapphire': 25,
      'emerald': 30,
      'ruby': 35,
      'diamond': 50,
    };
    
    return tierLimits[userTier] || 10; // Default limit for basic users
  };
  
  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const getMinimumRefreshInterval = () => {
    // Minimum time between refreshes in milliseconds (30 seconds)
    return 30 * 1000;
  };

  const canRefreshNow = () => {
    if (!lastRefreshTime) return true;
    
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;
    return timeSinceLastRefresh >= getMinimumRefreshInterval();
  };

  const checkAndUpdateDailyRefreshCount = async () => {
    try {
      const today = getTodayDateString();
      const currentLimit = getTierRefreshLimit();
      const storedData = await AsyncStorage.getItem('dailyRefreshData');
      
      if (storedData) {
        const { date, count, lastRefresh } = JSON.parse(storedData);
        
        if (date === today) {
          // Same day, check if limit reached
          setDailyRefreshCount(count);
          setRefreshLimitReached(count >= currentLimit);
          setLastRefreshTime(lastRefresh || null);
          
          // Check both daily limit and minimum interval
          const withinDailyLimit = count < currentLimit;
          const passedMinInterval = !lastRefresh || (Date.now() - lastRefresh) >= getMinimumRefreshInterval();
          
          return withinDailyLimit && passedMinInterval;
        } else {
          // New day, reset counter
          const newData = { date: today, count: 0, lastRefresh: null };
          await AsyncStorage.setItem('dailyRefreshData', JSON.stringify(newData));
          setDailyRefreshCount(0);
          setRefreshLimitReached(false);
          setLastRefreshTime(null);
          return true;
        }
      } else {
        // No stored data, create new
        const newData = { date: today, count: 0, lastRefresh: null };
        await AsyncStorage.setItem('dailyRefreshData', JSON.stringify(newData));
        setDailyRefreshCount(0);
        setRefreshLimitReached(false);
        setLastRefreshTime(null);
        return true;
      }
    } catch (error) {
      console.warn('Error checking refresh count:', error);
      // On error, allow refresh but don't count it
      return true;
    }
  };

  const incrementRefreshCount = async () => {
    try {
      const today = getTodayDateString();
      const currentLimit = getTierRefreshLimit();
      const now = Date.now();
      const storedData = await AsyncStorage.getItem('dailyRefreshData');
      
      if (storedData) {
        const { date, count } = JSON.parse(storedData);
        
        if (date === today) {
          const newCount = count + 1;
          const newData = { date: today, count: newCount, lastRefresh: now };
          await AsyncStorage.setItem('dailyRefreshData', JSON.stringify(newData));
          setDailyRefreshCount(newCount);
          setRefreshLimitReached(newCount >= currentLimit);
          setLastRefreshTime(now);
        }
      }
    } catch (error) {
      console.warn('Error incrementing refresh count:', error);
    }
  };

  const getRemainingRefreshes = () => {
    const currentLimit = getTierRefreshLimit();
    return Math.max(0, currentLimit - dailyRefreshCount);
  };

  const getTimeUntilNextRefresh = () => {
    if (!lastRefreshTime) return 0;
    
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;
    const minInterval = getMinimumRefreshInterval();
    
    return Math.max(0, minInterval - timeSinceLastRefresh);
  };

  const formatTimeRemaining = (milliseconds) => {
    if (milliseconds <= 0) return '';
    
    const seconds = Math.ceil(milliseconds / 1000);
    return `${seconds}s`;
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    // Animate the pressed tab
    Animated.sequence([
      Animated.timing(scaleAnims[tabId], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[tabId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onRefresh = React.useCallback(async () => {
    // Enhanced refresh limit system with tier-based limits and rate limiting
    const canRefresh = await checkAndUpdateDailyRefreshCount();
    const currentLimit = getTierRefreshLimit();
    const timeUntilNext = getTimeUntilNextRefresh();
    
    if (!canRefresh) {
      if (refreshLimitReached) {
        Alert.alert(
          'Daily Limit Reached',
          `You have reached your daily limit of ${currentLimit} refreshes for ${userTier || 'basic'} tier. Please try again tomorrow.\n\nUpgrade your tier for higher limits!`,
          [{ text: 'OK' }]
        );
      } else if (timeUntilNext > 0) {
        Alert.alert(
          'Rate Limited',
          `Please wait ${formatTimeRemaining(timeUntilNext)} before refreshing again to protect our servers.`,
          [{ text: 'OK' }]
        );
      }
      return;
    }

    setRefreshing(true);
    try {
      await dispatch(manualLoadUser());
      
      // Increment the count only after successful refresh
      await incrementRefreshCount();
      
      // Show tier-aware remaining refreshes warning
      const remaining = getRemainingRefreshes();
      if (remaining <= 3 && remaining > 0) {
        const upgradeMessage = userTier === 'bronze' || !userTier ? 
          '\n\nTip: Upgrade your tier for higher daily limits!' : '';
        
        Alert.alert(
          'Refresh Limit Notice',
          `You have ${remaining} refresh${remaining === 1 ? '' : 'es'} remaining today for ${userTier || 'basic'} tier.${upgradeMessage}`,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to refresh user data. Please try again.');
    }
    setRefreshing(false);
  }, [dispatch, refreshLimitReached, userTier, lastRefreshTime, dailyRefreshCount]);

  const userInfoMapping = transformUserData.getUserInfoMapping(user, isPhoneVisible);

  // Helper function to format numbers with commas
  const formatNumber = (number) => {
    if (!number || isNaN(number)) return "0.00";
    return parseFloat(number).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Helper function to format large amounts with abbreviations and dynamic styling
  const formatStatisticAmount = (number) => {
    if (!number || isNaN(number)) return { amount: "0.00", fontSize: 15 };
    
    const num = parseFloat(number);
    let formattedAmount;
    let fontSize = 15; // Default font size
    
    if (num >= 1000000000) {
      // Billions
      formattedAmount = (num / 1000000000).toFixed(1) + "B";
      fontSize = 15;
    } else if (num >= 1000000) {
      // Millions
      formattedAmount = (num / 1000000).toFixed(1) + "M";
      fontSize = 15;
    } else if (num >= 100000) {
      // Large amounts (100k+) - use smaller font
      formattedAmount = formatNumber(num);
      fontSize = 13;
    } else if (num >= 10000) {
      // Medium amounts (10k+) - use medium font
      formattedAmount = formatNumber(num);
      fontSize = 14;
    } else {
      // Small amounts - use default font
      formattedAmount = formatNumber(num);
      fontSize = 15;
    }
    
    return { amount: formattedAmount, fontSize };
  };

  const getLoanAmount = (category) => {
    return parseFloat(getUserData.getLoanAmount(user, category)) || 0;
  };

  const getLoanStatus = (category) => {
    return getUserData.getLoanPayment(user, category);
  };

  const getLoanRemarks = (category) => {
    return getUserData.getLoanDeduction(user, category);
  };

  // Get loan summary using the new schema helper
  const getLoanSummary = (category) => {
    return transformUserData.getLoanSummary(user, category);
  };

  // Helper functions for More tab
  const getTotalAssets = () => {
    const totalAssets = transformUserData.calculateTotalAssets(user);
    return formatStatisticAmount(totalAssets);
  };

  const getTotalLoans = () => {
    const totalLoans = transformUserData.calculateTotalLoans(user);
    return formatStatisticAmount(totalLoans);
  };

  const renderLoanDetails = (category) => {
    const loanSummary = getLoanSummary(category);
    const loanAmount = parseFloat(loanSummary.amount) || 0;
    
    if (loanAmount === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="cash" size={48} color="#94A3B8" />
          <Text style={styles.emptyStateText}>No active {category.toLowerCase()} loans</Text>
        </View>
      );
    }

    // Special handling for Quick loans
    if (category === 'Quick') {
      const remarksValue = getUserData.getQuickLoanRemarks(user);
      const shouldHideRemarksValue = remarksValue === "No Data" || remarksValue === "N/A";
      
      return (
        <View style={[styles.loanDetailsCard, useTierStyling && {
          backgroundColor: themeColors.middle,
          borderColor: themeColors.border,
        }]}>
          <View style={[styles.loanDetailRow, {color: useTierStyling ? themeColors.contrast : '#303481'}]}>
            <Text style={[styles.loanDetailLabel, useTierStyling && {
              color: themeColors.contrast,
            }]}>Remarks:</Text>
            {!shouldHideRemarksValue && (
              <Text style={[styles.loanDetailValue, { textAlign: 'right', flex: 1 }, useTierStyling && {
                color: themeColors.contrast,
              }]}>
                {remarksValue}
              </Text>
            )}
          </View>
        </View>
      );
    }

    // For Grocery and Other loans, show deduction amount
    if (category === 'Grocery' || category === 'Other') {
      const deductionAmount = loanSummary.deduction;
      
      return (
        <View style={[styles.loanDetailsCard, useTierStyling && {
          backgroundColor: themeColors.middle,
          borderColor: themeColors.border,
        }]}>
          <View style={[styles.loanDetailRow, {color: useTierStyling ? themeColors.contrast : '#303481'}]}>
            <Text style={[styles.loanDetailLabel, useTierStyling && {
              color: themeColors.contrast,
            }]}>Deduction Amount:</Text>
            <Text style={[styles.loanDetailValue, useTierStyling && {
              color: themeColors.contrast,
            }]}>₱{formatNumber(deductionAmount)}</Text>
          </View>
        </View>
      );
    }

    // For Regular, Additional, and Appliances loans, show deduction amount
    return (
      <View style={[styles.loanDetailsCard, useTierStyling && {
        backgroundColor: themeColors.middle,
        borderColor: themeColors.border,
      }]}>
        <View style={[styles.loanDetailRow, {color: useTierStyling ? themeColors.contrast : '#303481'}]}>
          <Text style={[styles.loanDetailLabel, useTierStyling && {
            color: themeColors.contrast,
          }]}>Deduction Amount:</Text>
          <Text style={[styles.loanDetailValue, useTierStyling && {
            color: themeColors.contrast,
          }]}>₱{formatNumber(loanSummary.deduction)}</Text>
        </View>
      </View>
    );
  };

  const renderLoansContent = () => (
    <View style={styles.contentContainer}>
      <View style={[styles.balanceCard, useTierStyling && {
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.balanceLabel, useTierStyling && {
            color: themeColors.dark,
          }]}>
            {transformUserData.getLoanCategoryConfig(activeLoanCategory).balanceLabel}
          </Text>
          {activeLoanCategory === 'Quick' ? (
            <TouchableOpacity
              style={{
                padding: 4,
                borderRadius: 4,
                backgroundColor: useTierStyling ? themeColors.middle : '#303481',
              }}
              onPress={() => {
                try {
                  router.push({
                    pathname: '/(mobile)/Quickterm',
                  });
                } catch (err) {
                  Alert.alert('Navigation Error', 'Unable to view quick loan details at this time.');
                }
              }}
            >
              <MaterialCommunityIcons name="chart-bar" size={16} color="#F8FAFC" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                padding: 4,
                borderRadius: 4,
                backgroundColor: useTierStyling ? themeColors.middle : '#303481',
              }}
              onPress={() => {
                Alert.alert('Amortization', 'This feature is coming soon and currently under development.');
              }}
            >
              <MaterialCommunityIcons name="calculator" size={16} color="#F8FAFC" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.balanceRow}>
          <View style={styles.balanceInfo}>
            <Text style={[styles.balanceAmount, useTierStyling && {
              color: themeColors.dark,
            }]}>₱{formatNumber(getLoanAmount(activeLoanCategory))}</Text>
          </View>
          {transformUserData.getLoanCategoryConfig(activeLoanCategory).showPayment && (
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentText}>Payment</Text>
              <Text style={styles.paymentValue}>{getLoanStatus(activeLoanCategory)}</Text>
            </View>
          )}
          {transformUserData.getLoanCategoryConfig(activeLoanCategory).showTerms && (
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentText}>Terms</Text>
              <Text style={styles.paymentValue}>{getUserData.getQuickLoanTermsCount(user)}</Text>
            </View>
          )}
        </View>
        {activeLoanCategory === 'Quick' && (
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            {(() => {
              const statusValue = getUserData.getQuickLoanStatus(user);
              const shouldHideStatusValue = statusValue === "Default" || statusValue === "N/A";
              
              if (shouldHideStatusValue) {
                return (
                  <Text style={styles.paymentText}>Status</Text>
                );
              } else {
                return (
                  <Text style={[styles.paymentText, styles.paymentValue]}>
                    Status: {statusValue}
                  </Text>
                );
              }
            })()}
          </View>
        )}
      </View>

      <ScrollView 
        horizontal={false} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.loanCategoriesContainer}
      >
        {loanCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.loanCategoryButton,
              activeLoanCategory === category.id && [styles.activeLoanCategory, useTierStyling && {
                backgroundColor: themeColors.middle,
                borderColor: themeColors.middle,
              }],
            ]}
            onPress={() => setActiveLoanCategory(category.id)}
          >
            <MaterialCommunityIcons
              name={category.icon}
              size={24}
              style={[
                styles.loanCategoryIcon,
                activeLoanCategory === category.id && [styles.activeLoanCategoryIcon, useTierStyling && {
                  color: themeColors.contrast,
                }],
              ]}
            />
            <Text style={[
              styles.loanCategoryText,
              activeLoanCategory === category.id && [styles.activeLoanCategoryText, useTierStyling && {
                color: themeColors.contrast,
              }],
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {(() => {
        const categoryConfig = transformUserData.getLoanCategoryConfig(activeLoanCategory);
        const loanDisplayInfo = transformUserData.getLoanDisplayInfo(user, activeLoanCategory);
        
        // Don't show transaction section for empty loans
        if (loanDisplayInfo.isEmpty) return null;
        
        // Show transaction section for all categories that have details to display
        const shouldShowSection = categoryConfig.showDeduction || categoryConfig.showTerms;
        
        return shouldShowSection ? (
          <View style={styles.transactionSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, useTierStyling && {
                color: themeColors.dark,
              }]}>
                {loanDisplayInfo.title}:
              </Text>
            </View>
            {renderLoanDetails(activeLoanCategory)}
          </View>
        ) : null;
      })()}
    </View>
  );

  // Get tier-based profile image configuration
  const getTierProfileConfig = () => {
    const configs = {
      bronze: {
        mainIcon: 'account-circle',
        accentIcon: 'medal',
        backgroundColor: ['#92400E', '#B45309'],
        iconColor: '#FFFFFF',
        borderColor: '#92400E',
        accentColor: '#D97706',
        layout: 'simple'
      },
      silver: {
        mainIcon: 'account-star',
        accentIcon: 'star-outline',
        backgroundColor: ['#64748B', '#94A3B8'],
        iconColor: '#FFFFFF',
        borderColor: '#64748B',
        accentColor: '#CBD5E1',
        layout: 'dual'
      },
      gold: {
        mainIcon: 'account-heart',
        accentIcon: 'crown-outline',
        backgroundColor: ['#D97706', '#F59E0B'],
        iconColor: '#FFFFFF',
        borderColor: '#D97706',
        accentColor: '#FCD34D',
        layout: 'crowned'
      },
      roseGold: {
        mainIcon: 'account-heart-outline',
        accentIcon: 'flower-outline',
        backgroundColor: ['#EC4899', '#F472B6'],
        iconColor: '#FFFFFF',
        borderColor: '#EC4899',
        accentColor: '#FBCFE8',
        layout: 'elegant'
      },
      platinum: {
        mainIcon: 'account-star-outline',
        accentIcon: 'diamond-outline',
        backgroundColor: ['#475569', '#64748B'],
        iconColor: '#FFFFFF',
        borderColor: '#475569',
        accentColor: '#E2E8F0',
        layout: 'premium'
      },
      sapphire: {
        mainIcon: 'account-supervisor-circle',
        accentIcon: 'water',
        backgroundColor: ['#1E40AF', '#2563EB'],
        iconColor: '#FFFFFF',
        borderColor: '#1E40AF',
        accentColor: '#DBEAFE',
        layout: 'royal'
      },
      emerald: {
        mainIcon: 'account-cash',
        accentIcon: 'leaf',
        backgroundColor: ['#059669', '#10B981'],
        iconColor: '#FFFFFF',
        borderColor: '#059669',
        accentColor: '#A7F3D0',
        layout: 'nature'
      },
      ruby: {
        mainIcon: 'account-tie',
        accentIcon: 'fire',
        backgroundColor: ['#DC2626', '#EF4444'],
        iconColor: '#FFFFFF',
        borderColor: '#DC2626',
        accentColor: '#FECACA',
        layout: 'executive'
      },
      diamond: {
        mainIcon: 'account-tie-hat',
        accentIcon: 'diamond-stone',
        backgroundColor: ['#1E293B', '#334155'],
        iconColor: '#FFFFFF',
        borderColor: '#1E293B',
        accentColor: '#F1F5F9',
        layout: 'luxury'
      }
    };

    return configs[userTier] || configs.bronze;
  };

  // Load saved profile picture on component mount
  useEffect(() => {
    const loadProfilePicture = async () => {
      try {
        const savedPreset = await AsyncStorage.getItem('selectedPreset');
        if (savedPreset) {
          setSelectedPreset(savedPreset);
        }
      } catch (error) {
        // Silent error handling
      }
    };
    
    loadProfilePicture();
  }, []);

  // Function to select a preset profile
  const selectPreset = async (presetId) => {
    try {
      setSelectedPreset(presetId);
      await AsyncStorage.setItem('selectedPreset', presetId);
      setShowImageModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to select preset. Please try again.');
    }
  };

  // Function to reset profile image
  const resetProfileImage = async () => {
    try {
      setSelectedPreset('default');
      await AsyncStorage.setItem('selectedPreset', 'default');
      setShowImageModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to reset profile picture. Please try again.');
    }
  };



    // Render profile image modal
  const renderProfileImageModal = () => (
    <Modal
      visible={showImageModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowImageModal(false)}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'flex-end',
      }}>
        <View style={{
          backgroundColor: useTierStyling ? themeColors.surface : '#FFFFFF',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 8,
          paddingBottom: 24,
          paddingHorizontal: 20,
          maxHeight: '85%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 12,
        }}>
          {/* Handle Bar */}
          <View style={{
            width: 40,
            height: 4,
            backgroundColor: useTierStyling ? themeColors.border : '#D1D5DB',
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 20,
          }} />

          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            paddingHorizontal: 4,
          }}>
            <View style={{ width: 32 }} />
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: useTierStyling ? themeColors.dark : '#1F2937',
              textAlign: 'center',
            }}>
              Choose Avatar
            </Text>
            <TouchableOpacity
              onPress={() => setShowImageModal(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: useTierStyling ? themeColors.light : '#F3F4F6',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons 
                name="close" 
                size={18} 
                color={useTierStyling ? themeColors.dark : '#6B7280'} 
              />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Current Profile Preview */}
            <View style={{
              marginBottom: 32,
              alignItems: 'center',
              backgroundColor: useTierStyling ? themeColors.light : '#F8FAFC',
              paddingVertical: 20,
              paddingHorizontal: 24,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: useTierStyling ? themeColors.border : '#E5E7EB',
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: useTierStyling ? themeColors.dark : '#374151',
                marginBottom: 12,
              }}>
                Current Avatar
              </Text>
              <View style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                backgroundColor: useTierStyling ? themeColors.middle : '#303481',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 4,
                borderColor: useTierStyling ? themeColors.surface : '#FFFFFF',
                shadowColor: useTierStyling ? themeColors.dark : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <MaterialCommunityIcons
                  name={PRESET_PROFILES.find(p => p.id === selectedPreset)?.icon || 'account-circle'}
                  size={45}
                  color={useTierStyling ? themeColors.contrast : '#FFFFFF'}
                />
              </View>
              <Text style={{
                fontSize: 14,
                color: useTierStyling ? themeColors.dark : '#6B7280',
                marginTop: 8,
                fontWeight: '500',
              }}>
                {PRESET_PROFILES.find(p => p.id === selectedPreset)?.name || 'Default Avatar'}
              </Text>
            </View>

            {/* Preset Selection Section */}
            <View style={{
              marginBottom: 24,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: useTierStyling ? themeColors.dark : '#1F2937',
                marginBottom: 4,
                textAlign: 'center',
              }}>
                Choose New Avatar
              </Text>
              <Text style={{
                fontSize: 14,
                color: useTierStyling ? themeColors.dark : '#6B7280',
                marginBottom: 20,
                textAlign: 'center',
                opacity: 0.8,
              }}>
                Select from our collection of preset avatars
              </Text>
              
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: 12,
              }}>
                {PRESET_PROFILES.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => selectPreset(item.id)}
                    style={{
                      width: '30%',
                      alignItems: 'center',
                      padding: 12,
                      borderRadius: 16,
                      backgroundColor: selectedPreset === item.id
                        ? (useTierStyling ? themeColors.light : '#EEF2FF')
                        : (useTierStyling ? themeColors.surface : '#FAFBFC'),
                      borderWidth: selectedPreset === item.id ? 2 : 1,
                      borderColor: selectedPreset === item.id
                        ? (useTierStyling ? themeColors.middle : '#3B82F6')
                        : (useTierStyling ? themeColors.border : '#E5E7EB'),
                      shadowColor: selectedPreset === item.id ? (useTierStyling ? themeColors.middle : '#3B82F6') : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: selectedPreset === item.id ? 0.2 : 0,
                      shadowRadius: 4,
                      elevation: selectedPreset === item.id ? 2 : 0,
                      transform: [{ scale: selectedPreset === item.id ? 1.02 : 1 }],
                    }}
                  >
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: selectedPreset === item.id
                        ? (useTierStyling ? themeColors.middle : '#3B82F6')
                        : (useTierStyling ? themeColors.light : '#F3F4F6'),
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 8,
                      shadowColor: selectedPreset === item.id ? (useTierStyling ? themeColors.dark : '#000') : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: selectedPreset === item.id ? 0.15 : 0,
                      shadowRadius: 4,
                      elevation: selectedPreset === item.id ? 2 : 0,
                    }}>
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={28}
                        color={selectedPreset === item.id
                          ? (useTierStyling ? themeColors.contrast : '#FFFFFF')
                          : (useTierStyling ? themeColors.dark : '#6B7280')
                        }
                      />
                    </View>
                    <Text style={{
                      fontSize: 10,
                      color: selectedPreset === item.id 
                        ? (useTierStyling ? themeColors.dark : '#1F2937')
                        : (useTierStyling ? themeColors.dark : '#6B7280'),
                      textAlign: 'center',
                      numberOfLines: 2,
                      fontWeight: selectedPreset === item.id ? '600' : '500',
                      lineHeight: 12,
                    }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Preset Profiles Section - Under Development */}
            <View style={{
              marginBottom: 24,
              opacity: 0.6,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: useTierStyling ? themeColors.dark : '#1F2937',
                  textAlign: 'center',
                  marginRight: 8,
                }}>
                  Custom Preset Profiles
                </Text>
                <View style={{
                  backgroundColor: '#FEF3C7',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#F59E0B',
                }}>
                  <Text style={{
                    fontSize: 10,
                    color: '#92400E',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}>
                    Coming Soon
                  </Text>
                </View>
              </View>
              <Text style={{
                fontSize: 14,
                color: useTierStyling ? themeColors.dark : '#6B7280',
                marginBottom: 16,
                textAlign: 'center',
                opacity: 0.8,
              }}>
                Create your own custom avatar collections
              </Text>
              
              <View style={{
                backgroundColor: useTierStyling ? themeColors.light : '#F8FAFC',
                borderRadius: 16,
                borderWidth: 2,
                borderColor: useTierStyling ? themeColors.border : '#E5E7EB',
                borderStyle: 'dashed',
                paddingVertical: 24,
                paddingHorizontal: 20,
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Background Pattern */}
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.05,
                }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {[...Array(20)].map((_, i) => (
                      <MaterialCommunityIcons
                        key={i}
                        name="account-plus"
                        size={24}
                        color={useTierStyling ? themeColors.dark : '#6B7280'}
                        style={{ margin: 8 }}
                      />
                    ))}
                  </View>
                </View>

                <MaterialCommunityIcons
                  name="account-multiple-plus"
                  size={48}
                  color={useTierStyling ? themeColors.middle : '#9CA3AF'}
                  style={{ marginBottom: 12 }}
                />
                
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: useTierStyling ? themeColors.dark : '#374151',
                  textAlign: 'center',
                  marginBottom: 8,
                }}>
                  Custom Avatar Creation
                </Text>
                
                <Text style={{
                  fontSize: 13,
                  color: useTierStyling ? themeColors.dark : '#6B7280',
                  textAlign: 'center',
                  lineHeight: 18,
                  marginBottom: 16,
                }}>
                  Soon you'll be able to create your own{'\n'}
                  personalized avatar collections with{'\n'}
                  custom colors, styles, and themes
                </Text>

                {/* Feature Preview Cards */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  width: '100%',
                  marginBottom: 16,
                }}>
                  {[
                    { icon: 'palette', label: 'Custom Colors' },
                    { icon: 'brush', label: 'Style Editor' },
                    { icon: 'account-box', label: 'Profile Themes' },
                  ].map((feature, index) => (
                    <View
                      key={index}
                      style={{
                        alignItems: 'center',
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: 'rgba(156,163,175,0.3)',
                        minWidth: 70,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={feature.icon}
                        size={20}
                        color={useTierStyling ? themeColors.middle : '#9CA3AF'}
                        style={{ marginBottom: 4 }}
                      />
                      <Text style={{
                        fontSize: 9,
                        color: useTierStyling ? themeColors.dark : '#6B7280',
                        textAlign: 'center',
                        fontWeight: '500',
                      }}>
                        {feature.label}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  disabled={true}
                  style={{
                    backgroundColor: useTierStyling ? themeColors.border : '#E5E7EB',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                    opacity: 0.7,
                  }}
                >
                  <Text style={{
                    color: useTierStyling ? themeColors.dark : '#6B7280',
                    fontSize: 14,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                    Under Development
                  </Text>
                </TouchableOpacity>

                {/* Progress Indicator */}
                <View style={{
                  marginTop: 12,
                  alignItems: 'center',
                }}>
                  <Text style={{
                    fontSize: 11,
                    color: useTierStyling ? themeColors.dark : '#9CA3AF',
                    marginBottom: 4,
                  }}>
                    Development Progress
                  </Text>
                  <View style={{
                    width: 120,
                    height: 4,
                    backgroundColor: 'rgba(156,163,175,0.3)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}>
                    <View style={{
                      width: '35%',
                      height: '100%',
                      backgroundColor: '#F59E0B',
                      borderRadius: 2,
                    }} />
                  </View>
                  <Text style={{
                    fontSize: 10,
                    color: useTierStyling ? themeColors.dark : '#9CA3AF',
                    marginTop: 4,
                  }}>
                    35% Complete
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: useTierStyling ? themeColors.border : '#E5E7EB',
          }}>
            <TouchableOpacity
              onPress={resetProfileImage}
              style={{
                backgroundColor: useTierStyling ? themeColors.light : '#F3F4F6',
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 12,
                flex: 1,
                borderWidth: 1,
                borderColor: useTierStyling ? themeColors.border : '#D1D5DB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Text style={{
                color: useTierStyling ? themeColors.dark : '#374151',
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center',
              }}>
                Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowImageModal(false)}
              style={{
                backgroundColor: useTierStyling ? themeColors.middle : '#3B82F6',
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 12,
                flex: 1,
                shadowColor: useTierStyling ? themeColors.middle : '#3B82F6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text style={{
                color: useTierStyling ? themeColors.contrast : '#FFFFFF',
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center',
              }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render tier-specific profile image
  const renderTierProfileImage = () => {
    const config = getTierProfileConfig();
    
    // Show preset or tier-based icon
    const presetProfile = PRESET_PROFILES.find(p => p.id === selectedPreset);
    const iconName = presetProfile?.icon || config.mainIcon;
    
    return (
      <TouchableOpacity
        onPress={() => setShowImageModal(true)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={config.backgroundColor}
          style={[
            styles.profileImage,
            {
              borderColor: config.borderColor,
              borderWidth: 4,
              justifyContent: 'center',
              alignItems: 'center',
            },
            userTier === 'diamond' && {
              shadowColor: '#1E293B',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 12,
            },
            (userTier === 'ruby' || userTier === 'emerald') && {
              shadowColor: config.borderColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={userTier === 'diamond' ? 65 : 60}
            color={config.iconColor}
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderProfileContent = () => (
    <View style={styles.profileSection}>
      {renderTierProfileImage()}
      <View style={{ width: '100%' }}>
        {Object.entries(userInfoMapping).map(([key, value]) => (
          <View key={key} style={[styles.infoRow, useTierStyling && {
            borderBottomColor: themeColors.border,
          }]}>
            <Text style={[styles.infoLabel, useTierStyling && {
              color: themeColors.dark,
            }]}>{key}</Text>
            {key === 'Phone' ? (
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.infoValue, useTierStyling && {
                  color: themeColors.dark,
                }]}>{value}</Text>
                <TouchableOpacity 
                  onPress={() => setIsPhoneVisible(!isPhoneVisible)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name={isPhoneVisible ? 'eye-off' : 'eye'}
                    size={20}
                    color={useTierStyling ? themeColors.accent : "#64748B"}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.infoValue, useTierStyling && {
                color: themeColors.dark,
              }]}>{value}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderSavingsContent = () => (
    <View style={styles.contentContainer}>
      <View style={[styles.balanceCard, useTierStyling && {
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }]}>
        <Text style={[styles.balanceLabel, useTierStyling && {
          color: themeColors.dark,
        }]}>Available Balance</Text>
        <View style={styles.balanceRow}>
          <Text style={[styles.balanceAmount, useTierStyling && {
            color: themeColors.dark,
          }]}>
            ₱{formatNumber(getUserData.getSavings(user))}
          </Text>
          <Text style={styles.savingsStatus}>
             {getUserData.getSavingsPayments(user)}
          </Text>
        </View>
      </View>

      <View style={styles.transactionSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, useTierStyling && {
            color: themeColors.dark,
          }]}>Savings Deposit: </Text>
        </View>
        <View style={[styles.loanDetailsCard, useTierStyling && {
          backgroundColor: themeColors.middle,
          borderColor: themeColors.border,
        }]}>
          <View style={styles.loanDetailRow}>
            <Text style={[styles.loanDetailLabel, useTierStyling && {
              color: themeColors.contrast,
            }]}>Amount</Text>
            <Text style={[styles.loanDetailValue, useTierStyling && {
              color: themeColors.contrast,
            }]}>
              ₱{formatNumber(getUserData.getSavingsDeposit(user))}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSharesContent = () => (
    <View style={styles.contentContainer}>
      <View style={[styles.balanceCard, useTierStyling && {
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }]}>
        <Text style={[styles.balanceLabel, useTierStyling && {
          color: themeColors.dark,
        }]}>Available Balance</Text>
        <View style={styles.balanceRow}>
          <Text style={[styles.balanceAmount, useTierStyling && {
            color: themeColors.dark,
          }]}>
            ₱{formatNumber(getUserData.getShares(user))}
          </Text>
          <Text style={styles.savingsStatus}>
            {getUserData.getSharesPayments(user)}
          </Text>
        </View>
      </View>

      <View style={styles.transactionSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, useTierStyling && {
            color: themeColors.dark,
          }]}>Shares Deposit: </Text>
        </View>
        <View style={[styles.loanDetailsCard, useTierStyling && {
          backgroundColor: themeColors.middle,
          borderColor: themeColors.border,
        }]}>
          <View style={styles.loanDetailRow}>
            <Text style={[styles.loanDetailLabel, useTierStyling && {
              color: themeColors.contrast,
            }]}>Amount</Text>
            <Text style={[styles.loanDetailValue, useTierStyling && {
              color: themeColors.contrast,
            }]}>
              ₱{formatNumber(getUserData.getSharesDeposit(user))}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderMoreContent = () => (
    <View style={[styles.moreContentContainer, { paddingVertical: 8 }]}>
      {/* Account Statistics Card */}
      <View style={[styles.accountStatsCard, { marginBottom: 12, paddingVertical: 16 }, useTierStyling && {
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }]}>
        <View style={styles.accountStatsHeader}>
          <Text style={[styles.accountStatsTitle, { fontSize: 16 }, useTierStyling && {
            color: themeColors.dark,
          }]}>Account Statistics</Text>
          <MaterialCommunityIcons 
            name="chart-line" 
            size={20} 
            color={useTierStyling ? themeColors.accent : "#64748B"} 
            style={styles.accountStatsIcon}
          />
        </View>
        
        <View style={[styles.statsRowSingle, { marginTop: 8 }]}>
          <View style={styles.statItemColumn}>
            <Text style={[styles.statValue, { fontSize: Math.min(getTotalAssets().fontSize, 14) }, useTierStyling && {
              color: themeColors.dark,
            }]}>
              ₱{getTotalAssets().amount}
            </Text>
            <Text style={[styles.statLabelUnder, { fontSize: 11 }]}>Total Assets</Text>
          </View>

          <View style={styles.statItemColumn}>
            <Text style={[styles.statValue, { fontSize: Math.min(getTotalLoans().fontSize, 14) }, useTierStyling && {
              color: themeColors.dark,
            }]}>
              ₱{getTotalLoans().amount}
            </Text>
            <Text style={[styles.statLabelUnder, { fontSize: 11 }]}>Total Loans</Text>
          </View>
        </View>
      </View>

      {/* CoopHealth Card */}
      <View style={[styles.coopHealthCard, { marginBottom: 12, paddingVertical: 12 }, useTierStyling && {
        backgroundColor: themeColors.middle,
      }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <MaterialCommunityIcons name="medical-bag" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={[styles.coopHealthTitle, { fontSize: 14 }]}>CoopHealth</Text>
        </View>
        <Text style={[styles.coopHealthSubtitle, { fontSize: 11, marginBottom: 6 }]}>Deduction</Text>
        <View style={styles.coopHealthRow}>
          <Text style={[styles.coopHealthLabel, { fontSize: 12 }]}>Health Deduction</Text>
          <Text style={[styles.coopHealthValue, { fontSize: 12 }]}>₱{formatNumber(getUserData.getHealthDeduction(user))}</Text>
        </View>
      </View>

      {/* Digital Certificate Card */}
      <View style={[styles.digitalCertCard, { paddingVertical: 12 }, useTierStyling && {
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }]}>
        {(() => {
          const digitalCert = getUserData.getDigitalCertificate(user);
          const hasValidCert = digitalCert && digitalCert !== "No Data" && digitalCert.trim() !== "";
          
          if (hasValidCert) {
            return (
              <>
                              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <MaterialCommunityIcons 
                  name="barcode-scan" 
                  size={24} 
                  color={useTierStyling ? themeColors.middle : "#303481"} 
                  style={{ marginBottom: 6 }} 
                />
                <Text style={[styles.digitalCertTitle, { fontSize: 14 }, useTierStyling && {
                  color: themeColors.dark,
                }]}>Digital Barcode Certificate</Text>
                <Text style={{
                  fontSize: 11,
                  color: '#64748B',
                  textAlign: 'center',
                  marginTop: 2,
                }}>
                  Tap to view barcode
                </Text>
              </View>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: useTierStyling ? themeColors.middle : '#303481',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => setShowQRModal(true)}
                >
                  <MaterialCommunityIcons 
                    name="barcode" 
                    size={28} 
                    color={useTierStyling ? themeColors.contrast : "#FFFFFF"} 
                    style={{ marginBottom: 6 }}
                  />
                  <Text style={{
                    color: useTierStyling ? themeColors.contrast : '#FFFFFF',
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 3,
                  }}>
                    View Barcode
                  </Text>
                  <Text style={{
                    color: useTierStyling ? themeColors.light : '#E2E8F0',
                    fontSize: 11,
                  }}>
                    ID: {digitalCert.substring(0, 7)}•••••
                  </Text>
                </TouchableOpacity>
                
                <View style={{
                  backgroundColor: useTierStyling ? themeColors.light : '#F1F5F9',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  alignItems: 'center',
                }}>
                  <Text style={{
                    fontSize: 10,
                    color: useTierStyling ? themeColors.dark : '#475569',
                    fontWeight: '500',
                  }}>
                    ✓ Verified Certificate
                  </Text>
                </View>
              </>
            );
          } else {
            return (
              <>
                <View style={{ alignItems: 'center', marginBottom: 12 }}>
                  <MaterialCommunityIcons 
                    name="certificate-outline" 
                    size={40} 
                    color="#CBD5E1" 
                  />
                  <Text style={[styles.digitalCertTitle, { fontSize: 14 }, useTierStyling && {
                    color: themeColors.dark,
                  }]}>Digital Certificate</Text>
                  <Text style={{
                    fontSize: 11,
                    color: '#94A3B8',
                    textAlign: 'center',
                    marginTop: 2,
                  }}>
                    No certificate available
                  </Text>
                </View>
                
                <View style={{
                  backgroundColor: '#F8FAFC',
                  padding: 16,
                  borderRadius: 10,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#E2E8F0',
                  borderStyle: 'dashed',
                }}>
                  <MaterialCommunityIcons 
                    name="file-document-outline" 
                    size={32} 
                    color="#CBD5E1" 
                  />
                  <Text style={{
                    fontSize: 11,
                    color: '#94A3B8',
                    textAlign: 'center',
                    marginTop: 6,
                  }}>
                    Certificate not issued
                  </Text>
                </View>
              </>
            );
          }
        })()}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile':
        return renderProfileContent();
      case 'Savings':
        return renderSavingsContent();
      case 'Shares':
        return renderSharesContent();
      case 'Loans':
        return renderLoansContent();
      case 'More':
        return renderMoreContent();
      default:
        return renderProfileContent();
    }
  };

  const [showQRModal, setShowQRModal] = useState(false);

  const tutorialSteps = [
    {
      title: 'Welcome to Dashboard',
      description: 'This is your main dashboard where you can access all the important features of the app.'
    },
    {
      title: 'Quick Access',
      description: 'Use the quick access buttons to navigate to frequently used features like Quick Term and Settings.'
    },
    {
      title: 'Navigation',
      description: 'Swipe or use the navigation buttons to move between different sections of the dashboard.'
    }
  ];

  useEffect(() => {
    // Don't auto-load user data, let user manually refresh
    global.selectedDrawerItem = 'Transaction';
    
    // Initialize daily refresh count with enhanced system
    checkAndUpdateDailyRefreshCount();
    
    if (getUserData.getChangePassword(user) === 1) {
      router.push('/ChangePassword');
    }

    const backAction = async () => {
      if (isBiometricAvailable && hasSavedCredentials) {
        const isAuthenticated = await handleBiometricAuth();
        if (!isAuthenticated) {
          return true; // Prevent going back if authentication fails
        }
      }
      setShowExitConfirmation(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    const checkFirstTimeUser = async () => {
      try {
        const isFirstTime = await AsyncStorage.getItem('dashboard_tutorial_shown');
        const hasVisitedBefore = await AsyncStorage.getItem('dashboard_visited_before');
        
        if (!isFirstTime) {
          setShowTutorial(true);
        }
        
        // Check if user has visited dashboard before
        if (hasVisitedBefore) {
          setIsFirstTimeUser(false);
        } else {
          // Mark that user has now visited the dashboard
          await AsyncStorage.setItem('dashboard_visited_before', 'true');
          setIsFirstTimeUser(true);
        }
      } catch (error) {
        // Silent error handling
        setIsFirstTimeUser(false); // Default to returning user on error
      }
    };

    checkFirstTimeUser();

    return () => {
      backHandler.remove();
    };
  }, [dispatch]);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(hasHardware && isEnrolled);
    } catch (error) {
      // Silent error handling
      setIsBiometricAvailable(false);
    }
  };

  const checkSavedCredentials = async () => {
    try {
      const credentials = await getBiometricCredentials();
      setHasSavedCredentials(!!credentials);
    } catch (error) {
      // Silent error handling
      setHasSavedCredentials(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const credentials = await getBiometricCredentials();
      if (!credentials) {
        Alert.alert(
          'No Saved Credentials',
          'Please login with your phone number and PIN first to enable biometric authentication.',
          [{ text: 'OK' }]
        );
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Biometric authentication successful
        return true;
      } else {
        // Biometric authentication failed
        Alert.alert(
          'Authentication Failed',
          'Please try again or use your PIN to login.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      // Silent error handling
      Alert.alert(
        'Authentication Error',
        'Biometric authentication failed. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: ['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'].includes(userTier) 
          ? 'transparent' 
          : getAdaptiveBackgroundColor(),
      }]}>
        {/* Tier-specific gradient background for loading state */}
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
        <MaterialCommunityIcons name="loading" size={48} color="#6366F1" />
        <Text style={{ 
          marginTop: 16, 
          color: getAdaptiveTextColor(),
        }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: ['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'].includes(userTier) 
          ? 'transparent' 
          : getAdaptiveBackgroundColor(),
      }]}>
        {/* Tier-specific gradient background for error state */}
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
        <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
        <Text style={{ 
          color: '#EF4444', 
          marginTop: 16 
        }}>Error: {error}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <View style={[styles.container, {
          backgroundColor: ['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'].includes(userTier) 
            ? 'transparent' 
            : getAdaptiveBackgroundColor(),
        }]}>
          {/* Tier-specific gradient background for no user state */}
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
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
            <MaterialCommunityIcons name="refresh" size={64} color="#6366F1" />
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              marginTop: 16, 
              textAlign: 'center',
              color: getAdaptiveTextColor(),
            }}>
              Welcome to iQuery MMPC
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: getAdaptiveTextColor(), 
              marginTop: 8, 
              textAlign: 'center',
              opacity: 0.7,
            }}>
              Pull down to refresh and load your account data
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: refreshLimitReached ? '#9CA3AF' : '#6366F1',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                marginTop: 20,
                opacity: refreshLimitReached ? 0.6 : 1,
              }}
              onPress={refreshLimitReached ? null : onRefresh}
              disabled={refreshLimitReached}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>
                {refreshLimitReached ? 'Daily Limit Reached' : 'Load Data'}
              </Text>
            </TouchableOpacity>
            
            {/* Enhanced refresh status info */}
            <View style={{
              marginTop: 12,
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: 'rgba(99, 102, 241, 0.2)',
            }}>
              <Text style={{
                fontSize: 12,
                color: getAdaptiveTextColor(),
                textAlign: 'center',
                opacity: 0.8,
              }}>
                Daily refreshes: {dailyRefreshCount}/{getTierRefreshLimit()} ({userTier || 'basic'} tier)
              </Text>
              {refreshLimitReached && (
                <Text style={{
                  fontSize: 11,
                  color: '#EF4444',
                  textAlign: 'center',
                  marginTop: 2,
                }}>
                  Limit reached - try again tomorrow
                </Text>
              )}
            </View>
          </View>
        </View>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <View style={[styles.container, {
        backgroundColor: ['silver', 'gold', 'roseGold', 'platinum', 'sapphire', 'emerald', 'ruby', 'diamond'].includes(userTier) 
          ? 'transparent' 
          : getAdaptiveBackgroundColor(),
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={getAdaptiveTextColor()}
            />
          }
        >
          {useTierStyling ? (
            <LinearGradient
              colors={gradientColors}
              style={[styles.headerSection, {
                paddingVertical: 20,
                paddingHorizontal: 20,
                borderRadius: 16,
                marginBottom: 16,
              }, getDiamondStyling()]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.welcomeText, {
                color: getHeaderTextColor('welcome'),
                textShadowColor: userTier === 'diamond' ? 'transparent' : 'rgba(0,0,0,0.1)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: userTier === 'diamond' ? 0 : 2,
                fontSize: userTier === 'diamond' ? 26 : 24,
                fontWeight: userTier === 'diamond' ? '700' : '600',
              }]}>{isFirstTimeUser ? 'Welcome!' : 'Welcome back!'}</Text>
              <Text style={[styles.dateText, {
                color: getHeaderTextColor('date'),
                fontSize: userTier === 'diamond' ? 16 : 14,
                opacity: userTier === 'diamond' ? 1 : 0.8,
              }]}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              
              {/* Enhanced Daily Refresh Counter */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: userTier === 'diamond' ? 'rgba(0,0,0,0.1)' : (useTierStyling ? themeColors.light : 'rgba(255,255,255,0.2)'),
              }}>
                <MaterialCommunityIcons
                  name="refresh"
                  size={14}
                  color={getHeaderTextColor('date')}
                  style={{ marginRight: 6 }}
                />
                <Text style={{
                  fontSize: 12,
                  color: getHeaderTextColor('date'),
                  opacity: 0.8,
                }}>
                  Daily refreshes: {dailyRefreshCount}/{getTierRefreshLimit()} ({userTier || 'basic'})
                </Text>
                {refreshLimitReached && (
                  <View style={{
                    marginLeft: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderRadius: 8,
                  }}>
                    <Text style={{
                      fontSize: 10,
                      color: '#EF4444',
                      fontWeight: '500',
                    }}>
                      LIMIT REACHED
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Tier Info */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: userTier === 'diamond' ? 'rgba(0,0,0,0.1)' : themeColors.light,
              }}>
                <MaterialCommunityIcons
                  name={userTier === 'diamond' ? 'diamond-stone' : 'star'}
                  size={userTier === 'diamond' ? 18 : 16}
                  color={getHeaderTextColor('welcome')}
                  style={{ marginRight: 8 }}
                />
                <Text style={{
                  fontSize: userTier === 'diamond' ? 16 : 14,
                  fontWeight: userTier === 'diamond' ? '700' : '600',
                  color: getHeaderTextColor('welcome'),
                  letterSpacing: userTier === 'diamond' ? 1 : 0,
                }}>
                  {tierInfo?.label || 'Bronze Member'}
                </Text>
                {userTier === 'diamond' && (
                  <View style={{
                    marginLeft: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRadius: 12,
                  }}>
                    <Text style={{
                      fontSize: 10,
                      color: '#1A202C',
                      fontWeight: '600',
                      letterSpacing: 0.5,
                    }}>
                      ELITE
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.headerSection}>
              <Text style={styles.welcomeText}>{isFirstTimeUser ? 'Welcome!' : 'Welcome back!'}</Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              
              {/* Enhanced Daily Refresh Counter */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: '#E5E7EB',
              }}>
                <MaterialCommunityIcons
                  name="refresh"
                  size={14}
                  color="#6B7280"
                  style={{ marginRight: 6 }}
                />
                <Text style={{
                  fontSize: 12,
                  color: '#6B7280',
                }}>
                  Daily refreshes: {dailyRefreshCount}/{getTierRefreshLimit()} ({userTier || 'basic'})
                </Text>
                {refreshLimitReached && (
                  <View style={{
                    marginLeft: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                  }}>
                    <Text style={{
                      fontSize: 10,
                      color: '#EF4444',
                      fontWeight: '500',
                    }}>
                      LIMIT REACHED
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={[styles.tabsContainer, useTierStyling && {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          }, userTier === 'diamond' && {
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: 'rgba(226,232,240,0.8)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }]}>
            {tabs.map((tab) => (
              <Animated.View
                key={tab.id}
                style={[
                  { transform: [{ scale: scaleAnims[tab.id] }] }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === tab.id && [styles.activeTab, useTierStyling && {
                      backgroundColor: userTier === 'diamond' ? 'rgba(30,41,59,0.9)' : themeColors.middle,
                    }, userTier === 'diamond' && {
                      shadowColor: '#1E293B',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }],
                  ]}
                  onPress={() => handleTabPress(tab.id)}
                >
                  <Text style={[
                    styles.tabLabel,
                    { color: useTierStyling ? getTabTextColor(false) : tab.color },
                    activeTab === tab.id && [styles.activeTabLabel, useTierStyling && {
                      color: getTabTextColor(true),
                    }],
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <View style={[styles.mainCard, useTierStyling && {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          }, userTier === 'diamond' && {
            backgroundColor: 'rgba(255,255,255,0.98)',
            borderColor: 'rgba(226,232,240,0.6)',
            borderWidth: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          }]}>
            {renderContent()}
          </View>
        </ScrollView>

        {/* Barcode Modal */}
        <Modal
          visible={showQRModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowQRModal(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
            <View style={{
              backgroundColor: useTierStyling ? themeColors.surface : '#FFFFFF',
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              maxWidth: '95%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}>
              {/* Modal Header */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginBottom: 20,
              }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: useTierStyling ? themeColors.dark : '#1F2937',
                    marginBottom: 4,
                  }}>
                    Digital Barcode Certificate
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: useTierStyling ? themeColors.dark : '#6B7280',
                    opacity: 0.7,
                  }}>
                    Scan to verify authenticity
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowQRModal(false)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: -5,
                    padding: 8,
                  }}
                >
                  <MaterialCommunityIcons 
                    name="close" 
                    size={24} 
                    color={useTierStyling ? themeColors.dark : '#6B7280'} 
                  />
                </TouchableOpacity>
              </View>

              {/* Barcode */}
              <View style={{
                backgroundColor: '#FFFFFF',
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: useTierStyling ? themeColors.border : '#E5E7EB',
                alignItems: 'center',
              }}>
                <CustomBarcode 
                  value={getUserData.getDigitalCertificate(user)} 
                  width={280} 
                  height={120}
                />
              </View>

              {/* Certificate Info */}
              <View style={{
                backgroundColor: useTierStyling ? themeColors.light : '#F9FAFB',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                marginBottom: 16,
                width: '100%',
              }}>
                <Text style={{
                  fontSize: 12,
                  color: useTierStyling ? themeColors.dark : '#6B7280',
                  textAlign: 'center',
                  marginBottom: 4,
                  opacity: 0.7,
                }}>
                  Certificate ID
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: useTierStyling ? themeColors.dark : '#1F2937',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  fontWeight: '500',
                }}>
                  {getUserData.getDigitalCertificate(user)}
                </Text>
              </View>

              {/* Verification Badge */}
              <View style={{
                backgroundColor: useTierStyling ? themeColors.accent : '#ECFDF5',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: useTierStyling ? themeColors.border : '#D1FAE5',
              }}>
                <Text style={{
                  fontSize: 12,
                  color: useTierStyling ? themeColors.contrast : '#065F46',
                  fontWeight: '500',
                }}>
                  ✓ Verified Certificate
                </Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setShowQRModal(false)}
                style={{
                  backgroundColor: useTierStyling ? themeColors.middle : '#303481',
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                  marginTop: 20,
                  width: '100%',
                }}
              >
                <Text style={{
                  color: useTierStyling ? themeColors.contrast : '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '600',
                  textAlign: 'center',
                }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Profile Image Modal */}
        {renderProfileImageModal()}

        <TutorialModal
          visible={showTutorial}
          onClose={() => setShowTutorial(false)}
          steps={tutorialSteps}
          storageKey="dashboard_tutorial_shown"
          onComplete={() => setShowTutorial(false)}
        />
      </View>
    </ProtectedRoute>
  );
};

export default MobileDashboard;
