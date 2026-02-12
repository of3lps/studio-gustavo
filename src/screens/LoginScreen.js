import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, 
  KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator, Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { supabase } from '../services/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Alternar entre Login e Cadastro

  // --- LOGIN REAL ---
  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Ops", "Preencha email e senha");
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Erro no Login", error.message);
      setLoading(false);
    }
    // Sucesso: O AuthContext detecta e muda a tela automaticamente
  };

  // --- CADASTRO REAL CORRIGIDO ---
  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert("Ops", "Preencha email e senha");
    
    setLoading(true);
    
    // CORREÇÃO AQUI: Removemos o envio de nome provisório.
    // O usuário será criado no banco com full_name: null e phone: null.
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Erro no Cadastro", error.message);
    } else {
      Alert.alert("Conta Criada!", "Faça login para continuar e completar seu perfil.");
      setIsSignUp(false); // Volta para a tela de login para ele entrar
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80' }} 
        style={styles.bgImage} 
      />
      <LinearGradient colors={['rgba(0,0,0,0.6)', '#121212']} style={styles.background} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        {/* LOGO */}
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="content-cut" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.logoTitle}>STUDIO <Text style={{color: COLORS.primary}}>GUSTAVO</Text></Text>
          <Text style={styles.logoSubtitle}>Barber Shop</Text>
        </View>

        {/* FORMULÁRIO */}
        <View style={styles.form}>
          <Text style={styles.headerForm}>{isSignUp ? "Crie sua conta" : "Bem-vindo de volta"}</Text>

          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color={COLORS.textSecondary} style={{marginRight: 10}} />
            <TextInput 
              placeholder="Email" 
              placeholderTextColor="#555"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color={COLORS.textSecondary} style={{marginRight: 10}} />
            <TextInput 
              placeholder="Senha" 
              placeholderTextColor="#555"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* BOTÃO DE AÇÃO */}
          <TouchableOpacity 
            style={styles.btnPrimary} 
            onPress={isSignUp ? handleSignUp : handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.btnText}>{isSignUp ? "CADASTRAR" : "ENTRAR"}</Text>
                <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>

          {/* ALTERNAR LOGIN/CADASTRO */}
          <TouchableOpacity 
            style={{alignItems: 'center', marginTop: 25}}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={{color: COLORS.textSecondary}}>
              {isSignUp ? "Já tem uma conta? " : "Não tem conta? "}
              <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>
                {isSignUp ? "Faça Login" : "Cadastre-se"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  bgImage: { position: 'absolute', width: '100%', height: '100%', opacity: 0.5 },
  background: { position: 'absolute', width: '100%', height: '100%', zIndex: 1 },
  content: { flex: 1, zIndex: 2, justifyContent: 'center', padding: 24 },
  
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(212, 163, 115, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: COLORS.primary },
  logoTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.textLight, letterSpacing: 2 },
  logoSubtitle: { fontSize: 12, color: COLORS.textSecondary, letterSpacing: 4, textTransform: 'uppercase', marginTop: 5 },

  form: { width: '100%', backgroundColor: 'rgba(18, 18, 18, 0.85)', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerForm: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', height: 56, borderRadius: 12, paddingHorizontal: 16, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  input: { flex: 1, color: COLORS.textLight, fontSize: 16 },
  
  btnPrimary: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});