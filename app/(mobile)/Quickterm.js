import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { quickTermStyles as styles } from './style';
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeManager';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TutorialModal from '../components/TutorialModal';

const Quickterm = () => {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const { quickLoanData } = useLocalSearchParams();
  const [showTutorial, setShowTutorial] = useState(false);

  // Get theme context
  const {
    themeType,
    colors,
    getGradientColors,
    isDefault,
    userTier
  } = useTheme();

  // Determine if we should use tier styling
  const useTierStyling = !isDefault && colors;
  const themeColors = useTierStyling ? colors : null;

  // Parse quick loan data from params
  let parsedQuickLoan = null;
  try {
    parsedQuickLoan = quickLoanData ? JSON.parse(quickLoanData) : null;
  } catch (error) {
    // Silent error handling
  }

  // Get loan terms from user data
  const terms = [
    { label: '1st loan', value: user?.QFirst || "0.00" },
    { label: '2nd loan', value: user?.QSecond || "0.00" },
    { label: '3rd loan', value: user?.QThird || "0.00" },
    { label: '4th loan', value: user?.QFourth || "0.00" },
    { label: '5th loan', value: user?.QFifth || "0.00" },
  ].map(term => ({
    ...term,
    value: parseFloat(term.value).toFixed(2)
  }));

  // Calculate total balance
  const totalBalance = terms.reduce((sum, term) => sum + parseFloat(term.value), 0).toFixed(2);

  // Get adaptive background color for container
  const getContainerStyle = () => {
    if (!useTierStyling) return styles.container;
    
    return [styles.container, {
      backgroundColor: themeColors.surface,
    }];
  };

  // Get back button color
  const getBackButtonColor = () => {
    if (!useTierStyling) return "#0F172A";
    return themeColors.dark;
  };

  const tutorialSteps = [
    {
      title: 'Quick Term Features',
      description: 'Quick Term allows you to manage your short-term loans and transactions efficiently.'
    },
    {
      title: 'Loan Management',
      description: 'View your active loans, payment schedules, and transaction history in one place.'
    },
    {
      title: 'Quick Actions',
      description: 'Perform common actions like making payments, checking balances, and viewing statements.'
    }
  ];

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const isFirstTime = await AsyncStorage.getItem('quickterm_tutorial_shown');
        if (!isFirstTime) {
          setShowTutorial(true);
        }
      } catch (error) {
        // Silent error handling
      }
    };

    checkFirstTimeUser();
  }, []);

  if (!user) {
    return (
      <SafeAreaView style={getContainerStyle()}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.replace('/(mobile)/MobileDashboard')}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={getBackButtonColor()} />
        </TouchableOpacity>
        <View style={[styles.contentContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={useTierStyling && { color: themeColors.dark }}>No loan data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={getContainerStyle()}>
      <TutorialModal
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
        steps={tutorialSteps}
        storageKey="quickterm_tutorial_shown"
        onComplete={() => setShowTutorial(false)}
      />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.replace('/(mobile)/MobileDashboard')}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={getBackButtonColor()} />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <View style={styles.cardsGrid}>
          {terms.slice(0, 4).map((term, index) => (
            <View key={index} style={[styles.paymentCard, useTierStyling && {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            }]}>
              <Text style={[styles.paymentLabel, useTierStyling && {
                color: themeColors.dark,
              }]}>{term.label}</Text>
              <Text style={[styles.paymentValue, useTierStyling && {
                color: themeColors.dark,
              }]}>
                ₱{parseFloat(term.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
          <View style={[styles.paymentCard, styles.fullWidthCard, useTierStyling && {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          }]}>
            <Text style={[styles.paymentLabel, useTierStyling && {
              color: themeColors.dark,
            }]}>{terms[4].label}</Text>
            <Text style={[styles.paymentValue, useTierStyling && {
              color: themeColors.dark,
            }]}>
              ₱{parseFloat(terms[4].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {useTierStyling ? (
          <LinearGradient
            colors={getGradientColors()}
            style={styles.totalSection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.totalLabel, {
              color: themeColors.light,
            }]}>Total Quick Loan Deduction</Text>
            <Text style={[styles.totalAmount, {
              color: themeColors.contrast,
            }]}>
              ₱{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </LinearGradient>
        ) : (
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Quick Loan Deduction</Text>
            <Text style={styles.totalAmount}>
              ₱{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Quickterm;