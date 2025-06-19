import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'expo-router';  
import { aboutData, privacyData } from './settingsContent';


// Higher order component to inject router, dispatch and auth state
const withNavigation = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    return <WrappedComponent {...props} router={router} dispatch={dispatch} user={user} />;
  };
};

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAbout: false,
      showPrivacy: false,
      aboutContent: aboutData,
    };
  }

  toggleAbout = () => {
    this.setState(prevState => ({
      showAbout: !prevState.showAbout,
      showPrivacy: false,
    }));
  }

  togglePrivacy = () => {
    this.setState(prevState => ({
      showPrivacy: !prevState.showPrivacy,
      showAbout: false,
    }));
  }

  renderAboutContent() {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.mainTitle}>{aboutData.cooperative_name}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionText}>
            {aboutData.historical_background.origin}
          </Text>
        </View>

        {[
          { title: aboutData.mission, content: aboutData.micontent.content },
          { title: aboutData.vision, content: aboutData.vcontent.content },
          { title: aboutData.goal, content: aboutData.gcontent.content }
        ].map((item, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <Text style={styles.sectionText}>{item.content}</Text>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{aboutData.core}</Text>
          {Object.values(aboutData.cvcontent).map((value, index) => (
            <Text key={index} style={styles.bulletPoint}>• {value}</Text>
          ))}
        </View>
      </View>
    );
  }

  renderPrivacyContent() {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.mainTitle}>{privacyData.title}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionText}>{privacyData.introduction}</Text>
        </View>

        {privacyData.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.map((item, idx) => (
              <Text key={idx} style={styles.bulletPoint}>• {item}</Text>
            ))}
          </View>
        ))}
      </View>
    );
  }

  renderAboutView() {
    const { aboutContent } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {aboutContent ? this.renderAboutContent() : (
            <Text style={styles.loadingText}>
              Loading about information...
            </Text>
          )}
        </ScrollView>
        <TouchableOpacity
          style={[styles.button, styles.closeButton]}
          onPress={this.toggleAbout}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderPrivacyView() {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {this.renderPrivacyContent()}
        </ScrollView>
        <TouchableOpacity
          style={[styles.button, styles.closeButton]}
          onPress={this.togglePrivacy}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderMainView() {
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Settings</Text>

        <TouchableOpacity 
          style={[styles.button, styles.aboutButton]} 
          onPress={this.toggleAbout}
        >
          <Text style={styles.buttonText}>Information</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.privacyButton]} 
          onPress={this.togglePrivacy}
        >
          <Text style={styles.buttonText}>Data Privacy</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const { showAbout, showPrivacy } = this.state;
    if (showAbout) return this.renderAboutView();
    if (showPrivacy) return this.renderPrivacyView();
    return this.renderMainView();
  }
}

export default withNavigation(Settings);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    marginHorizontal: 'auto',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  scrollView: {
    flex: 1,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 36,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  button: {
    width: '100%',
    maxWidth: 800,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginVertical: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }
      }
    }),
  },
  aboutButton: {
    backgroundColor: '#3B82F6',
    borderWidth: 0,
  },
  privacyButton: {
    backgroundColor: '#10B981',
    borderWidth: 0,
  },
  closeButton: {
    backgroundColor: '#6366F1',
    borderWidth: 0,
    position: 'sticky',
    bottom: 24,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    }),
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
    lineHeight: 36,
  },
  section: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#475569',
    textAlign: 'justify',
    letterSpacing: 0.3,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 26,
    color: '#475569',
    marginLeft: 12,
    marginBottom: 8,
    letterSpacing: 0.3,
    paddingLeft: 16,
    position: 'relative',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748B',
    marginTop: 24,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#1E293B',
    ...Platform.select({
      web: {
        outline: 'none',
        ':focus': {
          borderColor: '#3B82F6',
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
        }
      }
    }),
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  successText: {
    color: '#10B981',
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});
