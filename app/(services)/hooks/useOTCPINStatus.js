import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { setOTCPINCacheInvalidator } from '../api/api';

// Cache for OTCPIN status to avoid unnecessary AsyncStorage reads
let otcpinCache = {
  status: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes cache TTL
};

/**
 * Custom hook for efficiently detecting OTCPIN status for Change PIN functionality
 * Uses caching, memoization, and optimized AsyncStorage operations for better performance
 */
export const useOTCPINStatus = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowChangePIN, setShouldShowChangePIN] = useState(false);
  const user = useSelector((state) => state.auth.user);

  // Extract OTCPIN from user data with fallback checks
  const userOTCPIN = useMemo(() => {
    if (!user) return null;
    
    return (
      user?.OTCPIN ||
      user?.otcpin ||
      user?.permissions?.OTCPIN ||
      user?.permissions?.otcpin ||
      user?.data?.[0]?.OTCPIN ||
      user?.data?.[0]?.otcpin ||
      null
    );
  }, [user]);

  // Determine OTCPIN status from various sources
  const determineOTCPINStatus = useCallback((userStatus, storageGranted, storageDisabled) => {
    // Priority 1: Explicit user data (most authoritative)
    if (userStatus) {
      const status = userStatus.toUpperCase();
      if (status === 'GRANTED' || status === 'ENABLED') {
        return { granted: true, source: 'user_data', value: status };
      }
      if (status === 'DISABLED') {
        return { granted: false, source: 'user_data', value: status };
      }
    }

    // Priority 2: AsyncStorage granted flag
    if (storageGranted === 'true') {
      return { granted: true, source: 'storage_granted', value: 'GRANTED' };
    }

    // Priority 3: AsyncStorage disabled flag (default to disabled for security)
    if (storageDisabled === 'true') {
      return { granted: false, source: 'storage_disabled', value: 'DISABLED' };
    }

    // Default: disabled for security
    return { granted: false, source: 'default', value: 'DISABLED' };
  }, []);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    return otcpinCache.status !== null && 
           (Date.now() - otcpinCache.timestamp) < otcpinCache.ttl;
  }, []);

  // Get OTCPIN status from AsyncStorage with optimized parallel reads
  const getOTCPINFromStorage = useCallback(async () => {
    try {
      // Use multiGet for better performance - single native call instead of multiple
      const keys = ['OTCPIN_GRANTED', 'OTCPIN_DISABLED'];
      const results = await AsyncStorage.multiGet(keys);
      
      // Convert results to object for easier access
      const storage = results.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

      return {
        granted: storage.OTCPIN_GRANTED,
        disabled: storage.OTCPIN_DISABLED
      };
    } catch (error) {
      // Silent error handling - return null values for graceful degradation
      return { granted: null, disabled: null };
    }
  }, []);

  // Main function to check OTCPIN status with caching
  const checkOTCPINStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // Return cached result if valid and user data hasn't changed significantly
      if (isCacheValid() && otcpinCache.userOTCPIN === userOTCPIN) {
        setShouldShowChangePIN(otcpinCache.status.granted);
        setIsLoading(false);
        return otcpinCache.status;
      }

      // Get storage values with optimized parallel read
      const { granted, disabled } = await getOTCPINFromStorage();

      // Determine final status
      const status = determineOTCPINStatus(userOTCPIN, granted, disabled);

      // Update cache
      otcpinCache = {
        status,
        userOTCPIN,
        timestamp: Date.now(),
        ttl: otcpinCache.ttl
      };

      // Update state
      setShouldShowChangePIN(status.granted);
      setIsLoading(false);

      return status;
    } catch (error) {
      // Error handling - default to secure state
      const fallbackStatus = { granted: false, source: 'error', value: 'DISABLED' };
      setShouldShowChangePIN(false);
      setIsLoading(false);
      
      return fallbackStatus;
    }
  }, [userOTCPIN, determineOTCPINStatus, getOTCPINFromStorage, isCacheValid]);

  // Invalidate cache manually (useful for real-time updates)
  const invalidateCache = useCallback(() => {
    otcpinCache = {
      status: null,
      timestamp: 0,
      ttl: otcpinCache.ttl
    };
  }, []);

  // Refresh status (bypasses cache)
  const refreshStatus = useCallback(async () => {
    invalidateCache();
    return await checkOTCPINStatus();
  }, [checkOTCPINStatus, invalidateCache]);

  // Effect to check status when user data changes or component mounts
  useEffect(() => {
    // Register cache invalidator with API
    setOTCPINCacheInvalidator(invalidateCache);
    
    // Only run if we have user data or if we need to check storage
    if (user !== undefined) {
      checkOTCPINStatus();
    }
    
    // Cleanup: unregister invalidator when component unmounts
    return () => {
      setOTCPINCacheInvalidator(null);
    };
  }, [user, checkOTCPINStatus, invalidateCache]);

  // Return hook interface
  return {
    shouldShowChangePIN,
    isLoading,
    refreshStatus,
    invalidateCache,
    // Additional utilities for advanced usage
    userOTCPIN,
    checkStatus: checkOTCPINStatus
  };
};

export default useOTCPINStatus; 