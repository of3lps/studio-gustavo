// src/navigation/AdminNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import AdminAgendaScreen from '../screens/admin/AdminAgendaScreen';
import AdminStatsScreen from '../screens/admin/AdminStatsScreen';
import AdminStoreScreen from '../screens/admin/AdminStoreScreen';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: 'rgba(255,255,255,0.05)',
          height: 60,
          paddingBottom: 10
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
      }}
    >
      <Tab.Screen 
        name="Agenda" 
        component={AdminAgendaScreen} 
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="calendar-today" size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="Gestão" 
        component={AdminStatsScreen} 
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="bar-chart" size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="Loja" 
        component={AdminStoreScreen} 
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="storefront" size={24} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}