// App.js
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

// Navegador do Admin (que contém as Abas: Agenda, Gestão e Loja)
import AdminNavigator from './src/navigation/AdminNavigator';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* Configura a barra de status globalmente para texto claro */}
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <Stack.Navigator 
        initialRouteName="Login" 
        screenOptions={{ 
          headerShown: false, // Oculta o header padrão do React Navigation
          cardStyle: { backgroundColor: '#121212' } // Fundo padrão escuro para transições
        }}
      >
        
        {/* 1. TELA DE LOGIN (Decide se é Admin ou Cliente) */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* 2. FLUXO DO ADMINISTRADOR */}
        {/* Ao navegar para cá, o app carrega o menu de abas inferior */}
        <Stack.Screen name="AdminDashboard" component={AdminNavigator} />

        {/* 3. FLUXO DO CLIENTE */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        
        {/* Tela de Sucesso (sem header e sem animação de voltar para evitar confusão) */}
        <Stack.Screen 
          name="Success" 
          component={SuccessScreen} 
          options={{ gestureEnabled: false }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}