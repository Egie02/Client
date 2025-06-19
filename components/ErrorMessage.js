import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ErrorMessage = ({ 
  visible, 
  message, 
  type = 'error', 
  onDismiss, 
  autoHide = true,
  duration = 5000 
}) => {
  React.useEffect(() => {
    if (visible && autoHide && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoHide, onDismiss, duration]);

  if (!visible) return null;

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: [styles.container, styles.successContainer],
          icon: 'checkmark-circle',
          iconColor: '#4CAF50'
        };
      case 'warning':
        return {
          container: [styles.container, styles.warningContainer],
          icon: 'warning',
          iconColor: '#FF9800'
        };
      case 'info':
        return {
          container: [styles.container, styles.infoContainer],
          icon: 'information-circle',
          iconColor: '#2196F3'
        };
      default:
        return {
          container: [styles.container, styles.errorContainer],
          icon: 'close-circle',
          iconColor: '#F44336'
        };
    }
  };

  const styleConfig = getStyles();

  return (
    <View style={styleConfig.container}>
      <View style={styles.content}>
        <Ionicons 
          name={styleConfig.icon} 
          size={18} 
          color={styleConfig.iconColor} 
          style={styles.icon}
        />
        <Text style={styles.message}>{message}</Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Ionicons name="close" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  warningContainer: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#EF6C00',
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  icon: {
    marginRight: 10,
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: '#37474F',
    lineHeight: 18,
    fontWeight: '500',
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
});

export default ErrorMessage; 