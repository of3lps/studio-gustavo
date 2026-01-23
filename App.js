import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// --- IMPORTAÇÃO DAS TELAS ---

// Telas Gerais e do Cliente
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ServiceSelectionScreen from './src/screens/ServiceSelectionScreen';
import BookingScreen from './src/screens/BookingScreen';
import SuccessScreen from './src/screens/SuccessScreen';

// Navegador do Admin (Abas)
import AdminNavigator from './src/navigation/AdminNavigator';

// Tela de Bloqueio (Admin) - Fica fora das abas para abrir por cima
import AdminBlockTimeScreen from './src/screens/admin/AdminBlockTimeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* Configura a barra de status globalmente para texto claro */}
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <Stack.Navigator 
        initialRouteName="Login" 
        screenOptions={{ 
          headerShown: false, 
          cardStyle: { backgroundColor: '#121212' }
        }}
      >
        
        {/* 1. TELA DE LOGIN */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* 2. FLUXO DO ADMINISTRADOR */}
        <Stack.Screen name="AdminDashboard" component={AdminNavigator} />
        {/* Nova tela de Bloqueio */}
        <Stack.Screen name="AdminBlockTime" component={AdminBlockTimeScreen} />

        {/* 3. FLUXO DO CLIENTE */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen 
          name="Success" 
          component={SuccessScreen} 
          options={{ gestureEnabled: false }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}