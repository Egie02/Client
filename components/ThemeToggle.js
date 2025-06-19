/**
 * Theme Toggle Component
 * 
 * Provides a toggle switch for users to switch between default and tier-based themes.
 * Includes visual indicators and smooth animations.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Switch,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, THEME_TYPES, formatTierName, getTierIcon } from '../theme/ThemeManager';

const ThemeToggle = ({ style, showLabel = true, compact = false }) => {
  const {
    themeType,
    toggleTheme,
    userTier,
    tierInfo,
    userShares,
    colors,
    getGradientColors
  } = useTheme();

  const [isToggling, setIsToggling] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const isTierTheme = themeType === THEME_TYPES.TIER;

  const handleToggle = async () => {
    if (isToggling) return;

    setIsToggling(true);
    
    // Animation feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await toggleTheme();
    } catch (error) {
      Alert.alert('Error', 'Failed to switch theme. Please try again.');
    } finally {
      setIsToggling(false);
    }
  };

  const formatShares = (shares) => {
    const amount = parseFloat(shares) || 0;
    if (amount >= 1000000) return `₱${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) {
      const kAmount = amount / 1000;
      // If it would display as 1000K or higher, show as M instead
      if (kAmount >= 1000) return `₱${(kAmount / 1000).toFixed(1)}M`;
      return `₱${kAmount.toFixed(1)}K`;
    }
    return `₱${amount.toFixed(0)}`;
  };

  if (compact) {
    return (
      <Animated.View style={[styles.compactContainer, style, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.compactToggle,
            isTierTheme && styles.compactToggleActive
          ]}
          onPress={handleToggle}
          disabled={isToggling}
        >
          <MaterialCommunityIcons
            name={isTierTheme ? getTierIcon(userTier) : 'palette'}
            size={20}
            color={isTierTheme ? colors.contrast : '#64748B'}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, style, { transform: [{ scale: scaleAnim }] }]}>
      {isTierTheme ? (
        <LinearGradient
          colors={getGradientColors()}
          style={styles.tierCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.tierHeader}>
            <MaterialCommunityIcons
              name={getTierIcon(userTier)}
              size={24}
              color={colors.contrast}
            />
            <Text style={[styles.tierTitle, { color: colors.contrast }]}>
              {formatTierName(userTier)}
            </Text>
          </View>
          
          <View style={styles.tierInfo}>
            <Text style={[styles.tierShares, { color: colors.light }]}>
              {formatShares(userShares)} shares
            </Text>
            {tierInfo && (
              <Text style={[styles.tierRange, { color: colors.light }]}>
                {formatShares(tierInfo.min)} - {tierInfo.max === Infinity ? '∞' : formatShares(tierInfo.max)}
              </Text>
            )}
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.defaultCard}>
          <View style={styles.defaultHeader}>
            <MaterialCommunityIcons
              name="palette"
              size={24}
              color="#64748B"
            />
            <Text style={styles.defaultTitle}>Default Theme</Text>
          </View>
          <Text style={styles.defaultSubtitle}>Standard appearance</Text>
        </View>
      )}

      <View style={styles.toggleSection}>
        {showLabel && (
          <View style={styles.toggleLabels}>
            <Text style={[
              styles.toggleLabel,
              !isTierTheme && styles.activeLabel
            ]}>
              Default
            </Text>
            <Text style={[
              styles.toggleLabel,
              isTierTheme && styles.activeLabel
            ]}>
              Tier Theme
            </Text>
          </View>
        )}
        
        <View style={styles.switchContainer}>
          <Switch
            value={isTierTheme}
            onValueChange={handleToggle}
            disabled={isToggling}
            trackColor={{
              false: '#E5E7EB',
              true: isTierTheme ? colors.accent : '#6366F1'
            }}
            thumbColor={isTierTheme ? colors.light : '#FFFFFF'}
            ios_backgroundColor="#E5E7EB"
          />
        </View>
      </View>

      {isTierTheme && (
        <View style={styles.benefitsHint}>
          <MaterialCommunityIcons
            name="information"
            size={16}
            color="#64748B"
          />
          <Text style={styles.benefitsText}>
            Tier theme unlocks exclusive colors and features
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  compactToggleActive: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  tierCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  tierInfo: {
    alignItems: 'flex-start',
  },
  tierShares: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tierRange: {
    fontSize: 14,
    opacity: 0.9,
  },
  defaultCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  defaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  defaultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  defaultSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabels: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#1F2937',
    fontWeight: '600',
  },
  switchContainer: {
    alignItems: 'center',
  },
  benefitsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  benefitsText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    flex: 1,
  },
});

export default ThemeToggle; 