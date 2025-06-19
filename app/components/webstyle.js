import { StyleSheet, View } from 'react-native';

export const webStyle = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    logoContainer: {
      marginBottom: 30,
      alignItems: 'center',
    },
    logo: {
      width: 120,
      height: 120,
    },
    welcomeContainer: {
      marginBottom: 20,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
    },
    errorText: {
      color: '#ff0000',
      marginBottom: 10,
      textAlign: 'center',
    },
    attemptText: {
      color: '#ff6b6b',
      marginBottom: 10,
      textAlign: 'center',
    },
    inputContainer: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 5,
      overflow: 'hidden',
    },
    countryCode: {
      paddingHorizontal: 10,
      backgroundColor: '#f0f0f0',
      height: 45,
      lineHeight: 45,
      borderRightWidth: 1,
      borderRightColor: '#ddd',
    },
    input: {
      flex: 1,
      height: 45,
      paddingHorizontal: 10,
      fontSize: 16,
    },
    pinInput: {
      width: '100%',
      height: 45,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 5,
      paddingHorizontal: 10,
      fontSize: 16,
      marginTop: 15,
    },
    loginButton: {
      backgroundColor: '#007AFF',
      height: 45,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    loginButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });


  export const webBlockstyle = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: "#E0F7FA",
    },
    card: {
      backgroundColor: "#F0F4C3",
      padding: 24,
      borderRadius: 16,
      width: '90%',
      maxWidth: 400,
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
    },
    noteText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 16,
      textAlign: 'center',
    },
    messageText: {
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 32,
      color: "#444",
      lineHeight: 24,
      paddingHorizontal: 10,
    },
    button: {
      height: 50,
      backgroundColor: "#3467eb",
      justifyContent: "center",
      alignItems: "center", 
      borderRadius: 25,
      width: 150,
      shadowColor: "#3467eb",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 5,
    },
    buttonText: {
      color: "#fff", 
      fontSize: 18,
      fontWeight: "bold",
    },
  });

  // Add a default export component
export default function WebStyles() {
    return <View />;
  }