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
  cooperative_name: "MANDALUYONG MULTI-PURPOSE COOPERATIVE",
  historical_background: {
    origin: "The organization of a cooperative that would truly respond to the needs of the residents of Mandaluyong was occasionally brought up during group discussions, coffee talks during 1992. The growing consensus among the concerned residents, especially those employed in the municipal government, was to organize a multi-purpose cooperative whose membership would be open to qualified residents of Mandaluyong, and in particular to all municipal employees, firemen, policemen and teachers.\n\nThe organizers of the new cooperative succeeded in calling the first general assembly and membership meeting on March 23, 1993. 107 participants who later on enlisted as members of the Mandaluyong Multi-Purpose Cooperative attended the meeting.\n\nThe public acceptance of the cooperative has been very encouraging. As of September 15, 1997, the Cooperative counts 1,800 members and total assets of P8,500,000.00. Short-term loans of four months to one year were granted to almost all the members amounting to P13,000,000.00 from January to September 1997."
  },
  mission: "Our Mission",
  micontent: {
    content: "To serve as a duly registered association of persons, with a common bond of interest, who have voluntarily joined together to achieve a lawful common social or economic end, making contributions to the capital required and accepting a fair share of the risks and benefits of the undertaking in accordance with universally accepted cooperative principles."
  },
  vision: "Our Vision",
  vcontent: {
    content: "To be a cooperative that truly responds to the needs of the residents of Mandaluyong, providing financial services and opportunities for economic growth while maintaining the principles of member ownership and democratic control."
  },
  goal: "Our Goal",
  gcontent: {
    content: "To expand business operations and improve services offered to the cooperative members, ensuring sustainable growth and continued support for the financial needs of our community."
  },
  core: "Cooperative Principles",
  cvcontent: {
    membership: "Open and voluntary membership",
    democratic: "Democratic control and limited interest in capital",
    distribution: "Equitable distribution of net surplus",
    education: "Cooperative education and cooperation among cooperatives",
    subsidiary: "Principles of subsidiary and principle of self help",
    ownership: "Member owned with each member's share contributing to capital",
    governance: "Administered by a Board of Directors of seven members"
  },
  membership: "Membership Information",
  membershipContent: {
    requirements: "Membership to the Mandaluyong Multi-Purpose Cooperative is by written application. A membership fee of P50.00 and a payment of at least P500.00 minimum share capital are required.",
    composition: "95% employees of the city government and 5% teachers, relatives and friends of the employees who are classified as associates.",
    liability: "In case the cooperative incurs indebtedness, the liability of the member is only equivalent to his share."
  },
  services: "Services Offered",
  servicesContent: {
    loans: "Short-term loans of four months to one year",
    emergency: "Emergency loans and appliances loans",
    commodities: "Small commodity items available to all members",
    deposits: "Time deposits at 2% per month without withholding tax",
    benefits: "Members realize that the cost of their loan is cheaper and whatever is the cost will be returned to them in the form of dividends and patronage refund less operational expenses"
  },
  achievements: "Key Achievements",
  achievementsContent: {
    growth: "Grown from 27 members to 1,800 members within 5 years",
    assets: "Total assets of P8,500,000.00 as of September 15, 1997",
    loans: "P13,000,000.00 in loans granted from January to September 1997",
    dividends: "Estimated dividends and patronage refund of P1,000,000.00 plus give-away worth P140,000.00 for those who have a share of P500 and above",
    community: "Performs community service touching on the basic needs of the low-income level of the community"
  },
  governance: "Governance Structure",
  governanceContent: {
    board: "A Board of Directors of seven members shall administer the business of the cooperative",
    credit: "Credit management vested in a Credit Committee composed of three members",
    management: "Management staff includes secretary and treasurer appointed by the Board of Directors",
    meetings: "Board of Directors must meet at least every month according to the bylaws"
  }
};

export const privacyData = {
  title: "Privacy Policy",
  introduction: "Last updated: June 17, 2025\n\nThis Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.\n\nWe use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.",
  sections: [
    {
      title: "Types of Data Collected",
      content: [
        "Personal Data: First name and last name, Phone number, Usage Data",
        "Usage Data: Device's Internet Protocol address (IP address), browser type, browser version, pages visited, time and date of visit, unique device identifiers",
        "Mobile Device Information: Type of mobile device, mobile device unique ID, mobile operating system, mobile Internet browser type"
      ]
    },
    {
      title: "Use of Your Personal Data",
      content: [
        "To provide and maintain our Service, including monitoring usage",
        "To manage Your Account and registration as a user",
        "For the performance of contracts and services",
        "To contact You via email, telephone, SMS, or push notifications regarding updates",
        "To provide news, special offers and information about similar services",
        "To manage Your requests and customer support",
        "For business transfers, data analysis, and service improvement"
      ]
    },
    {
      title: "Sharing Your Personal Information",
      content: [
        "With Service Providers to monitor and analyze service use",
        "For business transfers during mergers, acquisitions, or asset sales",
        "With Affiliates, requiring them to honor this Privacy Policy",
        "With business partners to offer certain products or services",
        "With other users when you interact in public areas",
        "With Your consent for any other purpose"
      ]
    },
    {
      title: "Retention of Your Personal Data",
      content: [
        "We retain Personal Data only as long as necessary for purposes outlined in this Policy",
        "We retain data to comply with legal obligations, resolve disputes, and enforce agreements",
        "Usage Data is generally retained for shorter periods unless needed for security or functionality improvements"
      ]
    },
    {
      title: "Your Data Rights",
      content: [
        "You have the right to delete or request assistance in deleting Personal Data we have collected",
        "You may update, amend, or delete Your information through Your Account settings",
        "You may contact Us to request access to, correct, or delete personal information",
        "We may need to retain certain information when we have legal obligations"
      ]
    },
    {
      title: "Disclosure Requirements",
      content: [
        "Business Transactions: Personal Data may be transferred during mergers or acquisitions",
        "Law Enforcement: We may disclose data if required by law or valid public authority requests",
        "Legal Requirements: To comply with legal obligations, protect rights, prevent wrongdoing, or protect public safety"
      ]
    },
    {
      title: "Security of Your Personal Data",
      content: [
        "The security of Your Personal Data is important to Us",
        "No method of Internet transmission or electronic storage is 100% secure",
        "We strive to use commercially acceptable means to protect Your Personal Data",
        "We cannot guarantee absolute security"
      ]
    },
    {
      title: "Children's Privacy",
      content: [
        "Our Service does not address anyone under the age of 13",
        "We do not knowingly collect personally identifiable information from anyone under 13",
        "If We become aware of collecting data from children under 13 without parental consent, We take steps to remove that information"
      ]
    },
    {
      title: "Links to Other Websites",
      content: [
        "Our Service may contain links to other websites not operated by Us",
        "We strongly advise You to review the Privacy Policy of every site You visit",
        "We have no control over and assume no responsibility for third party sites or services"
      ]
    },
    {
      title: "Changes to this Privacy Policy",
      content: [
        "We may update Our Privacy Policy from time to time",
        "We will notify You of changes by posting the new Privacy Policy on this page",
        "We will notify You via email and/or prominent notice on Our Service prior to changes becoming effective",
        "Changes are effective when posted on this page"
      ]
    },
    {
      title: "Contact Us",
      content: [
        "If you have any questions about this Privacy Policy, You can contact us by email",
        "This policy was generated to ensure compliance with data protection regulations",
        "MMPC MOBILE is committed to protecting your privacy and personal information"
      ]
    }
  ]
}; 