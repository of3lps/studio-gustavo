import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native'; // NOVO: Para checar se é Android/iOS
import { supabase } from '../services/supabase';

// NOVO: Importações para Notificações
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// NOVO: Configuração para a notificação aparecer mesmo se o app estiver aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [profile, setProfile] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.log('Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        if (!profile || profile.id !== session.user.id) {
            await fetchProfile(session.user.id);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
        
        // NOVO: Chama o registro de Notificações logo após carregar o perfil
        registerForPushNotificationsAsync(userId);
      }
    } catch (e) {
      console.log('Erro ao buscar perfil:', e);
    }
  };

  const refreshProfile = async () => {
      if (user) {
          await fetchProfile(user.id);
      }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // --- NOVO: GERADOR DE TOKEN DE NOTIFICAÇÃO ---
  const registerForPushNotificationsAsync = async (userId) => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4A373', // Cor da barbearia
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permissão para notificações negada pelo usuário.');
        return;
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: projectId, 
        })).data;
        
        // Salva o token no banco de dados na linha deste usuário
        if (token) {
          const { error } = await supabase
            .from('profiles')
            .update({ push_token: token })
            .eq('id', userId);
            
          if (error) console.log("Erro ao salvar token no Supabase:", error);
        }

      } catch (error) {
        console.log("Erro ao gerar Push Token:", error);
      }
    } else {
      console.log('Notificações só funcionam em celulares físicos (não funciona em emulador).');
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        profile, 
        loading, 
        signOut, 
        refreshProfile, 
        isAdmin: profile?.role === 'admin' 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);