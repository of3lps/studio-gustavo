import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function SuccessScreen({ navigation }) {
  const scaleValue = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(scaleValue, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.content}>
        {/* Ícone de Relógio/Ampulheta em vez de Check */}
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleValue }] }]}>
          <MaterialIcons name="hourglass-top" size={60} color={COLORS.background} />
        </Animated.View>

        <Text style={styles.title}>Solicitação Enviada!</Text>
        <Text style={styles.subTitle}>
          Recebemos seu pedido de horário.
        </Text>

        <View style={styles.card}>
            <View style={styles.row}>
                <MaterialIcons name="info" size={20} color={COLORS.primary} />
                <Text style={styles.cardText}>
                   O barbeiro Gustavo irá confirmar sua solicitação em breve.
                </Text>
            </View>
            <View style={[styles.row, {marginTop: 15}]}>
                <MaterialIcons name="notifications-active" size={20} color={COLORS.primary} />
                <Text style={styles.cardText}>
                   Você será notificado assim que o agendamento for aprovado.
                </Text>
            </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.btnHome}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
        >
          <Text style={styles.btnText}>VOLTAR AO INÍCIO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 30, shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 20 },
  title: { color: COLORS.textLight, fontSize: 28, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  subTitle: { color: COLORS.textSecondary, fontSize: 16, textAlign: 'center', maxWidth: '80%', marginBottom: 40 },
  card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardText: { color: COLORS.textLight, fontSize: 14, flex: 1, lineHeight: 20 },
  footer: { width: '100%', paddingBottom: 20 },
  btnHome: { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.textSecondary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: COLORS.textLight, fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }
});