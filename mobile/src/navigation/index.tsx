import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import StudyScreen from '../screens/StudyScreen';
import PlanScreen from '../screens/PlanScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Study" component={StudyScreen} />
    <Tab.Screen name="Plan" component={PlanScreen} />
  </Tab.Navigator>
);

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Subscription"
          component={SubscriptionScreen}
          options={{
            title: 'Subscription',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
