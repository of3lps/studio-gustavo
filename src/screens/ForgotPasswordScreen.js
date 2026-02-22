import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { COLORS } from '../constants/theme'; 
import { supabase } from '../services/supabase'; 

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert("Atenção", "Por favor, digite seu e-mail.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      
      Alert.alert("E-mail Enviado!", "Verifique sua caixa de entrada (e o spam) para pegar o código.");
      setStep(2); 
    } catch (error) {
      Alert.alert("Erro", "Falha ao enviar e-mail. Verifique se o endereço está correto.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      Alert.alert("Atenção", "Preencha o código recebido e a nova senha.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Atenção", "A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // 1. Valida o código (o Supabase faz um login temporário aqui)
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      });

      if (verifyError) throw verifyError;

      // 2. Troca a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // 3. A CORREÇÃO: Mata a sessão temporária "zumbi" imediatamente!
      await supabase.auth.signOut();

      // 4. Manda o usuário para o Login de forma segura
      Alert.alert("Sucesso!", "Sua senha foi atualizada. Faça login novamente.", [
        { text: "Ir para Login", onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert("Erro", "Código inválido ou expirado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.textLight} style={{marginLeft: 6}} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
            <MaterialIcons name={step === 1 ? "mark-email-read" : "lock-reset"} size={40} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>{step === 1 ? 'Esqueceu a senha?' : 'Redefinir Senha'}</Text>
        <Text style={styles.subtitle}>
          {step === 1 
            ? 'Digite seu e-mail cadastrado e enviaremos um código de recuperação.' 
            : `Digite o código de 8 dígitos enviado para ${email} e crie sua nova senha.`}
        </Text>

        {step === 1 ? (
          <>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Seu e-mail"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSendCode} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>ENVIAR CÓDIGO</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <MaterialIcons name="dialpad" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Código de 8 dígitos"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
                maxLength={8}
                value={otp}
                onChangeText={setOtp}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nova senha"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleResetPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>SALVAR NOVA SENHA</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep(1)} disabled={loading}>
              <Text style={styles.secondaryBtnText}>Não recebeu? Tentar novamente</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 20, borderWidth: 1, borderColor: '#333', marginTop: 60, marginLeft: 20 },
  content: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', paddingBottom: 50 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(212, 163, 115, 0.1)', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20 },
  title: { color: COLORS.textLight, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 30, lineHeight: 20, paddingHorizontal: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, height: 55, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: COLORS.textLight, fontSize: 16 },
  primaryBtn: { backgroundColor: COLORS.primary, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  primaryBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  secondaryBtn: { marginTop: 20, alignItems: 'center' },
  secondaryBtnText: { color: COLORS.textSecondary, fontSize: 14, textDecorationLine: 'underline' }
});