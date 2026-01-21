import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { TODAY_APPOINTMENTS } from '../../data/mockData';

export default function AdminAgendaScreen() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('today'); // 'today' or 'all'

  useEffect(() => {
    // Simulando load
    setAppointments([...TODAY_APPOINTMENTS]);
  }, []);

  const handleStatusChange = (id, newStatus) => {
    const updated = appointments.map(a => a.id === id ? { ...a, status: newStatus } : a);
    setAppointments(updated);
    // Atualiza o global
    const idx = TODAY_APPOINTMENTS.findIndex(a => a.id === id);
    if(idx >= 0) TODAY_APPOINTMENTS[idx].status = newStatus;
  };

  const pending = appointments.filter(a => a.status === 'pending');
  // Filtra confirmados: Se o filtro for 'today', pega só dia 14 (mock), senão pega todos
  const confirmed = appointments.filter(a => a.status === 'confirmed' && (filter === 'all' || a.date === '2026-10-14'));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />
      
      {/* Header Simples */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda Operacional</Text>
        <Text style={styles.dateDisplay}>Hoje, 14 de Outubro</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* SEÇÃO CRÍTICA: PENDENTES */}
        {pending.length > 0 && (
          <View style={styles.alertSection}>
            <View style={styles.alertHeader}>
               <MaterialIcons name="notifications-active" size={20} color={COLORS.primary} />
               <Text style={styles.alertTitle}>Requer Atenção ({pending.length})</Text>
            </View>
            
            {pending.map(item => (
              <View key={item.id} style={styles.requestCard}>
                <View style={styles.requestRow}>
                   <View style={styles.dateBox}>
                      <Text style={styles.dateBoxDay}>{item.date.split('-')[2]}</Text>
                      <Text style={styles.dateBoxMonth}>OUT</Text>
                   </View>
                   <View style={{flex: 1, paddingHorizontal: 10}}>
                      <Text style={styles.clientName}>{item.client}</Text>
                      <Text style={styles.serviceDetail}>{item.service} • {item.time}</Text>
                   </View>
                   <Text style={styles.priceTag}>R$ {item.price}</Text>
                </View>
                
                <View style={styles.actions}>
                   <TouchableOpacity onPress={() => handleStatusChange(item.id, 'cancelled')} style={styles.btnDecline}>
                      <Text style={styles.btnTextDec}>Recusar</Text>
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => handleStatusChange(item.id, 'confirmed')} style={styles.btnAccept}>
                      <Text style={styles.btnTextAcc}>Aceitar</Text>
                   </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* SEÇÃO: AGENDA CONFIRMADA */}
        <View style={styles.filterRow}>
           <Text style={styles.sectionTitle}>Próximos Cortes</Text>
           <View style={styles.tabs}>
              <TouchableOpacity onPress={() => setFilter('today')}><Text style={[styles.tab, filter==='today' && styles.activeTab]}>Hoje</Text></TouchableOpacity>
              <Text style={{color:'#333'}}>|</Text>
              <TouchableOpacity onPress={() => setFilter('all')}><Text style={[styles.tab, filter==='all' && styles.activeTab]}>Todos</Text></TouchableOpacity>
           </View>
        </View>

        {confirmed.length === 0 ? (
           <Text style={styles.empty}>Nenhum corte confirmado para este período.</Text>
        ) : (
           confirmed.map(item => (
             <View key={item.id} style={styles.apptCard}>
                <Text style={styles.timeBig}>{item.time}</Text>
                <View style={styles.apptLine} />
                <View>
                   <Text style={styles.apptClient}>{item.client}</Text>
                   <Text style={styles.apptService}>{item.service}</Text>
                   {filter === 'all' && <Text style={styles.apptDate}>Dia {item.date.split('-')[2]}/10</Text>}
                </View>
             </View>
           ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: COLORS.surface },
  headerTitle: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold' },
  dateDisplay: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  
  alertSection: { marginBottom: 30 },
  alertHeader: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'center' },
  alertTitle: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  
  requestCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: COLORS.primary },
  requestRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  dateBox: { backgroundColor: '#333', borderRadius: 8, padding: 8, alignItems: 'center', width: 50 },
  dateBoxDay: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  dateBoxMonth: { color: '#ccc', fontSize: 10 },
  clientName: { color: COLORS.textLight, fontWeight: 'bold', fontSize: 16 },
  serviceDetail: { color: COLORS.textSecondary, fontSize: 14, marginTop: 2 },
  priceTag: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  
  actions: { flexDirection: 'row', gap: 10 },
  btnDecline: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#F44336', alignItems: 'center' },
  btnAccept: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#4CAF50', alignItems: 'center' },
  btnTextDec: { color: '#F44336', fontWeight: 'bold' },
  btnTextAcc: { color: 'white', fontWeight: 'bold' },

  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', gap: 10 },
  tab: { color: COLORS.textSecondary, fontWeight: 'bold' },
  activeTab: { color: COLORS.textLight },

  apptCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 15, borderRadius: 12, marginBottom: 10 },
  timeBig: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold', width: 60 },
  apptLine: { width: 2, height: '100%', backgroundColor: COLORS.surfaceHighlight, marginRight: 15 },
  apptClient: { color: COLORS.textLight, fontSize: 16, fontWeight: 'bold' },
  apptService: { color: COLORS.textSecondary, fontSize: 14 },
  apptDate: { color: COLORS.primary, fontSize: 12, marginTop: 2 },
  empty: { color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 20 }
});