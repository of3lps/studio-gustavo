import React from 'react';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// --- IMPORTAÇÃO DAS TELAS ---
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ServiceSelectionScreen from './src/screens/ServiceSelectionScreen';
import BookingScreen from './src/screens/BookingScreen';
import SuccessScreen from './src/screens/SuccessScreen';

import AdminNavigator from './src/navigation/AdminNavigator';
import AdminBlockTimeScreen from './src/screens/admin/AdminBlockTimeScreen';

const Stack = createStackNavigator();

function RootNavigator() {
  const { user, profile, isAdmin, loading } = useAuth();

  if (loading) {
     return (
       <View style={{flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#D4A373" />
       </View>
     );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false, 
        cardStyle: { backgroundColor: '#121212' }
      }}
    >
      
      {/* 1. SE NÃO ESTIVER LOGADO */}
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        // 2. SE ESTIVER LOGADO...
        <>
          {/* TRAVA DE SEGURANÇA: Verifica se falta NOME ou TELEFONE */}
          {!profile?.full_name || !profile?.phone ? (
             <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : (
             // 3. PERFIL COMPLETO -> APP REAL
             <>
                {isAdmin ? (
                    <Stack.Screen name="AdminDashboard" component={AdminNavigator} />
                ) : (
                    <Stack.Screen name="Home" component={HomeScreen} />
                )}
                
                <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
                <Stack.Screen name="Booking" component={BookingScreen} />
                <Stack.Screen 
                  name="Success" 
                  component={SuccessScreen} 
                  options={{ gestureEnabled: false }} 
                />
                
                {isAdmin && (
                   <Stack.Screen name="AdminBlockTime" component={AdminBlockTimeScreen} />
                )}
             </>
          )}
        </>
      )}

    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}