import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsContent = ({ navigation }) => {
  const settingsOptions = [
    {
      title: 'Change PIN',
      icon: 'key-outline',
      route: '/(mobile)/ChangePassword',
    },
  ];

  return (
    <View style={styles.container}>
      {settingsOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.option}
          onPress={() => navigation.replace(option.route)}
        >
          <Ionicons name={option.icon} size={24} color="#303481" />
          <Text style={styles.optionText}>{option.title}</Text>
          <Ionicons name="chevron-forward" size={24} color="#303481" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  optionText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#303481',
    fontWeight: '500',
  },
});

export default SettingsContent;

export const aboutData = {
  cooperative_name: "MMPC",
  historical_background: {
    origin: "The Metro Manila Police Cooperative (MMPC) was established to serve the financial needs of police personnel and their families..."
  },
  mission: "Our Mission",
  micontent: {
    content: "To provide excellent financial services and promote the economic well-being of our members through sustainable cooperative enterprise."
  },
  vision: "Our Vision",
  vcontent: {
    content: "To be the leading and most trusted cooperative in providing innovative financial solutions to our members."
  },
  goal: "Our Goal",
  gcontent: {
    content: "To empower our members through financial literacy, sustainable growth, and cooperative excellence."
  },
  core: "Core Values",
  cvcontent: {
    T: "Transparency in all our dealings",
    M: "Member-centric service delivery",
    m: "Mutual growth and development",
    p: "Professional excellence",
    c: "Commitment to integrity"
  }
};

export const privacyData = {
  title: "Data Privacy Policy",
  introduction: "We are committed to protecting your personal information and privacy. We collect and process your data in accordance with applicable data protection laws.",
  sections: [
    {
      title: "Information We Collect",
      content: [
        "Personal identification information",
        "Contact information",
        "Employment details",
        "Transaction records"
      ]
    },
    {
      title: "How We Use Your Information",
      content: [
        "To provide and maintain our services",
        "To notify you about changes to our services",
        "To provide customer support",
        "To process transactions"
      ]
    },
    {
      title: "Data Protection",
      content: [
        "We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction."
      ]
    }
  ]
}; 