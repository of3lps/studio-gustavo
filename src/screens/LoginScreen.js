import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Simulação de Autenticação Simples
    if (email.toLowerCase() === 'admin@gustavo.com') {
      navigation.replace('AdminDashboard'); // Vai para área do Barbeiro
    } else {
      navigation.replace('Home'); // Vai para área do Cliente
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['rgba(0,0,0,0.8)', '#121212']} style={styles.background} />
      
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80' }} 
        style={styles.bgImage} 
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="content-cut" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.logoTitle}>STUDIO <Text style={{color: COLORS.primary}}>GUSTAVO</Text></Text>
          <Text style={styles.logoSubtitle}>Barber Shop</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color={COLORS.textSecondary} style={{marginRight: 10}} />
            <TextInput 
              placeholder="ex: cliente@email.com" 
              placeholderTextColor="#555"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color={COLORS.textSecondary} style={{marginRight: 10}} />
            <TextInput 
              placeholder="••••••" 
              placeholderTextColor="#555"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
            <Text style={styles.btnText}>ENTRAR</Text>
            <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity style={{alignItems: 'center', marginTop: 20}}>
            <Text style={{color: COLORS.textSecondary}}>Criar nova conta</Text>
          </TouchableOpacity>
        </View>

        {/* Dica para teste (Pode remover depois) */}
        <Text style={styles.hint}>Dica: Use "admin@gustavo.com" para ver a área do barbeiro.</Text>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  bgImage: { position: 'absolute', width: '100%', height: '50%', opacity: 0.4 },
  background: { position: 'absolute', width: '100%', height: '100%', zIndex: 1 },
  content: { flex: 1, zIndex: 2, justifyContent: 'flex-end', padding: 24, paddingBottom: 50 },
  
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.surfaceHighlight, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: COLORS.primary },
  logoTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.textLight, letterSpacing: 2 },
  logoSubtitle: { fontSize: 14, color: COLORS.textSecondary, letterSpacing: 4, textTransform: 'uppercase' },

  form: { width: '100%' },
  label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, height: 56, borderRadius: 12, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.surfaceHighlight },
  input: { flex: 1, color: COLORS.textLight, fontSize: 16 },
  
  btnPrimary: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  
  hint: { textAlign: 'center', color: '#444', marginTop: 40, fontSize: 10 }
});