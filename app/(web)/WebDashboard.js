import React, { useEffect, useState, useCallback } from 'react';
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
  TouchableOpacity,
  Animated,
  Modal,
  Platform,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { layoutStyles, dashboardStyles as styles, getPlatformStyles } from './style';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Custom Barcode Component for React Native Web
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

const WebDashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [activeLoanCategory, setActiveLoanCategory] = useState('Regular');
  const [showQRModal, setShowQRModal] = useState(false);
  const { user, loading, error } = useSelector((state) => state.auth);

  // Platform detection
  const [deviceType, setDeviceType] = useState('desktop');
  const [orientation, setOrientation] = useState('portrait');

  // Window dimensions state
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get('window')
  });

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

  // Platform and device detection
  const detectDevice = useCallback(() => {
    const { width, height } = dimensions.window;
    
    // Check if it's Windows
    const isWindows = Platform.OS === 'web' && typeof navigator !== 'undefined' && /Windows/.test(navigator.userAgent);
    
    // Detect device type based on dimensions
    if (width <= 425 && height <= 735) {
      setDeviceType('mobile');
    } else if (width <= 768) {
      setDeviceType('tablet');
    } else {
      setDeviceType(isWindows ? 'windows' : 'desktop');
    }

    // Detect orientation
    setOrientation(width > height ? 'landscape' : 'portrait');
  }, [dimensions]);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (Platform.OS === 'web') {
      setDimensions({
        window: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    }
  }, []);

  // Set up resize listener
  useEffect(() => {
    if (Platform.OS === 'web') {
      window.addEventListener('resize', handleResize);
      detectDevice();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [handleResize, detectDevice]);

  // Update device detection when dimensions change
  useEffect(() => {
    detectDevice();
  }, [dimensions, detectDevice]);

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
      icon: 'account',
      color: '#0F172A'
    },
    { 
      id: 'Savings', 
      label: 'Savings',
      icon: 'piggy-bank',
      color: '#0F172A'
    },
    { 
      id: 'Shares', 
      label: 'Shares',
      icon: 'chart-pie',
      color: '#0F172A'
    },
    { 
      id: 'Loans', 
      label: 'Loans',
      icon: 'cash-multiple',
      color: '#0F172A'
    },
    { 
      id: 'More', 
      label: 'More',
      icon: 'dots-horizontal',
      color: '#0F172A'
    },
  ];

  const loanCategories = [
    {
      id: 'Regular',
      icon: 'cash-multiple',
      label: 'Regular',
      color: '#4CAF50'
    },
    {
      id: 'Additional',
      icon: 'cash-plus',
      label: 'Additional',
      color: '#2196F3'
    },
    {
      id: 'Appliances',
      icon: 'television-classic',
      label: 'Appliances',
      color: '#9C27B0'
    },
    {
      id: 'Grocery',
      icon: 'cart-outline',
      label: 'Grocery',
      color: '#FF9800'
    },
    {
      id: 'Quick',
      icon: 'flash-outline',
      label: 'Quick',
      color: '#F44336'
    },
    {
      id: 'Other',
      icon: 'dots-horizontal-circle-outline',
      label: 'Other',
      color: '#607D8B'
    }
  ];

  // Function to determine if tier colors are light or dark
  const isLightTierColor = (tierName) => {
    const lightTiers = ['silver', 'gold', 'roseGold', 'diamond'];
    return lightTiers.includes(tierName);
  };

  // Get adaptive background color based on tier
  const getAdaptiveBackgroundColor = () => {
    if (isDefault) {
      return '#F8FAFC'; // Default background
    }
    
    // For tier themes, adapt based on color brightness
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
        return element === 'welcome' ? '#2D3748' : '#4A5568';
      case 'gold':
        return element === 'welcome' ? '#2D3748' : '#4A5568';
      case 'roseGold':
        return element === 'welcome' ? '#2D3748' : '#4A5568';
      case 'platinum':
      case 'sapphire':
      case 'emerald':
      case 'ruby':
        return element === 'welcome' ? '#FFFFFF' : '#F7FAFC';
      case 'diamond':
        return element === 'welcome' ? '#1A202C' : '#2D3748';
      default:
        return element === 'welcome' ? themeColors.contrast : themeColors.light;
    }
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
    setRefreshing(true);
    try {
      await dispatch(manualLoadUser());
    } catch (err) {
      Alert.alert('Error', 'Failed to refresh user data. Please try again.');
    }
    setRefreshing(false);
  }, [dispatch]);

  const userInfoMapping = transformUserData.getUserInfoMapping(user, isPhoneVisible);

  // Helper function to format numbers with commas
  const formatNumber = (number) => {
    if (!number || isNaN(number)) return "0.00";
    return parseFloat(number).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Helper function to format statistic amounts
  const formatStatisticAmount = (number) => {
    if (!number || isNaN(number)) return "0.00";
    const num = parseFloat(number);
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  };

  const getLoanAmount = (category) => {
    const loanData = getUserData.getLoanData(user);
    switch (category) {
      case 'Regular': return parseFloat(loanData.regularLoan || 0);
      case 'Additional': return parseFloat(loanData.additionalLoan || 0);
      case 'Appliances': return parseFloat(loanData.appliancesLoan || 0);
      case 'Grocery': return parseFloat(loanData.groceryLoan || 0);
      case 'Quick': return parseFloat(loanData.quickLoan || 0);
      case 'Other': return parseFloat(loanData.otherLoan || 0);
      default: return 0;
    }
  };

  const getLoanStatus = (category) => {
    const loanData = getUserData.getLoanData(user);
    switch (category) {
      case 'Regular': return loanData.regularLoanStatus || 'No Data';
      case 'Additional': return loanData.additionalLoanStatus || 'No Data';
      case 'Appliances': return loanData.appliancesLoanStatus || 'No Data';
      case 'Grocery': return loanData.groceryLoanStatus || 'No Data';
      case 'Quick': return loanData.quickLoanStatus || 'No Data';
      case 'Other': return loanData.otherLoanStatus || 'No Data';
      default: return 'No Data';
    }
  };

  const getLoanRemarks = (category) => {
    const loanData = getUserData.getLoanData(user);
    switch (category) {
      case 'Quick': return loanData.quickLoanRemarks || 'No Data';
      default: return 'No Data';
    }
  };

  const getTotalAssets = () => {
    const savingsData = getUserData.getSavingsData(user);
    const sharesData = getUserData.getSharesData(user);
    return parseFloat(savingsData.totalSavings || 0) + parseFloat(sharesData.totalShares || 0);
  };

  const getTotalLoans = () => {
    return loanCategories.reduce((total, category) => {
      return total + getLoanAmount(category.id);
    }, 0);
  };

  const renderLoanDetails = (category) => {
    const loanAmount = getLoanAmount(category).toFixed(2);
    if (loanAmount === "0.00") {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="cash" size={48} color="#94A3B8" />
          <Text style={styles.emptyStateText}>No active {category.toLowerCase()} loans</Text>
        </View>
      );
    }

    // Special handling for Quick loans
    if (category === 'Quick') {
      const notesValue = getLoanRemarks(category);
      const shouldHideNotesValue = notesValue === "No Data" || notesValue === "N/A";
      
      return (
        <View style={[styles.loanDetailsCard, useTierStyling && {
          backgroundColor: themeColors.middle,
          borderColor: themeColors.border,
        }]}>
          <View style={[styles.loanDetailRow, {color: useTierStyling ? themeColors.contrast : '#303481'}]}>
            <Text style={[styles.loanDetailLabel, useTierStyling && {
              color: themeColors.contrast,
            }]}>Notes:</Text>
            {!shouldHideNotesValue && (
              <Text style={[styles.loanDetailValue, { textAlign: 'right', flex: 1 }, useTierStyling && {
                color: themeColors.contrast,
              }]}>
                {notesValue}
              </Text>
            )}
          </View>
        </View>
      );
    }

    // Standard loan details for other categories
    return (
      <View style={[styles.loanDetailsCard, useTierStyling && {
        backgroundColor: themeColors.middle,
        borderColor: themeColors.border,
      }]}>
        <View style={styles.loanDetailRow}>
          <Text style={[styles.loanDetailLabel, useTierStyling && {
            color: themeColors.contrast,
          }]}>Balance:</Text>
          <Text style={[styles.loanDetailValue, useTierStyling && {
            color: themeColors.contrast,
          }]}>₱{formatNumber(loanAmount)}</Text>
        </View>
        <View style={styles.loanDetailRow}>
          <Text style={[styles.loanDetailLabel, useTierStyling && {
            color: themeColors.contrast,
          }]}>Status:</Text>
          <Text style={[styles.loanDetailValue, useTierStyling && {
            color: themeColors.contrast,
          }]}>{getLoanStatus(category)}</Text>
        </View>
      </View>
    );
  };

  const renderLoansContent = () => (
    <View style={styles.contentContainer}>
      {/* Loan Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScrollView}
        contentContainerStyle={styles.categoriesContainer}
      >
        {loanCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              activeLoanCategory === category.id && styles.activeCategoryButton,
              useTierStyling && activeLoanCategory === category.id && {
                backgroundColor: themeColors.middle,
                borderColor: themeColors.border,
              }
            ]}
            onPress={() => setActiveLoanCategory(category.id)}
          >
            <MaterialCommunityIcons 
              name={category.icon} 
              size={deviceType === 'mobile' ? 20 : 24} 
              color={activeLoanCategory === category.id 
                ? (useTierStyling ? themeColors.contrast : '#FFFFFF')
                : (useTierStyling ? themeColors.dark : '#303481')
              } 
            />
            <Text style={[
              styles.categoryButtonText,
              activeLoanCategory === category.id && styles.activeCategoryButtonText,
              useTierStyling && activeLoanCategory === category.id && {
                color: themeColors.contrast,
              },
              useTierStyling && activeLoanCategory !== category.id && {
                color: themeColors.dark,
              }
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loan Details */}
      <View style={[styles.loanCard, useTierStyling && {
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.balanceLabel, useTierStyling && {
            color: themeColors.dark,
          }]}>
            {activeLoanCategory === 'Quick' 
              ? 'Total Deduction'
              : (activeLoanCategory === 'Grocery' || activeLoanCategory === 'Other') 
                ? 'Total Deduction' 
                : 'Loan Balance'
            }
          </Text>
          {activeLoanCategory === 'Quick' ? (
            <TouchableOpacity
              style={{
                padding: 4,
                borderRadius: 4,
                backgroundColor: useTierStyling ? themeColors.middle : '#303481',
              }}
              onPress={() => {
                Alert.alert('Quick Loan Details', 'This feature shows detailed quick loan information.');
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
        
        <Text style={[styles.balanceAmount, useTierStyling && {
          color: themeColors.dark,
        }]}>
          ₱{formatNumber(getLoanAmount(activeLoanCategory))}
        </Text>
        
        {renderLoanDetails(activeLoanCategory)}
      </View>
    </View>
  );

  const renderProfileContent = () => (
    <View style={styles.contentContainer}>
      {Object.entries(userInfoMapping).map(([key, value]) => (
        <View key={key} style={[styles.infoRow, useTierStyling && {
          borderBottomColor: themeColors.border,
        }]}>
          <Text style={[styles.infoLabel, useTierStyling && {
            color: themeColors.dark,
          }]}>{key}:</Text>
          <View style={styles.infoValueContainer}>
            <Text style={[styles.infoValue, useTierStyling && {
              color: themeColors.dark,
            }]}>{value}</Text>
            {key === 'Phone' && (
              <TouchableOpacity
                onPress={() => setIsPhoneVisible(!isPhoneVisible)}
                style={styles.eyeButton}
              >
                <MaterialCommunityIcons 
                  name={isPhoneVisible ? "eye-off" : "eye"} 
                  size={16} 
                  color={useTierStyling ? themeColors.middle : "#303481"} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderSavingsContent = () => (
    <View style={styles.contentContainer}>
      <View style={[styles.summaryCard, useTierStyling && {
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }]}>
        <Text style={[styles.summaryTitle, useTierStyling && {
          color: themeColors.dark,
        }]}>Total Savings</Text>
        <Text style={[styles.summaryAmount, useTierStyling && {
          color: themeColors.dark,
        }]}>
          ₱{formatNumber(getUserData.getSavingsData(user).totalSavings || 0)}
        </Text>
      </View>
    </View>
  );

  const renderSharesContent = () => (
    <View style={styles.contentContainer}>
      <View style={[styles.summaryCard, useTierStyling && {
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }]}>
        <Text style={[styles.summaryTitle, useTierStyling && {
          color: themeColors.dark,
        }]}>Total Shares</Text>
        <Text style={[styles.summaryAmount, useTierStyling && {
          color: themeColors.dark,
        }]}>
          ₱{formatNumber(getUserData.getSharesData(user).totalShares || 0)}
        </Text>
      </View>
    </View>
  );

  const renderMoreContent = () => (
    <View style={styles.contentContainer}>
      {/* Digital Certificate Section */}
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
              </>
            );
          } else {
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

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Exit App",
        "Are you sure you want to exit?",
        [
          { text: "Cancel", onPress: () => null, style: "cancel" },
          { text: "YES", onPress: () => {
            if (Platform.OS === 'web') {
              window.close();
            } else {
              BackHandler.exitApp();
            }
          }}
        ]
      );
      return true;
    };

    if (Platform.OS !== 'web') {
      const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => {
        backHandlerSubscription.remove();
      };
    }
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <View style={[
        styles.container,
        {
          backgroundColor: getAdaptiveBackgroundColor(),
        }
      ]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          {useTierStyling ? (
            <LinearGradient
              colors={gradientColors}
              style={[styles.headerSection, styles.gradientHeader]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.welcomeText, {
                color: getHeaderTextColor('welcome'),
              }]}>
                Welcome, {user?.Username || user?.username || "User"}!
              </Text>
              <Text style={[styles.dateText, {
                color: getHeaderTextColor('date'),
              }]}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </LinearGradient>
          ) : (
            <View style={styles.headerSection}>
              <Text style={[styles.welcomeText, {
                color: getHeaderTextColor('welcome'),
              }]}>
                Welcome, {user?.Username || user?.username || "User"}!
              </Text>
              <Text style={[styles.dateText, {
                color: getHeaderTextColor('date'),
              }]}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
          )}

          {/* Tabs */}
          <View style={[styles.tabsContainer, useTierStyling && {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          }]}>
            {tabs.map((tab) => (
              <Animated.View
                key={tab.id}
                style={[
                  { transform: [{ scale: scaleAnims[tab.id] }] },
                  { flex: deviceType === 'mobile' ? 1 : undefined, minWidth: deviceType === 'mobile' ? undefined : 100 }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === tab.id && styles.activeTab,
                    useTierStyling && activeTab === tab.id && {
                      backgroundColor: themeColors.middle,
                    },
                    deviceType === 'mobile' && {
                      paddingVertical: 6,
                      paddingHorizontal: 4,
                    }
                  ]}
                  onPress={() => handleTabPress(tab.id)}
                >
                  <MaterialCommunityIcons 
                    name={tab.icon} 
                    size={deviceType === 'mobile' ? 18 : 24} 
                    color={activeTab === tab.id 
                      ? (useTierStyling ? themeColors.contrast : '#FFFFFF')
                      : (useTierStyling ? themeColors.middle : '#303481')
                    } 
                  />
                  <Text style={[
                    styles.tabLabel,
                    activeTab === tab.id && styles.activeTabLabel,
                    useTierStyling && activeTab === tab.id && {
                      color: themeColors.contrast,
                    },
                    useTierStyling && activeTab !== tab.id && {
                      color: themeColors.middle,
                    },
                    deviceType === 'mobile' && {
                      fontSize: 10,
                    }
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Main Content */}
          <View style={[styles.mainCard, useTierStyling && {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
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
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text style={{
                  fontSize: 14,
                  color: useTierStyling ? themeColors.dark : '#374151',
                  marginBottom: 4,
                }}>
                  Certificate ID
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: useTierStyling ? themeColors.dark : '#6B7280',
                  fontFamily: 'monospace',
                }}>
                  {getUserData.getDigitalCertificate(user)}
                </Text>
              </View>

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
      </View>
    </ProtectedRoute>
  );
};

export default WebDashboard;
