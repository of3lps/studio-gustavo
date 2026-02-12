import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Dados da Autenticação (Email, UID)
  const [profile, setProfile] = useState(null); // Dados do Perfil (Nome, Telefone, Role, Pontos)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verifica sessão inicial ao abrir o app
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

    // 2. Escuta mudanças em tempo real (Login, Logout, Auto-Refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        // Se mudou o usuário, busca o perfil novo
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

  // Busca dados extras na tabela 'profiles'
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    } catch (e) {
      console.log('Erro ao buscar perfil:', e);
    }
  };

  // Função para a tela de Onboarding chamar quando o usuário salvar os dados
  const refreshProfile = async () => {
      if (user) {
          await fetchProfile(user.id);
      }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Os estados user e profile serão limpos automaticamente pelo onAuthStateChange
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