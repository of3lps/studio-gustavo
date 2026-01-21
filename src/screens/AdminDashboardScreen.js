import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { ADMIN_STATS, TODAY_APPOINTMENTS } from '../data/mockData';

export default function AdminDashboardScreen({ navigation }) {
  // Estado local para permitir atualização da tela quando aceitar/recusar
  const [appointments, setAppointments] = useState([]);

  // Carrega os dados ao abrir a tela
  useEffect(() => {
    setAppointments([...TODAY_APPOINTMENTS]);
  }, []);

  // Função para Aprovar
  const handleApprove = (id) => {
    const updated = appointments.map(appt => {
      if (appt.id === id) return { ...appt, status: 'confirmed' };
      return appt;
    });
    setAppointments(updated);
    // Atualiza o "banco de dados" global também
    const globalIndex = TODAY_APPOINTMENTS.findIndex(a => a.id === id);
    if(globalIndex >= 0) TODAY_APPOINTMENTS[globalIndex].status = 'confirmed';
    
    Alert.alert("Sucesso", "Agendamento confirmado!");
  };

  // Função para Recusar
  const handleDecline = (id) => {
    const updated = appointments.map(appt => {
      if (appt.id === id) return { ...appt, status: 'cancelled' };
      return appt;
    });
    setAppointments(updated);
    const globalIndex = TODAY_APPOINTMENTS.findIndex(a => a.id === id);
    if(globalIndex >= 0) TODAY_APPOINTMENTS[globalIndex].status = 'cancelled';
  };

  // Filtros
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Painel Admin</Text>
          <Text style={styles.headerTitle}>Studio Gustavo</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        
        {/* Cards de Métricas */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Hoje</Text>
            <Text style={styles.statValue}>R$ {ADMIN_STATS.dailyRevenue}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Mês</Text>
            <Text style={styles.statValue}>R$ {ADMIN_STATS.monthlyRevenue}</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: COLORS.primary}]}>
            <Text style={[styles.statLabel, {color: 'rgba(255,255,255,0.8)'}]}>Pendentes</Text>
            <Text style={[styles.statValue, {color: 'white'}]}>{pendingAppointments.length}</Text>
          </View>
        </View>

        {/* SEÇÃO 1: SOLICITAÇÕES PENDENTES */}
        <Text style={styles.sectionTitle}>Solicitações Pendentes ({pendingAppointments.length})</Text>
        
        {pendingAppointments.length === 0 ? (
           <Text style={styles.emptyText}>Nenhuma solicitação nova.</Text>
        ) : (
           pendingAppointments.map((item) => (
            <View key={item.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={styles.timeText}>{item.time}</Text>
                <Text style={styles.priceText}>R$ {item.price}</Text>
              </View>
              <Text style={styles.clientName}>{item.client}</Text>
              <Text style={styles.serviceName}>{item.service}</Text>
              
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => handleDecline(item.id)} style={styles.btnDecline}>
                  <MaterialIcons name="close" size={20} color="#F44336" />
                  <Text style={styles.declineText}>Recusar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleApprove(item.id)} style={styles.btnApprove}>
                  <MaterialIcons name="check" size={20} color="white" />
                  <Text style={styles.approveText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* SEÇÃO 2: AGENDA CONFIRMADA */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Agenda Confirmada</Text>
        
        {confirmedAppointments.length === 0 ? (
            <Text style={styles.emptyText}>Agenda vazia.</Text>
        ) : (
            confirmedAppointments.map((item) => (
                <View key={item.id} style={styles.appointmentCard}>
                    <View style={styles.timeBox}>
                    <Text style={styles.timeTextDark}>{item.time}</Text>
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 12 }}>
                    <Text style={styles.clientName}>{item.client}</Text>
                    <Text style={styles.serviceName}>{item.service}</Text>
                    </View>
                    <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                </View>
            ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface },
  greeting: { color: COLORS.textSecondary, fontSize: 12, textTransform: 'uppercase' },
  headerTitle: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold' },
  logoutBtn: { padding: 8, backgroundColor: COLORS.surfaceHighlight, borderRadius: 8 },
  
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.surfaceHighlight },
  statLabel: { color: COLORS.textSecondary, fontSize: 10, marginBottom: 4, textTransform: 'uppercase', fontWeight: 'bold' },
  statValue: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold' },

  sectionTitle: { color: COLORS.textLight, fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  emptyText: { color: COLORS.textSecondary, fontStyle: 'italic', marginBottom: 10 },

  // Card de Solicitação Pendente (Destaque)
  requestCard: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.primary },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  timeText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  priceText: { color: COLORS.textLight, fontWeight: 'bold' },
  clientName: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  serviceName: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 15 },
  
  actionRow: { flexDirection: 'row', gap: 10 },
  btnApprove: { flex: 1, backgroundColor: '#4CAF50', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 8, gap: 5 },
  approveText: { color: 'white', fontWeight: 'bold' },
  btnDecline: { flex: 1, backgroundColor: 'rgba(244, 67, 54, 0.1)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 8, gap: 5, borderWidth: 1, borderColor: '#F44336' },
  declineText: { color: '#F44336', fontWeight: 'bold' },

  // Card de Agenda Confirmada (Mais simples)
  appointmentCard: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 12, borderRadius: 12, marginBottom: 10, alignItems: 'center', opacity: 0.8 },
  timeBox: { backgroundColor: COLORS.surfaceHighlight, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  timeTextDark: { color: COLORS.textLight, fontWeight: 'bold' }
});