import React, { forwardRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from "@expo/vector-icons";



import { ThemeProvider } from '../context/ThemeContext';
import SubContextProvider from '../context/SubContext';
import HomeScreen from '../screens/HomeScreen';
import GratitudePromptScreen from '../screens/GratitudePromptScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';
import ProfileScreen from '../screens/ProfileScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        
        options={{ tabBarIcon: () => <Ionicons name="home-outline" size={24} color="#393939" /> }}
        
      />
      <Tab.Screen
        name="Journal"
        component={HistoryScreen}
        options={{ tabBarIcon: () => <Ionicons name="journal-outline" size={24} color="#393939" /> }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ tabBarIcon: () => <Ionicons name="stats-chart-outline" size={24} color="#393939" /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: () => <Ionicons name="person-outline" size={24} color="#393939" /> }}
      />
    </Tab.Navigator>
  );
}

const AppNavigator = forwardRef(function AppNavigator(props, ref) {
  return (

    <SubContextProvider>

      <ThemeProvider>
          <NavigationContainer ref={ref}>
          <Stack.Navigator>
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GratitudePrompt"
              component={GratitudePromptScreen}
              options={{
                presentation: 'transparentModal',
                headerShown: false,
                animation: 'fade',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>

      </ThemeProvider>
        

    </SubContextProvider>
 
  );
});

export default AppNavigator;
