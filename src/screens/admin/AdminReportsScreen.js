import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/theme';
import { HISTORY_APPOINTMENTS, TODAY_APPOINTMENTS } from '../../data/mockData';

export default function AdminReportsScreen() {
  // Estado das Datas (Padrão: Últimos 30 dias)
  const [startDate, setStartDate] = useState(new Date('2026-09-01')); // Fixo para teste
  const [endDate, setEndDate] = useState(new Date('2026-10-30'));
  
  // Controle do Picker (Modal de data)
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('start'); // 'start' ou 'end'

  // Estado dos Cálculos
  const [stats, setStats] = useState({
    totalRevenue: 0,
    confirmedCount: 0,
    cancelledCount: 0,
    servicesCount: 0,
    topClients: [],
    topServices: []
  });

  // Juntamos o histórico com os de hoje para analisar tudo
  const ALL_DATA = [...HISTORY_APPOINTMENTS, ...TODAY_APPOINTMENTS];

  // --- A MÁGICA: CÁLCULO DOS RELATÓRIOS ---
  useEffect(() => {
    calculateStats();
  }, [startDate, endDate]);

  const calculateStats = () => {
    // 1. Filtrar pelo período selecionado
    const filtered = ALL_DATA.filter(item => {
      const itemDate = new Date(item.date);
      // Zera as horas para comparar apenas dia/mês/ano
      const start = new Date(startDate).setHours(0,0,0,0);
      const end = new Date(endDate).setHours(23,59,59,999);
      const current = itemDate.setHours(12,0,0,0); 
      return current >= start && current <= end;
    });

    let revenue = 0;
    let confirmed = 0;
    let cancelled = 0;
    let servicesMap = {};
    let clientsMap = {};

    filtered.forEach(item => {
      if (item.status === 'confirmed') {
        revenue += item.price;
        confirmed += 1;

        // Contagem de Clientes
        clientsMap[item.client] = (clientsMap[item.client] || 0) + 1;

        // Contagem de Serviços (Separa "Corte + Barba" em 2 serviços)
        const feats = item.service.split('+').map(s => s.trim());
        feats.forEach(f => {
          servicesMap[f] = (servicesMap[f] || 0) + 1;
        });

      } else if (item.status === 'cancelled') {
        cancelled += 1;
      }
    });

    // Ordenar Top 3 Clientes
    const sortedClients = Object.entries(clientsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // Ordenar Top 3 Serviços
    const sortedServices = Object.entries(servicesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    setStats({
      totalRevenue: revenue,
      confirmedCount: confirmed,
      cancelledCount: cancelled,
      servicesCount: Object.values(servicesMap).reduce((a, b) => a + b, 0),
      topClients: sortedClients,
      topServices: sortedServices
    });
  };

  // --- FUNÇÕES DO PICKER ---
  const onChangeDate = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      if (pickerMode === 'start') setStartDate(selectedDate);
      else setEndDate(selectedDate);
    }
  };

  const openDatePicker = (mode) => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relatórios & Performance</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* SELETOR DE DATA */}
        <View style={styles.filterContainer}>
          <TouchableOpacity onPress={() => openDatePicker('start')} style={styles.dateBtn}>
             <Text style={styles.dateLabel}>DE</Text>
             <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          <MaterialIcons name="arrow-forward" size={20} color={COLORS.textSecondary} />
          <TouchableOpacity onPress={() => openDatePicker('end')} style={styles.dateBtn}>
             <Text style={styles.dateLabel}>ATÉ</Text>
             <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* CARDS PRINCIPAIS (FATURAMENTO) */}
        <View style={styles.revenueCard}>
           <Text style={styles.revenueLabel}>FATURAMENTO DO PERÍODO</Text>
           <Text style={styles.revenueValue}>R$ {stats.totalRevenue},00</Text>
        </View>

        <View style={styles.grid}>
           <View style={[styles.statBox, { backgroundColor: '#1E1E1E' }]}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.statNum}>{stats.confirmedCount}</Text>
              <Text style={styles.statText}>Agendamentos Confirmados</Text>
           </View>
           <View style={[styles.statBox, { backgroundColor: '#1E1E1E' }]}>
              <MaterialIcons name="content-cut" size={24} color={COLORS.primary} />
              <Text style={styles.statNum}>{stats.servicesCount}</Text>
              <Text style={styles.statText}>Serviços Realizados</Text>
           </View>
           <View style={[styles.statBox, { backgroundColor: '#2C1B1B' }]}>
              <MaterialIcons name="cancel" size={24} color="#F44336" />
              <Text style={[styles.statNum, {color: '#F44336'}]}>{stats.cancelledCount}</Text>
              <Text style={styles.statText}>Cancelamentos</Text>
           </View>
        </View>

        {/* TOP CLIENTES */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Top Clientes</Text>
            {stats.topClients.length === 0 ? <Text style={styles.empty}>Sem dados.</Text> : 
              stats.topClients.map((c, index) => (
                <View key={index} style={styles.rankRow}>
                    <Text style={styles.rankPos}>#{index + 1}</Text>
                    <Text style={styles.rankName}>{c.name}</Text>
                    <Text style={styles.rankValue}>{c.count} visitas</Text>
                </View>
              ))
            }
        </View>

        {/* TOP SERVIÇOS */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>✂️ Serviços Mais Pedidos</Text>
            {stats.topServices.length === 0 ? <Text style={styles.empty}>Sem dados.</Text> : 
              stats.topServices.map((s, index) => (
                <View key={index} style={styles.rankRow}>
                    <View style={{flex: 1}}>
                      <Text style={styles.rankName}>{s.name}</Text>
                      <View style={{height: 6, backgroundColor: '#333', borderRadius: 3, marginTop: 4, width: '80%'}}>
                          <View style={{height: 6, backgroundColor: COLORS.primary, borderRadius: 3, width: `${(s.count / stats.servicesCount) * 100}%`}} />
                      </View>
                    </View>
                    <Text style={styles.rankValue}>{s.count}</Text>
                </View>
              ))
            }
        </View>

      </ScrollView>

      {/* COMPONENTE INVISÍVEL DO DATE PICKER (Nativo) */}
      {showPicker && (
        <DateTimePicker
          value={pickerMode === 'start' ? startDate : endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
          maximumDate={new Date(2030, 11, 31)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: COLORS.surface },
  headerTitle: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold' },
  
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: 20 },
  dateBtn: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  dateLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold' },
  dateValue: { color: COLORS.textLight, fontSize: 16, fontWeight: 'bold' },

  revenueCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20, elevation: 5 },
  revenueLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  revenueValue: { color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 5 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  statBox: { width: '31%', padding: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statNum: { color: 'white', fontSize: 20, fontWeight: 'bold', marginVertical: 5 },
  statText: { color: COLORS.textSecondary, fontSize: 10, textAlign: 'center' },

  section: { marginBottom: 25 },
  sectionTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  rankRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  rankPos: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, width: 30 },
  rankName: { color: COLORS.textLight, fontWeight: 'bold', fontSize: 14, flex: 1 },
  rankValue: { color: COLORS.textSecondary, fontWeight: 'bold', fontSize: 14 },

  empty: { color: COLORS.textSecondary, fontStyle: 'italic' }
});