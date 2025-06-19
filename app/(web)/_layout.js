import React, { useState,useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';

import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { logoutAction } from '../(redux)/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { layoutStyles} from './style';


const CustomDrawerContent = React.memo((props) => {
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const dispatch = useDispatch();

  const icons = {
    Profile: <Ionicons name="person-circle" size={20} color="#333" />,
    Settings: <Ionicons name="settings-sharp" size={20} color="#333" />,
    About: <Ionicons name="information-circle" size={20} color="#333" />,
    Logout: <Ionicons name="log-out" size={20} color="#333" />,
    Icon: <Ionicons name="menu" size={30} color="white" style={{ marginLeft: 10 }} />,
  };
  
  const getSelectedStyle = (itemName) => {
    return {
      style: selectedItem === itemName ? layoutStyles.selectedItem : null,
      labelStyle: [
        layoutStyles.drawerItemLabel,
        selectedItem === itemName ? layoutStyles.selectedItemLabel : null
      ]
    };
  };

  const handleItemPress = async (item) => {
    setSelectedItem(item);
    if (item === 'Dashboard') {
      router.push('/(web)/WebDashboard');
    }
     else if (item === 'Settings') {
      router.push('/(web)/Settings');
    }
     else if (item === 'Logout') {
      handleLogout();
    }
  };

  useEffect(() => {
    const currentRoute = props.state?.routeNames[props.state.index];

    if (currentRoute?.includes('Dashboard')) {
      setSelectedItem('Dashboard');
    } else if (currentRoute?.includes('Settings')) {
      setSelectedItem('Settings');
    }
    
  }, [props.state]);

  const handleLogout = () => {
    dispatch(logoutAction());
    AsyncStorage.removeItem("userInfo");
    router.replace("authweb/Login");
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={layoutStyles.drawerContentContainer}>
      <View style={layoutStyles.headerContainer}>
        <Image source={require('../../assets/icon.png')} style={layoutStyles.profileImage} />
        <Text style={layoutStyles.username}>Welcome</Text>
      </View>
      <View style={layoutStyles.menuContainer}>
        <DrawerItem
          icon={() => icons.Profile}
          label="Dashboard"
          labelStyle={getSelectedStyle('Dashboard').labelStyle}
          onPress={() => handleItemPress('Dashboard')}
          style={[layoutStyles.drawerItem, getSelectedStyle('Dashboard').style]}
        />

        <DrawerItem
          icon={() => icons.Settings}
          label="Settings"
          labelStyle={getSelectedStyle('Settings').labelStyle}
          onPress={() => handleItemPress('Settings')}
          style={[layoutStyles.drawerItem, getSelectedStyle('Settings').style]}
        />

        <DrawerItem
          icon={() => icons.Logout}
          label="Logout"
          labelStyle={getSelectedStyle('Logout').labelStyle}
          onPress={() => handleItemPress('Logout')}
          style={[layoutStyles.drawerItem, getSelectedStyle('Logout').style]}
        />
      </View>
    </DrawerContentScrollView>
  );
});

export default function _layout() {
  return (
    <Drawer
      screenOptions={{
        headerTintColor: 'white', 
        title: '',
        headerShown: true,
        animationTypeForReplace: 'push',
        drawerStyle: layoutStyles.drawerStyle,
        headerStyle: {
          backgroundColor: 'rgba(13, 18, 130, 10)',  // Set the top nav bar background to light cyan
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    />
  );
}
